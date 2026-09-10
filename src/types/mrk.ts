/**
 * MRK(=TAG  IND1IND2$코드값...) 구조화 표현.
 * prototypes/mrk_editor_prototype.html(i2m_kormarc 저장소)의 field 객체 모양을 그대로
 * TypeScript로 옮기되, control/data를 판별자(kind)로 구분해서 컴포넌트에서
 * isControlTag() 호출 없이 바로 타입 좁히기(narrowing)가 되게 했다.
 *
 * 프로토타입과 동일하게, 사용자가 태그 번호를 007→245처럼 바꿔도 control/data 종류
 * 자체는 재분류하지 않는다(행이 생성된 시점의 모양을 유지) — 프로토타입도 이 부분은
 * 안 했다(handleTagInput은 레일 색상·경고만 갱신).
 */

export interface MrkSubfield {
  code: string
  value: string
}

export interface MrkControlField {
  tag: string
  kind: 'control'
  value: string
}

export interface MrkDataField {
  tag: string
  kind: 'data'
  ind1: string
  ind2: string
  subfields: MrkSubfield[]
}

export type MrkField = MrkControlField | MrkDataField

/** 필수 서브필드 맵 — mrk_editor_prototype.html의 REQUIRED 그대로. */
export const REQUIRED_SUBFIELDS: Record<string, string[]> = {
  '245': ['a'],
  '260': ['a', 'b', 'c'],
  '300': ['a'],
  '700': ['a'],
}

/** 필드 종류별 왼쪽 테두리 색 — mrk_editor_prototype.html의 RAIL_COLOR 그대로. */
export const RAIL_COLOR: Record<string, string> = {
  '007': 'var(--rail-control)',
  '008': 'var(--rail-control)',
  '020': 'var(--rail-control)',
  '041': 'var(--rail-control)',
  '049': 'var(--rail-note)',
  '056': 'var(--rail-class)',
  '090': 'var(--rail-note)',
  '245': 'var(--rail-title)',
  '246': 'var(--rail-title)',
  '260': 'var(--rail-pub)',
  '300': 'var(--rail-pub)',
  '490': 'var(--rail-series)',
  '500': 'var(--rail-note)',
  '546': 'var(--rail-note)',
  '653': 'var(--rail-subject)',
  '700': 'var(--rail-added)',
  '710': 'var(--rail-added)',
  '830': 'var(--rail-series)',
  '900': 'var(--rail-added)',
  '940': 'var(--rail-title)',
  '950': 'var(--rail-price)',
}
