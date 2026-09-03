/**
 * 평가시스템 CSV 컬럼 스펙 + 한 ISBN 결과를 한 행으로 펼치는 로직.
 * i2m_kormarc/pages/3_평가시스템.py의 FIXED_HEADERS/EVAL_056_HEADERS/EVAL_PERF_HEADERS/
 * EVAL_SOURCE_HEADERS와 _column_spec/_normalize_row/_build_dataframe을 글자 하나 안
 * 틀리고 포팅했다 — "기존 I2M"(is_legacy) 분기는 이 프로젝트의 React 이식 범위에서
 * 아예 빠지므로(스트림릿 전용으로 남음) 전부 제외했다.
 *
 * 원본은 raw mrk 텍스트를 직접 재파싱하지만(_parse_mrk_fields), 여기서는 이미 있는
 * lib/mrk.ts의 parseMrkText()를 재사용해서 MrkField[] 위에서 컬럼을 채운다 — 파싱
 * 로직을 두 번 짤 이유가 없고, LDR 줄은 parseMrkText도 원본 파서도 둘 다 버리므로
 * 손실도 없다.
 */

import type { ConvertMeta } from '../types/api'
import type { MrkField, MrkSubfield } from '../types/mrk'
import { parseMrkText } from './mrk'

// ── 고정 CSV 헤더 — 산출결과.csv 그대로 (34개. 원본 파이썬 주석은 "33개"라고
// 적혀있지만 실제 리스트 리터럴을 세어보면 34개다 — EVAL_056_HEADERS가 "10개"라고
// 적혀있지만 실제로는 12개인 것과 같은 종류의 문서-코드 불일치. 코드(리스트 자체)를
// 기준으로 그대로 옮겼다.) ──────────────────────────────────────────
export const FIXED_HEADERS: string[] = [
  'no.', 'isbn', '007', '008',
  '020  $a', '020  $g', '020  $c', '02010$a',
  '041 $a', '041 $h',
  '056 $a',
  '245 $a', '245 $b', '245 $d', '245 $e',
  '246 $a',
  '260 $a', '260 $b', '260 $c',
  '300 $a', '300 $b', '300 $c',
  '490 $a', '490 $v',
  '500 $a',
  '546 $a',
  '653 $a',
  '700 $a',
  '710 $a',
  '830 $a', '830 $v',
  '900 $a',
  '940 $a',
  '950 $b',
]

// ── 056 평가 전용 컬럼(12개) — 원본 docstring은 "10개"라고 적혀있지만
// 실제 코드 리터럴은 12개다. 코드를 기준으로 그대로 옮겼다. ────────────
export const EVAL_056_HEADERS: string[] = [
  '056 2순위', '056 3순위',
  '056 1위확률', '056 2위확률',
  '056 1·2위비율', '056 검토필요(1/0)',
  '056 653유무(1/0)', '056 목차유무(1/0)', '056 책소개유무(1/0)',
  '056 미생성사유',
  'GPT호출(1/0)', 'GPT토큰',
]

// app.py의 _run_conversion()이 9단계로 나눠 meta.field_elapsed_ms/field_tokens에
// 담아주는 키 → 사람이 읽는 라벨. 순서가 곧 CSV 컬럼 순서다.
const FIELD_STEP_LABELS: [key: string, label: string][] = [
  ['020', '020'],
  ['490_830', '490·830'],
  ['041_546', '041·546'],
  ['245', '245'],
  ['246_500_700_710_900', '246·500·700·710·900'],
  ['260', '260'],
  ['300', '300'],
  ['653', '653'],
  ['056', '056'],
]

// 소요시간(초) + 9단계 × (소요(ms)/토큰) = 19개
export const EVAL_PERF_HEADERS: string[] = [
  '소요시간(초)',
  ...FIELD_STEP_LABELS.flatMap(([, label]) => [`${label} 소요(ms)`, `${label} 토큰`]),
]

export const EVAL_SOURCE_HEADERS: string[] = ['260 발행지 출처']

// pages/1_2026_ISBN_변환.py의 _SOURCE_LABEL과 같은 매핑(페이지끼리 import하지 않는
// 이 프로젝트 관례상 원본도 의도적으로 중복시켜 뒀다 — 여기도 그대로 옮긴다).
const SOURCE_LABEL: Record<string, string> = {
  ISBN_PREFIX_DB: '📖 ISBN발행자번호-발행지 연결표',
  'KPIPA_API→DB': '🔗 KPIPA API → 발행처명-주소 연결표',
  'ALADIN→DB': '📚 알라딘 → 발행처명-주소 연결표',
  'ALADIN→IMPRINT→DB': '📚 알라딘 → 임프린트 → 발행처명-주소 연결표',
  'ALADIN→IMPRINT→MOIS': '🏛️ 알라딘 → 임프린트 → 행정안전부 API',
  'ALADIN(음차)→DB': '🔤 알라딘(영문→한글 음차) → 발행처명-주소 연결표',
  'ALADIN(음차)→MOIS': '🔤 알라딘(영문→한글 음차) → 행정안전부 API',
  FALLBACK: '⚠️ 모든 경로 실패 (출판지 미상)',
}

// "02010$a" = 020이 두 번 나올 때(개별 ISBN + 세트 ISBN) 두 번째 반복의 $a.
// 020 계열 나머지("020  $a/$g/$c")는 첫 번째 반복만 담는다.
const HEADER_OVERRIDE: Record<string, { tag: string; code: string; occurrence: number }> = {
  '02010$a': { tag: '020', code: 'a', occurrence: 2 },
}

type Occurrence = number | 'agg'
interface ColumnSpec {
  tag: string
  code: string
  occurrence: Occurrence
}

/** 고정 헤더 문자열 → (tag, code, occurrence). "no."/"isbn"/"007"/"008"은 별도 처리라 null. */
function columnSpec(header: string): ColumnSpec | null {
  if (header === 'no.' || header === 'isbn' || header === '007' || header === '008') return null
  const override = HEADER_OVERRIDE[header]
  if (override) return override
  const m = /^(\d{3})\s*\$(\w)$/.exec(header)
  if (!m) return null
  const [, tag, code] = m
  return { tag, code, occurrence: tag === '020' ? 1 : 'agg' }
}

/** 한 필드 occurrence(서브필드 배열) 안에서 같은 코드가 반복되면 ", "로 잇는다. */
function occurrenceValue(subfields: MrkSubfield[], code: string): string {
  const vals = subfields.filter((s) => s.code === code && s.value.trim()).map((s) => s.value.trim())
  return vals.join(', ')
}

/** 같은 태그가 필드 자체로 여러 번 나오면(700/710/653 등) occurrence 사이는 " ; "로 잇는다. */
function aggregateSubfield(occurrences: MrkSubfield[][], code: string): string {
  const perOccurrence = occurrences.map((occ) => occurrenceValue(occ, code))
  return perOccurrence.filter(Boolean).join(' ; ')
}

function kdcEvalColumns(meta: ConvertMeta | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const h of EVAL_056_HEADERS) out[h] = ''
  const m = meta ?? {}

  if (m.gpt_called !== undefined) out['GPT호출(1/0)'] = m.gpt_called ? '1' : '0'
  const tok = m.token_usage?.total_tokens
  if (typeof tok === 'number') out['GPT토큰'] = String(tok)

  const cands = m.kdc_candidates ?? []
  if (cands.length > 1) {
    out['056 2순위'] = String(cands[1].kdc ?? '')
    out['056 2위확률'] = typeof cands[1].prob === 'number' ? cands[1].prob.toFixed(4) : ''
  }
  if (cands.length > 2) out['056 3순위'] = String(cands[2].kdc ?? '')
  if (cands.length > 0 && typeof cands[0].prob === 'number') out['056 1위확률'] = cands[0].prob.toFixed(4)

  if (typeof m.kdc_margin_ratio === 'number') out['056 1·2위비율'] = String(m.kdc_margin_ratio)
  // 056 자체가 안 만들어진 건은 판정 대상이 아니라 빈칸이어야 한다(0으로 적으면
  // "검토 불필요"로 읽힌다) — tag_056이 있을 때만 채운다.
  if (m.tag_056) out['056 검토필요(1/0)'] = m.kdc_low_confidence ? '1' : '0'

  const presence = m.kdc_input_presence ?? {}
  const presenceMap: [string, string][] = [
    ['056 653유무(1/0)', 'keywords'],
    ['056 목차유무(1/0)', 'toc'],
    ['056 책소개유무(1/0)', 'description'],
  ]
  for (const [header, key] of presenceMap) {
    if (key in presence) out[header] = presence[key] ? '1' : '0'
  }

  out['056 미생성사유'] = m.kdc_reason ?? ''
  return out
}

function perfEvalColumns(meta: ConvertMeta | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const h of EVAL_PERF_HEADERS) out[h] = ''
  const m = meta ?? {}

  if (typeof m.elapsed_ms === 'number') out['소요시간(초)'] = (m.elapsed_ms / 1000).toFixed(1)

  const fieldMs = m.field_elapsed_ms ?? {}
  const fieldTok = m.field_tokens ?? {}
  for (const [key, label] of FIELD_STEP_LABELS) {
    if (key in fieldMs) out[`${label} 소요(ms)`] = String(fieldMs[key])
    if (key in fieldTok) out[`${label} 토큰`] = String(fieldTok[key])
  }
  return out
}

function sourceEvalColumn(meta: ConvertMeta | undefined): Record<string, string> {
  const source = meta?.bundle_source ?? ''
  return { '260 발행지 출처': SOURCE_LABEL[source] ?? source }
}

export interface EvalRunResultEntry {
  isbn: string
  mrkText: string
  error: string
  meta: ConvertMeta
}

/** ISBN 하나의 결과를 CSV 한 행(헤더→값 dict)으로 펼친다. */
export function buildEvalRow(no: number, entry: EvalRunResultEntry): Record<string, string> {
  const row: Record<string, string> = { 'no.': String(no), isbn: entry.isbn }
  for (const h of FIXED_HEADERS) row[h] = row[h] ?? ''

  Object.assign(row, kdcEvalColumns(entry.meta), perfEvalColumns(entry.meta), sourceEvalColumn(entry.meta))

  if (entry.error || !entry.mrkText.trim()) return row

  const fields: MrkField[] = parseMrkText(entry.mrkText)

  const controlValue = (tag: string): string =>
    fields
      .filter((f): f is Extract<MrkField, { kind: 'control' }> => f.kind === 'control' && f.tag === tag && f.value.trim() !== '')
      .map((f) => f.value.trim())
      .join(' ; ')
  row['007'] = controlValue('007')
  row['008'] = controlValue('008')

  const byTag = new Map<string, MrkSubfield[][]>()
  for (const f of fields) {
    if (f.kind !== 'data') continue // LDR/제어필드(007/008 등)는 parseMrkText가 kind:'control'로 넘겨준다
    const occs = byTag.get(f.tag) ?? []
    occs.push(f.subfields)
    byTag.set(f.tag, occs)
  }

  const covered = new Set<string>() // `${tag}|${code}|${occurrence}`
  for (const h of FIXED_HEADERS) {
    const spec = columnSpec(h)
    if (!spec) continue
    const { tag, code, occurrence } = spec
    const occs = byTag.get(tag) ?? []
    if (occurrence === 'agg') {
      row[h] = aggregateSubfield(occs, code)
    } else {
      const idx = occurrence - 1
      row[h] = idx < occs.length ? occurrenceValue(occs[idx], code) : ''
    }
    covered.add(`${tag}|${code}|${occurrence}`)
  }

  // 고정 컬럼이 다루지 않는 태그/서브필드/회차 → 동적 컬럼으로 추가.
  // 동적 컬럼은(고정 컬럼과 달리) 같은 occurrence 안의 반복값까지 전부 " ; "로만
  // 잇는다 — 원본 코드의 비대칭 동작을 그대로 재현(정리하지 않음).
  for (const [tag, occs] of byTag) {
    occs.forEach((occ, occIdx0) => {
      const occIdx = occIdx0 + 1
      for (const { code, value } of occ) {
        if (!value.trim()) continue
        if (covered.has(`${tag}|${code}|agg`) || covered.has(`${tag}|${code}|${occIdx}`)) continue
        const colName = occIdx === 1 ? `${tag} $${code}` : `${tag}(${occIdx}) $${code}`
        row[colName] = (row[colName] ? row[colName] + ' ; ' : '') + value.trim()
      }
    })
  }

  return row
}

/** 여러 ISBN 결과를 하나의 표(헤더 배열 + 행 배열)로 합친다 — 동적 컬럼은 처음
 * 등장한 순서대로 기본 헤더 뒤에 붙는다. */
export function buildEvalTable(entries: EvalRunResultEntry[]): { headers: string[]; rows: Record<string, string>[] } {
  const baseHeaders = [...FIXED_HEADERS, ...EVAL_056_HEADERS, ...EVAL_PERF_HEADERS, ...EVAL_SOURCE_HEADERS]
  const rows = entries.map((entry, i) => buildEvalRow(i + 1, entry))

  const seen = new Set(baseHeaders)
  const dynamicCols: string[] = []
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k)
        dynamicCols.push(k)
      }
    }
  }
  return { headers: [...baseHeaders, ...dynamicCols], rows }
}
