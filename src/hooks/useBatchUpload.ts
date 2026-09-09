/**
 * 일괄 업로드(엑셀 → ISBN 순차 변환 → 049 자동 적용)의 "진행 상황을 만들어내는 부품".
 * hooks/useEvalRun.ts(평가시스템)와 같은 모듈 레벨 싱글턴 + 순차 루프 + localStorage
 * 체크포인트 구조를 쓰지만, 평가시스템과 달리 "실행이 하나만 있다"고 가정하지 않는다 —
 * 사서가 여러 번 배치를 올릴 수 있고(각각 다른 등록구분/등록번호 묶음), 완료된 배치도
 * 나중에 "일괄 저장" 화면에서 다시 골라 저장할 수 있어야 하므로 실행 하나하나를
 * BatchRun 객체로 남긴다 — "새 배치 시작"은 activeRunId만 비울 뿐 지난 실행 기록은
 * 지우지 않는다(세션이 끝나면 사라지는 건 history와 동일 — 새로고침 이후 재개는
 * lib/batchCheckpoint.ts의 별도 localStorage 체크포인트가 담당).
 *
 * 이 훅 자체는 React 컨텍스트(사이드바 변환 내역)를 전혀 모른다 — entries[].record로
 * 완성된 HistoryRecord를 노출만 하고, 그걸 실제 전역 history 배열에 밀어 넣는 건
 * BatchUploadModal이 지켜보다가 setHistory로 반영한다. "일괄 저장" 화면(BatchSaveModal)은
 * entries[].record.uid로 지금 history의 최신(=편집 후 저장된) 상태를 다시 찾아서
 * 내보낸다 — 배치 직후의 스냅숏이 아니라 사서가 고친 내용을 반영하기 위함.
 */
import { useSyncExternalStore } from 'react'
import { convertIsbn, recheckOpenaiLive } from '../api/client'
import type { HistoryRecord } from '../types/history'
import { buildHistoryRecord } from '../lib/historyRecord'
import type { UploadRow } from '../lib/excelUpload'
import {
  computeBatchCheckpointKey,
  initBatchCheckpoint,
  appendBatchCheckpointResult,
  batchCheckpointResultsInOrder,
  findResumableBatchCheckpoint,
  deleteBatchCheckpoint,
  type BatchCheckpointSummary,
  type BatchResultEntry,
} from '../lib/batchCheckpoint'

export type BatchUploadStatus = 'idle' | 'preflight-blocked' | 'running' | 'paused' | 'stopped-gpt' | 'done'

export interface BatchUploadEntry {
  row: UploadRow
  record: HistoryRecord | null // 변환 성공 시에만 채워짐
  error: string
}

/** 실행 한 번(엑셀 업로드 한 번) — "일괄 저장" 화면이 목록으로 보여주는 단위. */
export interface BatchRun {
  id: string // computeBatchCheckpointKey와 동일 — 같은 행 조합을 다시 올리면 같은 실행으로 합쳐진다.
  createdAt: string
  updatedAt: string
  status: BatchUploadStatus
  total: number
  done: number
  rows: UploadRow[]
  entries: BatchUploadEntry[]
  blockDetail: string
}

export interface BatchUploadState {
  runs: BatchRun[] // 생성 순 — 진행 중/일시정지/완료/중단 다 포함, 지난 실행도 안 지워짐.
  activeRunId: string | null // 지금 업로드 모달이 보여주고 있는(또는 마지막으로 다룬) 실행.
  checkpointDegraded: boolean
  resumable: BatchCheckpointSummary | null
}

// useEvalRun.ts의 GPT_RECHECK_EVERY와 동일한 안전장치.
const GPT_RECHECK_EVERY = 25

function entryFromCheckpointResult(row: UploadRow, r: BatchResultEntry): BatchUploadEntry {
  if (r.result.error) return { row, record: null, error: r.result.error }
  return { row, record: buildHistoryRecord(r.result, row.regMark + row.regNo), error: '' }
}

let state: BatchUploadState = {
  runs: [],
  activeRunId: null,
  checkpointDegraded: false,
  resumable: findResumableBatchCheckpoint(),
}

const listeners = new Set<() => void>()

function setState(patch: Partial<BatchUploadState>) {
  state = { ...state, ...patch }
  for (const l of listeners) l()
}

function updateRun(id: string, patch: Partial<BatchRun>) {
  setState({
    runs: state.runs.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r)),
  })
}

function getRun(id: string): BatchRun | undefined {
  return state.runs.find((r) => r.id === id)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): BatchUploadState {
  return state
}

// runId별로 무효화 토큰을 둬서, 같은 실행을 다시 start()했을 때 이전 루프가 계속
// 돌다가 새 루프와 충돌하는 것을 막는다(useEvalRun의 전역 runToken과 같은 목적이지만
// 실행이 여러 개 있을 수 있어 실행별로 갖는다).
const runTokens = new Map<string, number>()
let pauseRequested = false

async function runLoop(runId: string, rows: UploadRow[], checkpointKey: string, entriesSoFar: BatchUploadEntry[]) {
  const myToken = runTokens.get(runId)
  const entries = [...entriesSoFar]
  let doneCount = entries.length

  for (const row of rows) {
    if (runTokens.get(runId) !== myToken) return
    if (pauseRequested) {
      updateRun(runId, { status: 'paused' })
      return
    }

    const cached = entries.find((e) => e.row.isbn === row.isbn)
    let entry: BatchUploadEntry
    if (cached) {
      entry = cached
    } else {
      const r = await convertIsbn(row.isbn)
      if (runTokens.get(runId) !== myToken) return
      const write = appendBatchCheckpointResult(checkpointKey, { isbn: row.isbn, result: r })
      if (!write.ok && write.quotaExceeded) setState({ checkpointDegraded: true })
      entry = entryFromCheckpointResult(row, { isbn: row.isbn, result: r })
      entries.push(entry)
    }
    doneCount++
    updateRun(runId, { done: doneCount, entries: [...entries] })

    if (doneCount % GPT_RECHECK_EVERY === 0) {
      const live = await recheckOpenaiLive()
      if (runTokens.get(runId) !== myToken) return
      if (!live.ok) {
        updateRun(runId, { status: 'stopped-gpt', blockDetail: live.detail || 'OpenAI 호출이 실패했습니다.' })
        return
      }
    }
  }
  updateRun(runId, { status: 'done' })
}

/** "확인"과 "이어서 실행"·"다시 시도"·"재개" 전부 이 함수 하나로 처리한다 — 체크포인트
 * (또는 이미 있는 BatchRun)에 저장된 결과를 재사용하고 나머지만 호출한다. rows가 이전에
 * 만든 실행과 같은 조합(같은 checkpointKey)이면 새 실행을 만들지 않고 그 실행을 이어간다
 * — "다시 시도"/"재개"가 곧 같은 rows로 다시 start()를 부르는 것뿐이라 자연스럽게
 * 하나로 합쳐진다. */
async function start(rows: UploadRow[]): Promise<void> {
  const checkpointKey = await computeBatchCheckpointKey(rows)
  const runId = checkpointKey
  pauseRequested = false
  const myToken = (runTokens.get(runId) ?? 0) + 1
  runTokens.set(runId, myToken)

  const existing = getRun(runId)
  if (!existing) {
    const now = new Date().toISOString()
    setState({
      runs: [
        ...state.runs,
        { id: runId, createdAt: now, updatedAt: now, status: 'idle', total: rows.length, done: 0, rows, entries: [], blockDetail: '' },
      ],
      activeRunId: runId,
    })
  } else {
    setState({ activeRunId: runId })
  }

  const live = await recheckOpenaiLive()
  if (runTokens.get(runId) !== myToken) return
  if (!live.ok) {
    updateRun(runId, { status: 'preflight-blocked', blockDetail: live.detail || 'OpenAI 연결을 확인할 수 없습니다.' })
    return
  }

  initBatchCheckpoint(checkpointKey, rows)
  const resultsSoFar = batchCheckpointResultsInOrder(checkpointKey)
  const rowByIsbn = new Map(rows.map((r) => [r.isbn, r]))
  // 같은 실행을 이 세션 안에서 다시 start()하는 경우(재시도/재개/모달 재오픈)라면
  // 이미 만들어둔 entry(그리고 그 안의 record.uid)를 그대로 재사용한다 — 매번
  // buildHistoryRecord를 새로 불러 uid가 계속 바뀌면, "이미 사이드바에 반영했는지"
  // 판단 기준(uid)이 매번 달라져서 같은 ISBN이 사이드바에 중복으로 쌓이는 버그가
  // 있었다(React key 중복 경고로 실제 발견). 새로고침 뒤라 이 세션에 아직 없는
  // 실행(existing===undefined)일 때만 체크포인트에서 새로 조립한다.
  const existingByIsbn = new Map((existing?.entries ?? []).map((e) => [e.row.isbn, e]))
  const entriesSoFar = resultsSoFar
    .map((r) => {
      const reused = existingByIsbn.get(r.isbn)
      if (reused) return reused
      const row = rowByIsbn.get(r.isbn)
      return row ? entryFromCheckpointResult(row, r) : null
    })
    .filter((e): e is BatchUploadEntry => !!e)

  updateRun(runId, {
    status: 'running',
    done: entriesSoFar.length,
    entries: entriesSoFar,
    blockDetail: '',
  })
  setState({ checkpointDegraded: false, resumable: null })
  void runLoop(runId, rows, checkpointKey, entriesSoFar)
}

function resume(): void {
  if (!state.resumable) return
  void start(state.resumable.meta.rows)
}

function pause(): void {
  pauseRequested = true
}

function discardResumable(): void {
  if (state.resumable) deleteBatchCheckpoint(state.resumable.key)
  setState({ resumable: findResumableBatchCheckpoint() })
}

/** "새 배치 시작" — 지금 활성 실행을 비워 업로드 모달이 새 파일 선택 화면으로
 * 돌아가게 한다. 지난 실행(runs)은 지우지 않는다 — "일괄 저장" 화면에서 계속 고를
 * 수 있어야 하기 때문. */
function startNewBatch(): void {
  setState({ activeRunId: null })
}

export interface BatchUploadActions {
  start: (rows: UploadRow[]) => void
  resume: () => void
  pause: () => void
  discardResumable: () => void
  startNewBatch: () => void
}

/** 지금 활성 실행(없으면 빈 값) — BatchUploadModal이 구독한다. */
export function useBatchUpload(): BatchUploadState & { active: BatchRun | null } & BatchUploadActions {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  const active = snapshot.activeRunId ? (snapshot.runs.find((r) => r.id === snapshot.activeRunId) ?? null) : null
  return { ...snapshot, active, start, resume, pause, discardResumable, startNewBatch }
}
