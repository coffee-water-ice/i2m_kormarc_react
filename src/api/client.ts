/**
 * FastAPI 백엔드(i2m_kormarc/app.py) 호출 모음.
 * i2m_kormarc/api_client.py(스트림릿용)와 1:1 대응되도록 함수명/역할을 맞췄다 —
 * 나중에 두 클라이언트를 나란히 두고 비교하기 쉽게 하기 위함.
 *
 * 개발 중에는 vite.config.ts의 proxy 설정이 /api, /health 를 로컬 백엔드(127.0.0.1:8000)로
 * 중계해주므로 baseUrl은 빈 문자열(same-origin)로 둔다. 배포 시에는 VITE_API_BASE_URL
 * 환경변수로 실제 백엔드 주소를 주입할 예정(.env.production 등, 아직 미설정).
 */

import type { ConvertResult, BatchResult, HealthStatus } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function url(path: string): string {
  return `${BASE_URL}${path}`
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(url('/health'))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      ok: true,
      detail: data.status ?? 'ok',
      version: data.version ?? null,
      secrets_configured: data.secrets_configured ?? null,
      openai_live: data.openai_live ?? null,
    }
  } catch (e) {
    return {
      ok: false,
      detail: e instanceof Error ? e.message : '백엔드 서버에 연결할 수 없습니다',
      version: null,
      secrets_configured: null,
      openai_live: null,
    }
  }
}

export interface ConvertIsbnOptions {
  regMark?: string
  regNo?: string
  copySymbol?: string
  useAi940?: boolean
}

export async function convertIsbn(
  isbn: string,
  opts: ConvertIsbnOptions = {},
): Promise<ConvertResult> {
  try {
    const res = await fetch(url('/api/convert'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isbn,
        reg_mark: opts.regMark ?? '',
        reg_no: opts.regNo ?? '',
        copy_symbol: opts.copySymbol ?? '',
        use_ai_940: opts.useAi940 ?? true,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      isbn: data.isbn ?? isbn,
      mrk_text: data.mrk_text ?? '',
      marc_bytes: data.marc_bytes_b64 ?? '',
      meta: data.meta ?? {},
      error: data.error ?? null,
    }
  } catch (e) {
    return {
      isbn,
      error: e instanceof Error ? `❌ 변환 실패: ${e.message}` : '❌ 변환 실패',
    }
  }
}

export interface MrkToMarcResult {
  marcBytesB64: string
  error: string | null
}

/**
 * mrk 텍스트를 진짜 바이너리 MARC(.mrc)로 (다시) 인코딩한다 — /api/convert가 변환
 * 시점에 한 번 내려주는 marc_bytes_b64는 그 시점 그대로라 이후 사서 편집 내용을
 * 반영 못 하는데, 이 함수는 "지금 화면에 있는 mrk 텍스트 그대로"를 보내 새로 인코딩
 * 받는다(백엔드의 /api/mrk-to-marc, core/marc_builder.mrk_str_to_field 재사용).
 */
export async function mrkToMarc(mrkText: string): Promise<MrkToMarcResult> {
  try {
    const res = await fetch(url('/api/mrk-to-marc'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mrk_text: mrkText }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.detail ?? `HTTP ${res.status}`)
    }
    const data = await res.json()
    return { marcBytesB64: data.marc_bytes_b64 ?? '', error: data.error ?? null }
  } catch (e) {
    return { marcBytesB64: '', error: e instanceof Error ? e.message : '.mrc 인코딩 실패' }
  }
}

export interface BatchJob {
  isbn: string
  regMark?: string
  regNo?: string
  copySymbol?: string
}

export async function convertBatch(jobs: BatchJob[]): Promise<ConvertResult[]> {
  try {
    const res = await fetch(url('/api/convert/batch'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobs: jobs.map((j) => ({
          isbn: j.isbn,
          reg_mark: j.regMark ?? '',
          reg_no: j.regNo ?? '',
          copy_symbol: j.copySymbol ?? '',
        })),
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: BatchResult = await res.json()
    return data.results ?? []
  } catch (e) {
    const msg = e instanceof Error ? `❌ 일괄 변환 실패: ${e.message}` : '❌ 일괄 변환 실패'
    return jobs.map((j) => ({ isbn: j.isbn, error: msg }))
  }
}
