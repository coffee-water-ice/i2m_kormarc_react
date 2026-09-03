/**
 * FastAPI 백엔드(i2m_kormarc/app.py)가 실제로 내려주는 응답 모양.
 * i2m_kormarc/api_client.py의 docstring + 2026-08-25 실제 변환 호출(ISBN 9791190406260)
 * 결과로 확인한 meta 키 목록을 기준으로 작성했다. 백엔드가 필드를 추가/제거하면 이 파일도
 * 같이 갱신해야 한다 — 백엔드 응답을 강제하는 스키마가 아니라 관찰 기반 타입이다.
 */

export interface KdcCandidate {
  kdc: string
  prob: number
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/** convert_isbn()/convert_batch() 결과의 meta 필드 — 실제 관찰된 키만 우선 반영, 필요시 확장 */
export interface ConvertMeta {
  isbn?: string
  aladin_title?: string
  bundle_source?: string
  category_id?: string
  category_name?: string
  place_display?: string
  publisher_raw?: string
  secondary_publisher?: string
  pubyear?: string
  translation_book?: boolean
  orig_title?: string
  orig_author_en?: string

  elapsed_ms?: number
  token_usage?: TokenUsage
  gpt_called?: boolean
  // 필드 단계별 소요시간(ms)/토큰 — 키는 app.py의 _step() 호출명과 동일
  // ("020","490_830","041_546","245","246_500_700_710_900","260","300","653","056").
  // 평가시스템 CSV의 EVAL_PERF_HEADERS가 이 두 필드에서 값을 가져온다.
  field_elapsed_ms?: Record<string, number>
  field_tokens?: Record<string, number>

  kdc_candidates?: KdcCandidate[]
  kdc_low_confidence?: boolean
  kdc_margin_ratio?: number
  kdc_edition?: string
  kdc_model_version?: string
  kdc_input_schema?: string
  kdc_input_fields?: string[]
  kdc_input_presence?: Record<string, boolean>
  kdc_reason?: string

  toc_text?: string
  illus_diagnosis?: string
  debug_lines?: string[]

  // 태그별 원본 조각(참고용) — tag_007, tag_008, tag_020 ...
  [key: `tag_${string}`]: string | undefined
}

export interface ConvertResult {
  isbn: string
  mrk_text?: string
  marc_bytes?: string // base64 원본 그대로 보관(다운로드 시에만 디코딩)
  meta?: ConvertMeta
  error?: string | null
}

export interface BatchResult {
  results: ConvertResult[]
}

export interface VersionInfo {
  deployed_at?: string
  commit?: string
  commit_message?: string
}

export interface OpenAiLiveStatus {
  ok: boolean
  code?: string
  detail?: string
  checked_at?: number
}

export interface HealthStatus {
  ok: boolean
  detail: string
  version: VersionInfo | null
  secrets_configured: Record<string, boolean> | null
  openai_live: OpenAiLiveStatus | null
}
