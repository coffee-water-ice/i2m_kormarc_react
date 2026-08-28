/**
 * MrkField[] 편집 도우미 — 전부 순수 함수(불변 업데이트)로, mrk_editor_prototype.html의
 * handleTagInput/handleIndicatorKey/insertSubfieldAtCaret/deleteSubfield 로직을
 * React 상태 업데이트에 맞게 옮긴 것. DOM(caret, focus)을 직접 만지는 부분은 컴포넌트
 * 쪽(FieldEditor.tsx)에 남기고, 여기는 배열/객체 변형만 담당한다.
 */

import type { MrkField } from '../types/mrk'

export function updateTag(fields: MrkField[], rowIdx: number, tag: string): MrkField[] {
  const clean = tag.replace(/[^0-9]/g, '').slice(0, 3)
  return fields.map((f, i) => (i === rowIdx ? { ...f, tag: clean } : f))
}

export function updateControlValue(fields: MrkField[], rowIdx: number, value: string): MrkField[] {
  return fields.map((f, i) => (i === rowIdx && f.kind === 'control' ? { ...f, value } : f))
}

/** 스페이스 = 빈 지시기호(\\), 그 외 1글자만 허용 — prototype의 handleIndicatorKey. */
export function normalizeIndicatorInput(raw: string, prev: string): string {
  if (raw === '') return prev // 지우려는 시도는 무시(빈 지시기호는 '\'로 표현)
  const last = raw.slice(-1)
  if (last === ' ') return '\\'
  if (/^[0-9a-zA-Z]$/.test(last)) return last
  return prev
}

export function updateIndicator(
  fields: MrkField[],
  rowIdx: number,
  which: 'ind1' | 'ind2',
  value: string,
): MrkField[] {
  return fields.map((f, i) => (i === rowIdx && f.kind === 'data' ? { ...f, [which]: value } : f))
}

export function updateSubfieldCode(
  fields: MrkField[],
  rowIdx: number,
  sfIdx: number,
  code: string,
): MrkField[] {
  const clean = code.replace(/[^0-9a-zA-Z]/g, '').slice(0, 1)
  return fields.map((f, i) => {
    if (i !== rowIdx || f.kind !== 'data') return f
    return { ...f, subfields: f.subfields.map((sf, j) => (j === sfIdx ? { ...sf, code: clean } : sf)) }
  })
}

export function updateSubfieldValue(
  fields: MrkField[],
  rowIdx: number,
  sfIdx: number,
  value: string,
): MrkField[] {
  return fields.map((f, i) => {
    if (i !== rowIdx || f.kind !== 'data') return f
    return { ...f, subfields: f.subfields.map((sf, j) => (j === sfIdx ? { ...sf, value } : sf)) }
  })
}

/** 값 앞의 공백만 제거 — prototype의 sf-trim(␣) 버튼. */
export function trimSubfieldLeadingSpace(fields: MrkField[], rowIdx: number, sfIdx: number): MrkField[] {
  return fields.map((f, i) => {
    if (i !== rowIdx || f.kind !== 'data') return f
    return {
      ...f,
      subfields: f.subfields.map((sf, j) => (j === sfIdx ? { ...sf, value: sf.value.replace(/^\s+/, '') } : sf)),
    }
  })
}

/**
 * Alt+글자 서브필드 삽입 — 현재 서브필드 값을 caretPos에서 잘라 뒷부분으로 새 서브필드를
 * 만든다. prototype의 insertSubfieldAtCaret과 동일한 동작.
 */
export function insertSubfieldAtCaret(
  fields: MrkField[],
  rowIdx: number,
  sfIdx: number,
  code: string,
  caretPos: number,
): MrkField[] {
  return fields.map((f, i) => {
    if (i !== rowIdx || f.kind !== 'data') return f
    const target = f.subfields[sfIdx]
    if (!target) return f
    const left = target.value.slice(0, caretPos)
    const right = target.value.slice(caretPos)
    const newSubfields = [...f.subfields]
    newSubfields[sfIdx] = { ...target, value: left }
    newSubfields.splice(sfIdx + 1, 0, { code: code.toLowerCase(), value: right })
    return { ...f, subfields: newSubfields }
  })
}

/** 서브필드 삭제 — 마지막 하나 남았으면 값만 비운다(prototype과 동일, 행 자체는 안 지움). */
export function deleteSubfield(fields: MrkField[], rowIdx: number, sfIdx: number): MrkField[] {
  return fields.map((f, i) => {
    if (i !== rowIdx || f.kind !== 'data') return f
    if (f.subfields.length <= 1) {
      return { ...f, subfields: f.subfields.map((sf) => ({ ...sf, value: '' })) }
    }
    return { ...f, subfields: f.subfields.filter((_, j) => j !== sfIdx) }
  })
}
