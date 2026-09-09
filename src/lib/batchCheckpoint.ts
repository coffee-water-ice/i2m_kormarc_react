/**
 * 일괄 업로드(useBatchUpload.ts) 진행 상황을 브라우저 localStorage에 남기는
 * 체크포인트 — evalCheckpoint.ts(평가시스템)와 같은 목적·같은 구조지만 저장 내용이
 * 다르다: 평가시스템은 CSV 채점에만 쓸 mrk_text/meta만 있으면 되는 반면, 여기는
 * 재개 시 "사서편집에서 바로 열어 고칠 수 있는 실제 HistoryRecord"를 다시 만들 수
 * 있어야 한다 — 그래서 ConvertResult를 통째로(문서 텍스트까지) 보관한다. SHA-1 키
 * 계산·meta 슬림화 규칙은 evalCheckpoint.ts의 것을 그대로 가져다 쓴다(중복 방지).
 *
 * 최대 10건(batchConfig.ts)까지만 다루므로 evalCheckpoint.ts(최대 200건)만큼
 * localStorage 용량을 걱정할 필요는 없지만, 그래도 debug_lines 같은 큰 필드는
 * 똑같이 슬림화해서 저장한다.
 */
import type { ConvertResult } from '../types/api'
import { sha1Hex, slimMeta } from './evalCheckpoint'
import type { UploadRow } from './excelUpload'

const KEY_PREFIX = 'i2m_batch_ckpt_v1:'

export interface BatchCheckpointMeta {
  total: number
  rows: UploadRow[]
  createdAt: string
  updatedAt: string
}

export interface BatchResultEntry {
  isbn: string
  result: ConvertResult
}

export interface BatchCheckpoint {
  meta: BatchCheckpointMeta
  results: Record<string, BatchResultEntry>
}

export interface BatchCheckpointSummary {
  key: string
  meta: BatchCheckpointMeta
  doneCount: number
}

/** rows(행 목록)가 같으면 항상 같은 키를 가리키게 한다 — evalCheckpoint의
 * computeCheckpointKey와 같은 목적. "batch|" 접두로 평가시스템 체크포인트와
 * localStorage 안에서 절대 안 섞이게 한다(어차피 KEY_PREFIX 자체가 다르지만,
 * 해시 소스에도 명시해 이중으로 분리). 행 순서가 곧 처리 순서이므로 정렬하지
 * 않고 그대로 이어붙인다(정렬하면 같은 조합이라도 업로드 순서가 다르면 다른
 * 키가 돼야 하는데, evalCheckpoint처럼 정렬해버리면 실행 순서가 달라도 같은
 * 키로 취급돼 버려서 여기선 맞지 않다).
 */
export async function computeBatchCheckpointKey(rows: UploadRow[]): Promise<string> {
  const keySource = 'batch|' + rows.map((r) => `${r.regMark}${r.regNo}${r.isbn}`).join('|')
  const digest12 = (await sha1Hex(keySource)).slice(0, 12)
  return `${KEY_PREFIX}${rows.length}건_${digest12}`
}

export function loadBatchCheckpoint(key: string): BatchCheckpoint | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as BatchCheckpoint
  } catch {
    return null
  }
}

function isQuotaExceeded(e: unknown): boolean {
  return e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
}

function saveBatchCheckpoint(key: string, ckpt: BatchCheckpoint): { ok: boolean; quotaExceeded?: boolean } {
  try {
    localStorage.setItem(key, JSON.stringify(ckpt))
    return { ok: true }
  } catch (e) {
    return { ok: false, quotaExceeded: isQuotaExceeded(e) }
  }
}

export function initBatchCheckpoint(key: string, rows: UploadRow[]): BatchCheckpoint {
  const existing = loadBatchCheckpoint(key)
  if (existing) return existing
  const now = new Date().toISOString()
  const ckpt: BatchCheckpoint = {
    meta: { total: rows.length, rows, createdAt: now, updatedAt: now },
    results: {},
  }
  saveBatchCheckpoint(key, ckpt)
  return ckpt
}

export function appendBatchCheckpointResult(
  key: string,
  entry: BatchResultEntry,
): { ok: boolean; quotaExceeded?: boolean } {
  const ckpt = loadBatchCheckpoint(key)
  if (!ckpt) return { ok: false }
  ckpt.results[entry.isbn] = { isbn: entry.isbn, result: { ...entry.result, meta: slimMeta(entry.result.meta) } }
  ckpt.meta.updatedAt = new Date().toISOString()
  return saveBatchCheckpoint(key, ckpt)
}

export function listBatchCheckpoints(): BatchCheckpointSummary[] {
  const out: BatchCheckpointSummary[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(KEY_PREFIX)) continue
    const ckpt = loadBatchCheckpoint(key)
    if (!ckpt) continue
    out.push({ key, meta: ckpt.meta, doneCount: Object.keys(ckpt.results).length })
  }
  out.sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt))
  return out
}

export function deleteBatchCheckpoint(key: string): void {
  localStorage.removeItem(key)
}

/** 가장 최근에 갱신됐고 아직 안 끝난(done < total) 체크포인트 — idle 상태에서
 * "이어서 실행" 배너를 띄울지 판단하는 데 쓴다. */
export function findResumableBatchCheckpoint(): BatchCheckpointSummary | null {
  return listBatchCheckpoints().find((c) => c.doneCount < c.meta.total) ?? null
}

/** key로 저장된 체크포인트의 results를 원래 업로드 행 순서대로 정렬해 돌려준다. */
export function batchCheckpointResultsInOrder(key: string): BatchResultEntry[] {
  const ckpt = loadBatchCheckpoint(key)
  if (!ckpt) return []
  return ckpt.meta.rows.map((row) => ckpt.results[row.isbn]).filter((e): e is BatchResultEntry => !!e)
}
