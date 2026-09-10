/**
 * MARC_SCHEMA(src/data/marcSchema.ts, scripts/generate-marc-schema.mjs가 국립중앙도서관
 * KORMARC 지시기호·식별기호 정의로부터 생성) 조회 헬퍼 — FieldEditor.tsx가 캐럿 위치의
 * 지시기호/식별기호 의미를 찾거나, Alt 단독 tap 때 띄울 식별기호 목록을 만들 때 쓴다.
 */
import { MARC_SCHEMA } from '../data/marcSchema'
import type { MarcSubfieldMeta } from '../data/marcSchema'

/** 편집 화면에서 지시기호가 빈 값일 때 실제로 쓰이는 표기들 — 전부 "공백"으로 정규화한다.
 * '\\'는 mrk 원문의 빈 지시기호 표기(lib/mrk.ts), ' '는 fieldToRowText가 화면에 보여주는
 * 표기, ''는 아직 그 자리까지 타이핑 안 한 상태. Indicator.txt에서 공백 값은 'b'로 표기된다. */
function normalizeIndicatorValue(raw: string): string {
  if (raw === '' || raw === ' ' || raw === '\\') return 'b'
  return raw
}

export interface IndicatorHint {
  /** 1 또는 2 — 몇 번째 지시기호인지. */
  pos: 1 | 2
  /** 지시기호 이름(예: "발행사항의 순차"). */
  name: string
  /** 입력된 값의 의미. */
  meaning: string
}

/** tag의 pos번째 지시기호에 rawChar 값이 실제로 정의된 값이면 {이름, 의미}를 돌려준다.
 * 정의가 없는 값(오타 등)이면 null — "유효한 값이 입력되면"만 보여주기 위함. */
export function getIndicatorHint(tag: string, pos: 1 | 2, rawChar: string): IndicatorHint | null {
  const ind = MARC_SCHEMA[tag]?.indicators[pos]
  if (!ind) return null
  const meaning = ind.values[normalizeIndicatorValue(rawChar)]
  if (meaning === undefined) return null
  return { pos, name: ind.name, meaning }
}

/** tag에서 code로 정의된 식별기호를 찾는다(같은 코드가 여러 줄로 정의된 경우 — 예: 886의
 * "$a"와 그 뒤의 범위 표기 "$a-z" — 더 구체적인 첫 항목을 우선한다). 없으면 null. */
export function getSubfieldHint(tag: string, code: string): MarcSubfieldMeta | null {
  const subfields = MARC_SCHEMA[tag]?.subfields
  if (!subfields) return null
  return subfields.find((s) => s.code === code) ?? null
}

/** Alt 단독 tap 픽커용 — tag에 정의된 식별기호 전체 목록(코드 중복 제거, 첫 정의 우선,
 * 파일에 등장한 순서 유지). 스키마에 없는 태그(제어필드 포함)는 빈 배열. */
export function listSubfields(tag: string): MarcSubfieldMeta[] {
  const subfields = MARC_SCHEMA[tag]?.subfields
  if (!subfields) return []
  const seen = new Set<string>()
  const out: MarcSubfieldMeta[] = []
  for (const s of subfields) {
    if (seen.has(s.code)) continue
    seen.add(s.code)
    out.push(s)
  }
  return out
}
