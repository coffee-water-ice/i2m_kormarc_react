/**
 * 평가시스템 진행 상황을 브라우저 localStorage에 남기는 체크포인트("A안").
 * i2m_kormarc/pages/3_평가시스템.py의 JSONL 파일 체크포인트(_checkpoint_path/
 * _init_checkpoint/_append_checkpoint/_load_checkpoint)를 흉내내되, 파일 시스템이
 * 아니라 localStorage 키 하나에 JSON 블롭 통째로 저장한다 — ISBN 하나 처리에
 * 수초~수십 초 걸리므로 매 건마다 전체를 다시 쓰는 비용은 무시할 만하다.
 *
 * "기존 I2M"은 이 프로젝트의 React 이식 범위에서 빠지므로 system은 항상 'advanced'
 * 하나뿐이다 — 원본의 system_slug 분기(고도화/기존)는 포팅하지 않는다.
 *
 * 나중에 "B안"(백엔드 job API)으로 옮겨갈 때는 이 파일 전체가 통째로 다른 구현으로
 * 바뀔 대상이다 — hooks/useEvalRun.ts 말고는 아무 데서도 이 모듈을 직접 import하지
 * 않는다(컴포넌트는 항상 useEvalRun()이 내려주는 상태만 본다).
 */

import type { ConvertMeta } from '../types/api'
import type { EvalRunResultEntry } from './evalColumns'

const KEY_PREFIX = 'i2m_eval_ckpt_v1:'

export interface EvalCheckpointMeta {
  system: 'advanced'
  total: number
  isbns: string[]
  createdAt: string
  updatedAt: string
}

export interface EvalCheckpoint {
  meta: EvalCheckpointMeta
  results: Record<string, EvalRunResultEntry>
}

export interface EvalCheckpointSummary {
  key: string
  meta: EvalCheckpointMeta
  doneCount: number
}

// meta에는 debug_lines처럼 건당 수십 KB짜리 값도 들어있어 통째로 저장하면 200건에
// 수 MB가 된다 — 채점에 실제로 쓰는 키만 남긴다(_META_KEEP_KEYS 포팅, "기존 I2M"
// 전용인 eval_elapsed_sec은 이 프로젝트 범위에서 아예 안 쓰니 제외).
const META_KEEP_KEYS = [
  'kdc_candidates', 'kdc_low_confidence', 'kdc_margin_ratio',
  'kdc_edition', 'kdc_reason', 'kdc_model_version', 'kdc_input_presence',
  'tag_056', 'tag_653', 'aladin_title', 'category_name',
  'gpt_called', 'token_usage', 'elapsed_ms', 'field_elapsed_ms', 'field_tokens',
  'bundle_source',
] as const

function slimMeta(meta: ConvertMeta | undefined): ConvertMeta {
  const src = (meta ?? {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of META_KEEP_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as ConvertMeta
}

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** (ISBN 목록)이 같으면 항상 같은 키를 가리키게 한다 — 스트림릿의 SHA1 해시 파일명
 * 방식과 동일한 목적(같은 입력으로 "생성 실행"을 다시 누르면 이전 체크포인트를
 * 자동으로 찾아 이어서 처리). "advanced|" 접두는 나중에 다른 종류의 배치 작업이
 * 같은 localStorage를 쓰게 되더라도 키가 안 겹치게 하기 위한 여유분이다. */
export async function computeCheckpointKey(isbns: string[]): Promise<string> {
  const keySource = 'advanced|' + [...isbns].sort().join(',')
  const digest12 = (await sha1Hex(keySource)).slice(0, 12)
  return `${KEY_PREFIX}${isbns.length}건_${digest12}`
}

export function loadCheckpoint(key: string): EvalCheckpoint | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as EvalCheckpoint
  } catch {
    return null
  }
}

function isQuotaExceeded(e: unknown): boolean {
  return e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
}

function saveCheckpoint(key: string, ckpt: EvalCheckpoint): { ok: boolean; quotaExceeded?: boolean } {
  try {
    localStorage.setItem(key, JSON.stringify(ckpt))
    return { ok: true }
  } catch (e) {
    return { ok: false, quotaExceeded: isQuotaExceeded(e) }
  }
}

/** 파일이 없을 때만 메타 정보를 써서 새로 만든다(원본의 _init_checkpoint와 동일하게,
 * 이미 있으면 — 즉 이어서 진행하는 상황이면 — 손대지 않고 그대로 반환). */
export function initCheckpoint(key: string, isbns: string[]): EvalCheckpoint {
  const existing = loadCheckpoint(key)
  if (existing) return existing
  const now = new Date().toISOString()
  const ckpt: EvalCheckpoint = {
    meta: { system: 'advanced', total: isbns.length, isbns, createdAt: now, updatedAt: now },
    results: {},
  }
  saveCheckpoint(key, ckpt)
  return ckpt
}

/** ISBN 한 건이 끝나는 즉시 호출 — meta는 슬림화해서 저장한다. 체크포인트 자체가
 * 없으면(키가 잘못됐거나 삭제된 경우) 그냥 실패로 반환하고 조용히 무시한다 — 호출부
 * (useEvalRun)가 메모리 상의 results는 이미 들고 있으므로 실행 자체는 안 끊긴다. */
export function appendCheckpointResult(
  key: string,
  entry: EvalRunResultEntry,
): { ok: boolean; quotaExceeded?: boolean } {
  const ckpt = loadCheckpoint(key)
  if (!ckpt) return { ok: false }
  ckpt.results[entry.isbn] = { ...entry, meta: slimMeta(entry.meta) }
  ckpt.meta.updatedAt = new Date().toISOString()
  return saveCheckpoint(key, ckpt)
}

/** localStorage에 있는 모든 평가 체크포인트를 최근 갱신 순으로 나열한다. */
export function listCheckpoints(): EvalCheckpointSummary[] {
  const out: EvalCheckpointSummary[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(KEY_PREFIX)) continue
    const ckpt = loadCheckpoint(key)
    if (!ckpt) continue
    out.push({ key, meta: ckpt.meta, doneCount: Object.keys(ckpt.results).length })
  }
  out.sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt))
  return out
}

export function deleteCheckpoint(key: string): void {
  localStorage.removeItem(key)
}

/** 가장 최근에 갱신됐고 아직 안 끝난(done < total) 체크포인트 하나 — 페이지 진입 시
 * "이어서 실행" 배너를 띄울지 판단하는 데 쓴다. */
export function findResumableCheckpoint(): EvalCheckpointSummary | null {
  return listCheckpoints().find((c) => c.doneCount < c.meta.total) ?? null
}

/** key로 저장된 체크포인트의 results를 원래 목표 ISBN 순서대로 정렬해 돌려준다 —
 * CSV 다운로드(진행 중이든 끝났든)에 쓴다. */
export function checkpointResultsInOrder(key: string): EvalRunResultEntry[] {
  const ckpt = loadCheckpoint(key)
  if (!ckpt) return []
  return ckpt.meta.isbns.map((isbn) => ckpt.results[isbn]).filter((e): e is EvalRunResultEntry => !!e)
}
