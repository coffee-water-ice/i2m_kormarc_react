/**
 * 일괄 업로드(엑셀 → ISBN 순차 변환 → 049 자동 적용)의 "진행 상황을 만들어내는 부품".
 * hooks/useEvalRun.ts(평가시스템)와 구조가 거의 동일한 모듈 레벨 싱글턴 + 순차 루프 +
 * localStorage 체크포인트다 — 다른 점은 CSV 행이 아니라 곧바로 편집 가능한
 * HistoryRecord를 만들어낸다는 것뿐이다. useSyncExternalStore로 컴포넌트에 연결해서
 * BatchUploadModal이 닫혔다 열려도(또는 언마운트됐다 다시 마운트돼도) 진행 중이던
 * 배치가 그대로 이어 보인다.
 *
 * 이 훅 자체는 React 컨텍스트(사이드바 변환 내역)를 전혀 모른다 — entries[].record로
 * 완성된 HistoryRecord를 노출만 하고, 그걸 실제 전역 history 배열에 밀어 넣는 건
 * BatchUploadModal이 entries 변화를 지켜보다가 setHistory로 반영한다(훅을 순수하게
 * 유지해서 나중에 재사용/테스트하기 쉽게 하기 위함 — useEvalRun과 같은 이유).
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

export interface BatchUploadState {
  status: BatchUploadStatus
  total: number
  done: number
  entries: BatchUploadEntry[]
  blockDetail: string
  checkpointDegraded: boolean
  resumable: BatchCheckpointSummary | null
  // 지금 실행(또는 방금 끝난 실행) 대상 행 전체 목록 — 일시정지 중 "재개"를 누를 때
  // 다시 넘길 대상. 모달 컴포넌트 자신의 로컬 state(rows)에 기대면 모달을 닫았다
  // 다시 열었을 때(리마운트) 사라져버리므로, 훅 쪽 상태에 같이 들고 있는다.
  rows: UploadRow[]
}

// useEvalRun.ts의 GPT_RECHECK_EVERY와 동일한 안전장치 — 지금 MAX_BATCH_SIZE(10)보다
// 크므로 사실상 안 걸리지만, 나중에 최대 건수를 올릴 걸 감안해 똑같이 넣어둔다.
const GPT_RECHECK_EVERY = 25

function entryFromCheckpointResult(row: UploadRow, r: BatchResultEntry): BatchUploadEntry {
  if (r.result.error) return { row, record: null, error: r.result.error }
  return { row, record: buildHistoryRecord(r.result, row.regMark + row.regNo), error: '' }
}

let state: BatchUploadState = {
  status: 'idle',
  total: 0,
  done: 0,
  entries: [],
  blockDetail: '',
  checkpointDegraded: false,
  resumable: findResumableBatchCheckpoint(),
  rows: [],
}

const listeners = new Set<() => void>()

function setState(patch: Partial<BatchUploadState>) {
  state = { ...state, ...patch }
  for (const l of listeners) l()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): BatchUploadState {
  return state
}

let runToken = 0
let pauseRequested = false

async function runLoop(rows: UploadRow[], key: string, entriesSoFar: BatchUploadEntry[]) {
  const myToken = runToken
  const entries = [...entriesSoFar]
  let doneCount = entries.length

  for (const row of rows) {
    if (myToken !== runToken) return
    if (pauseRequested) {
      setState({ status: 'paused' })
      return
    }

    const cached = entries.find((e) => e.row.isbn === row.isbn)
    let entry: BatchUploadEntry
    if (cached) {
      entry = cached
    } else {
      const r = await convertIsbn(row.isbn)
      if (myToken !== runToken) return
      const write = appendBatchCheckpointResult(key, { isbn: row.isbn, result: r })
      if (!write.ok && write.quotaExceeded) setState({ checkpointDegraded: true })
      entry = entryFromCheckpointResult(row, { isbn: row.isbn, result: r })
      entries.push(entry)
    }
    doneCount++
    setState({ done: doneCount, entries: [...entries] })

    if (doneCount % GPT_RECHECK_EVERY === 0) {
      const live = await recheckOpenaiLive()
      if (myToken !== runToken) return
      if (!live.ok) {
        setState({ status: 'stopped-gpt', blockDetail: live.detail || 'OpenAI 호출이 실패했습니다.' })
        return
      }
    }
  }
  setState({ status: 'done' })
}

/** "확인"과 "이어서 실행" 둘 다 이 함수 하나로 처리한다(useEvalRun.start와 동일한
 * 이유) — 체크포인트가 이미 있으면 그 안의 결과를 재사용하고 나머지만 호출한다. */
async function start(rows: UploadRow[]): Promise<void> {
  runToken++
  pauseRequested = false
  const myToken = runToken

  const key = await computeBatchCheckpointKey(rows)
  if (myToken !== runToken) return

  const live = await recheckOpenaiLive()
  if (myToken !== runToken) return
  if (!live.ok) {
    setState({
      status: 'preflight-blocked',
      total: rows.length,
      blockDetail: live.detail || 'OpenAI 연결을 확인할 수 없습니다.',
      rows,
    })
    return
  }

  initBatchCheckpoint(key, rows)
  const resultsSoFar = batchCheckpointResultsInOrder(key)
  const rowByIsbn = new Map(rows.map((r) => [r.isbn, r]))
  const entriesSoFar = resultsSoFar
    .map((r) => {
      const row = rowByIsbn.get(r.isbn)
      return row ? entryFromCheckpointResult(row, r) : null
    })
    .filter((e): e is BatchUploadEntry => !!e)

  setState({
    status: 'running',
    total: rows.length,
    done: entriesSoFar.length,
    entries: entriesSoFar,
    blockDetail: '',
    checkpointDegraded: false,
    resumable: null,
    rows,
  })
  void runLoop(rows, key, entriesSoFar)
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

function reset(): void {
  runToken++
  pauseRequested = false
  setState({
    status: 'idle',
    total: 0,
    done: 0,
    entries: [],
    blockDetail: '',
    checkpointDegraded: false,
    resumable: findResumableBatchCheckpoint(),
    rows: [],
  })
}

export interface BatchUploadActions {
  start: (rows: UploadRow[]) => void
  resume: () => void
  pause: () => void
  discardResumable: () => void
  reset: () => void
}

export function useBatchUpload(): BatchUploadState & BatchUploadActions {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  return { ...snapshot, start, resume, pause, discardResumable, reset }
}
