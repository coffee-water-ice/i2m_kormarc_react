/**
 * mrk_editor_prototype.html(i2m_kormarc 저장소, prototypes/)의 parseMrkText()/
 * serializeRow()를 TypeScript로 이식한 것. 순수 함수만 모아둬서 컴포넌트 없이도
 * 단위 테스트가 가능하다.
 *
 * 프로토타입과 딱 한 군데 다르다: 프로토타입 JS는 각 줄을 `l.replace(/\s+$/,'')`로
 * 트레일링 공백까지 지우는데, 008처럼 고정 길이(40자) 제어필드는 끝 공백이 자릿수를
 * 채우는 의미 있는 값이라 이걸 지우면 안 된다 — 스트림릿 프로토타입 페이지
 * (pages/4_ISBN_변환_프로토타입.py)를 실제 백엔드 데이터로 검증하다가 발견한 문제라,
 * 처음부터 반영했다.
 */

import type { MrkField, MrkSubfield } from '../types/mrk'
import { REQUIRED_SUBFIELDS } from '../types/mrk'

export function isControlTag(tag: string): boolean {
  return /^\d+$/.test(tag) && parseInt(tag, 10) < 10
}

export function parseMrkText(text: string): MrkField[] {
  const lines = (text ?? '').split(/\r?\n/)
  const fields: MrkField[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const m = line.match(/^=(\d{3})\s{2}(.*)$/)
    if (!m) continue
    const tag = m[1]
    const rest = m[2]

    if (isControlTag(tag)) {
      fields.push({ tag, kind: 'control', value: rest })
      continue
    }

    const ind1 = rest[0] ?? '\\'
    const ind2 = rest[1] ?? '\\'
    const sfPart = rest.slice(2)
    const subfields: MrkSubfield[] = []
    const re = /\$(.)([^$]*)/g
    let mm: RegExpExecArray | null
    while ((mm = re.exec(sfPart))) {
      subfields.push({ code: mm[1], value: mm[2] })
    }
    fields.push({ tag, kind: 'data', ind1, ind2, subfields })
  }

  // 태그 번호 오름차순으로 정렬 — 백엔드가 필드를 빌드한 순서(팀별 파이프라인 호출 순서)
  // 그대로 내려주기 때문에 원본 mrk_text 자체는 007/245/020처럼 뒤섞여 있을 수 있다.
  // Array.sort는 안정 정렬이 보장되므로(ES2019+) 같은 태그가 반복되는 필드(700 등)는
  // 서로의 상대 순서를 유지한 채로만 재배치된다.
  fields.sort((a, b) => parseInt(a.tag, 10) - parseInt(b.tag, 10))

  return fields
}

export function serializeField(f: MrkField): string {
  if (f.kind === 'control') {
    // 008처럼 고정 길이(40자) 제어필드는 끝 공백이 자릿수를 채우는 의미 있는 값이라
    // 그대로 둔다(파일 상단 주석 참고) — 트리밍은 데이터필드 서브필드 값에만 적용한다.
    return `=${f.tag}  ${f.value}`
  }
  // 지시기호 칸엔 편집 중 스페이스가 그대로 남아있을 수 있다(사용자가 실제로 스페이스를
  // 친 그대로 보여주려고 FieldEditor에서 일부러 안 바꿈) — mrk 관례상 빈 지시기호는
  // "\"로 표기해야 하므로 내보낼 때 여기서 정리한다.
  const ind1 = f.ind1 && f.ind1 !== ' ' ? f.ind1 : '\\'
  const ind2 = f.ind2 && f.ind2 !== ' ' ? f.ind2 : '\\'
  // 실제로 내보내는 텍스트(복사/다운로드/원본 미리보기)에는 불필요한
  // 앞뒤 공백이 남아있지 않아야 하므로 여기서 한 번 더 정리한다. Alt+Enter로 값 안에
  // 넣은 줄바꿈도 여기서 공백 하나로 접는다 — mrk 텍스트는 필드 하나가 한 줄이어야
  // 하고(serializeRecord가 필드 사이만 \n으로 join), 줄바꿈을 그대로 내보내면 그
  // 다음 줄이 "=태그  " 형식이 아니라서 재파싱(parseMrkText) 때 통째로 사라진다 —
  // 그래서 개행은 어디까지나 편집 중 보기 편하라고 두는 것이고, 내보낼 땐 접는다.
  const sfText = f.subfields
    .map((sf) => `$${sf.code}${sf.value.replace(/\s*\n\s*/g, ' ').trim()}`)
    .join('')
  return `=${f.tag}  ${ind1}${ind2}${sfText}`
}

export function serializeRecord(fields: MrkField[]): string {
  return fields.map(serializeField).join('\n')
}

/** REQUIRED_SUBFIELDS 기준 누락된 서브필드 코드 목록. control 필드는 항상 []. */
export function missingSubfields(f: MrkField): string[] {
  if (f.kind !== 'data') return []
  const need = REQUIRED_SUBFIELDS[f.tag]
  if (!need || need.length === 0) return []
  const present = new Set(f.subfields.map((sf) => sf.code))
  return need.filter((c) => !present.has(c))
}

/** 245 $a에서 레코드 제목 추출 — 변환 내역 리스트 표시용(prototype의 fieldTitle()). */
export function extractTitle(fields: MrkField[]): string {
  const f245 = fields.find((f): f is Extract<MrkField, { kind: 'data' }> => f.kind === 'data' && f.tag === '245')
  if (!f245) return '(제목 없음)'
  const a = f245.subfields.find((sf) => sf.code === 'a')
  if (!a) return '(제목 없음)'
  return a.value.trim().replace(/\s*\/\s*$/, '') || '(제목 없음)'
}

/** 056 필드의 $a 값을 교체(없으면 새로 만듦) — KDC 후보 선택 결과를 최종 출력에 반영할 때 사용. */
export function applyKdcToFields(fields: MrkField[], kdc: string): MrkField[] {
  return fields.map((f) => {
    if (f.kind !== 'data' || f.tag !== '056') return f
    const hasA = f.subfields.some((sf) => sf.code === 'a')
    const subfields = hasA
      ? f.subfields.map((sf) => (sf.code === 'a' ? { ...sf, value: kdc } : sf))
      : [{ code: 'a', value: kdc }, ...f.subfields]
    return { ...f, subfields }
  })
}

let _nextUid = 1
/** 프론트 전용 임시 id 발급 — 백엔드와 무관, 변환 내역/컴포넌트 key 용도. */
export function nextUid(): number {
  return _nextUid++
}
