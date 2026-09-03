/**
 * 평가시스템의 "진행 상황을 만들어내는 부품" — A→B 전환 이음매.
 *
 * 지금(A안)은 모듈 레벨 싱글턴 스토어에서 ISBN을 순서대로 convertIsbn() 호출하는
 * for 루프를 돌리며 localStorage(lib/evalCheckpoint.ts)에 매 건 기록한다.
 * useSyncExternalStore로 컴포넌트에 연결해서, 컴포넌트가 언마운트됐다 다시
 * 마운트돼도(예: 홈으로 갔다가 /eval로 돌아옴) 같은 스토어를 구독하면 진행 중이던
 * 상태가 그대로 이어 보인다 — 루프 자체가 컴포넌트 생명주기가 아니라 모듈 스코프에
 * 살아있기 때문이다.
 *
 * 나중에 "B안"(백엔드 job API — POST /api/eval/start, GET /api/eval/jobs/{id} 폴링)
 * 으로 옮겨갈 때는 이 파일 내부(특히 runLoop/start/resume)만 폴링 로직으로 갈아끼우면
 * 된다 — EvalRunState의 모양(상태/필드 이름)과 이 파일을 쓰는 쪽(EvalSystem.tsx,
 * EvalCheckpointList.tsx)은 전혀 안 바뀐다. lib/evalCheckpoint.ts를 직접 import하는
 * 곳도 이 파일뿐이라, 그 모듈을 통째로 다른 구현으로 바꿔도 여기 말고는 손댈 데가 없다.
 */

import { useSyncExternalStore } from 'react'
import { convertIsbn, recheckOpenaiLive } from '../api/client'
import type { EvalRunResultEntry } from '../lib/evalColumns'
import {
  computeCheckpointKey,
  initCheckpoint,
  appendCheckpointResult,
  checkpointResultsInOrder,
  findResumableCheckpoint,
  deleteCheckpoint,
  type EvalCheckpointSummary,
} from '../lib/evalCheckpoint'

export type EvalRunStatus = 'idle' | 'preflight-blocked' | 'running' | 'paused' | 'stopped-gpt' | 'done'

export interface EvalRunState {
  status: EvalRunStatus
  total: number
  done: number
  results: EvalRunResultEntry[]
  blockDetail: string
  checkpointDegraded: boolean
  resumable: EvalCheckpointSummary | null
}

// _run_batch의 GPT_RECHECK_EVERY와 동일 — 이 정도 간격마다 크레딧 소진을 다시 확인한다.
const GPT_RECHECK_EVERY = 25

let state: EvalRunState = {
  status: 'idle',
  total: 0,
  done: 0,
  results: [],
  blockDetail: '',
  checkpointDegraded: false,
  resumable: findResumableCheckpoint(),
}

const listeners = new Set<() => void>()

function setState(patch: Partial<EvalRunState>) {
  state = { ...state, ...patch }
  for (const l of listeners) l()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): EvalRunState {
  return state
}

// 진행 중인 루프를 "무효화"하는 용도 — 새 start()나 reset()이 불리면 토큰을 올려서
// 이전 루프가 다음 반복에서 스스로 멈추게 한다(await 도중 다른 실행이 끼어드는 것 방지).
let runToken = 0
let pauseRequested = false

async function runLoop(isbns: string[], key: string, resultsSoFar: EvalRunResultEntry[]) {
  const myToken = runToken
  const results = [...resultsSoFar]
  let doneCount = results.length

  for (const isbn of isbns) {
    if (myToken !== runToken) return
    if (pauseRequested) {
      setState({ status: 'paused' })
      return
    }

    const cached = results.find((r) => r.isbn === isbn)
    let entry: EvalRunResultEntry
    if (cached) {
      entry = cached
    } else {
      const r = await convertIsbn(isbn)
      if (myToken !== runToken) return
      entry = { isbn, mrkText: r.mrk_text ?? '', error: r.error ?? '', meta: r.meta ?? {} }
      const write = appendCheckpointResult(key, entry)
      if (!write.ok && write.quotaExceeded) setState({ checkpointDegraded: true })
      results.push(entry)
    }
    doneCount++
    setState({ done: doneCount, results: [...results] })

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

/** "생성 실행"과 "이어서 실행" 둘 다 이 함수 하나로 처리한다 — 체크포인트가 이미
 * 있으면(=이어서 하는 상황) 그 안의 결과를 그대로 재사용하고 나머지만 호출한다. */
async function start(isbns: string[]): Promise<void> {
  runToken++
  pauseRequested = false
  const myToken = runToken

  const key = await computeCheckpointKey(isbns)
  if (myToken !== runToken) return

  const live = await recheckOpenaiLive()
  if (myToken !== runToken) return
  if (!live.ok) {
    setState({
      status: 'preflight-blocked',
      total: isbns.length,
      blockDetail: live.detail || 'OpenAI 연결을 확인할 수 없습니다.',
    })
    return
  }

  initCheckpoint(key, isbns)
  const resultsSoFar = checkpointResultsInOrder(key)

  setState({
    status: 'running',
    total: isbns.length,
    done: resultsSoFar.length,
    results: resultsSoFar,
    blockDetail: '',
    checkpointDegraded: false,
    resumable: null,
  })
  void runLoop(isbns, key, resultsSoFar)
}

function resume(): void {
  if (!state.resumable) return
  void start(state.resumable.meta.isbns)
}

function pause(): void {
  pauseRequested = true
}

function discardResumable(): void {
  if (state.resumable) deleteCheckpoint(state.resumable.key)
  setState({ resumable: findResumableCheckpoint() })
}

function reset(): void {
  runToken++
  pauseRequested = false
  setState({
    status: 'idle',
    total: 0,
    done: 0,
    results: [],
    blockDetail: '',
    checkpointDegraded: false,
    resumable: findResumableCheckpoint(),
  })
}

export interface EvalRunActions {
  start: (isbns: string[]) => void
  resume: () => void
  pause: () => void
  discardResumable: () => void
  reset: () => void
}

export function useEvalRun(): EvalRunState & EvalRunActions {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  return { ...snapshot, start, resume, pause, discardResumable, reset }
}

/** localStorage가 바뀐 뒤(예: EvalCheckpointList에서 다른 체크포인트를 삭제) idle
 * 상태의 resumable 배너를 다시 계산하고 싶을 때 컴포넌트에서 직접 부를 수 있게 export. */
export function refreshResumable(): void {
  if (state.status === 'idle') setState({ resumable: findResumableCheckpoint() })
}
