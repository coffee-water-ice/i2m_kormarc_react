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

import type { MrkDataField, MrkField, MrkSubfield } from '../types/mrk'
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
      // 245/246/500/700/900 등 일부 필드는 백엔드가 "$a 값"처럼 코드 바로 뒤에
      // 공백을 붙여서 내려준다(020/041/260/300/546/950 등은 원래 안 그럼) — mrk
      // 관례상 "$코드값"에 코드와 값 사이 공백이 없어야 하므로 여기서 한 번만
      // 걷어낸다. 값 중간·끝의 공백(예: "서울 :")은 실제 내용이라 건드리지 않는다.
      subfields.push({ code: mm[1], value: mm[2].replace(/^\s+/, '') })
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

// 원화(₩) 표기 — 사서편집 화면·.mrk 다운로드·원본 텍스트 미리보기는 사서가 보기
// 편하라고 유니코드 ₩ 그대로 둔다. 하지만 실제 MARC 바이트로 나가는 두 경로
// (전체 복사·.mrc 다운로드)는 실제 도서관 시스템(남산마크) 원본과 똑같이
// 백슬래시(0x5C)를 써야 한다 — 옛 한국 코드페이지에서 그 바이트가 ₩로 렌더링되던
// 관례를 그대로 반영한 원본 표기이기 때문(2026-09-04, I2M 0904/남산마크.txt를
// 16진 덤프로 직접 확인). 같은 폴더의 111.txt는 반대로 유니코드 ₩를 쓰고 있어
// 두 원본이 서로 다른데, 사서가 실제로 쓰는 남산마크 쪽 표기를 따르기로 했다.
const WON_SIGN = '₩'
function toRealMarcValue(value: string): string {
  return value.split(WON_SIGN).join('\\')
}

/** serializeField/serializeFieldForMarcExport가 공유하는 본체 — 서브필드 값을 내보내기
 * 직전에 한 번 변형할 수 있게 valueTransform을 받는다(기본은 손대지 않음, MARC 수출
 * 경로는 toRealMarcValue를 넘겨서 원화 표기만 바꾼다). */
function serializeFieldInternal(f: MrkField, valueTransform: (v: string) => string): string {
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
    .map((sf) => `$${sf.code}${valueTransform(sf.value.replace(/\s*\n\s*/g, ' ').trim())}`)
    .join('')
  return `=${f.tag}  ${ind1}${ind2}${sfText}`
}

export function serializeField(f: MrkField): string {
  return serializeFieldInternal(f, (v) => v)
}

export function serializeRecord(fields: MrkField[]): string {
  return fields.map(serializeField).join('\n')
}

/** serializeField와 형태는 똑같이 "$" 관례(백엔드 /api/mrk-to-marc가 파싱하는 mrk
 * 텍스트 포맷) 그대로지만, 원화 표기만 toRealMarcValue로 실제 MARC 바이트에 맞춘다 —
 * .mrc 다운로드(handleDownloadMrc)가 백엔드로 보내기 직전에만 쓴다. 화면(사서편집)·
 * .mrk 다운로드·원본 텍스트는 계속 serializeRecord를 쓰므로 영향 없다. */
export function serializeFieldForMarcExport(f: MrkField): string {
  return serializeFieldInternal(f, toRealMarcValue)
}

export function serializeRecordForMarcExport(fields: MrkField[]): string {
  return fields.map(serializeFieldForMarcExport).join('\n')
}

// 진짜 MARC(ISO 2709) 바이너리 레코드 안에 그대로 들어가는 제어 바이트 셋 —
// "▼"나 "$"처럼 사람이 보라고 만든 니모닉 표기가 아니다. 111.txt·남산마크.txt를
// 직접 바이트로 까서 확인함(2026-09-04, I2M 0904/). FieldEditor.tsx의 드래그
// 선택 복사(onCopy)도 이 상수를 그대로 가져다 쓰므로 export한다.
export const MARC_US = '\x1f' // Unit Separator — 서브필드 구분자
export const MARC_FT = '\x1e' // Field Terminator — 필드 하나가 끝날 때마다
export const MARC_RT = '\x1d' // Record Terminator — 레코드 전체가 끝날 때 딱 한 번(맨 끝 필드 뒤)

/**
 * MrkField → 실제 도서관리 시스템(예: 남산마크)이 내보내는 것과 같은 "진짜 MARC
 * 바이너리 구분자" 텍스트 한 줄. serializeField와 다른 점 셋:
 *  1. "=태그  " 접두가 없다 — 그 시스템의 내보내기 원문도 없었다.
 *  2. 서브필드 구분자가 "$"/"▼"가 아니라 진짜 0x1F(MARC_US) 바이트.
 *  3. 빈 지시기호가 "\"가 아니라 원본처럼 실제 스페이스 문자.
 * 필드 끝은 0x1E(MARC_FT)로 표시한다 — 이것도 원본 그대로.
 */
export function serializeFieldAsMarcBinary(f: MrkField): string {
  if (f.kind === 'control') return f.tag + f.value
  const ind1 = f.ind1 && f.ind1 !== '\\' ? f.ind1 : ' '
  const ind2 = f.ind2 && f.ind2 !== '\\' ? f.ind2 : ' '
  const sfText = f.subfields
    .map((sf) => `${MARC_US}${sf.code}${toRealMarcValue(sf.value.replace(/\s*\n\s*/g, ' ').trim())}`)
    .join('')
  return `${f.tag}${ind1}${ind2}${sfText}`
}

/** serializeRecord의 진짜-MARC-바이너리 버전 — "전체복사"가 이걸로 클립보드에 담는다
 * (IsbnConvert.tsx의 handleCopyAll). 각 필드 뒤에 0x1E(필드 종료) + CRLF를 붙이고,
 * 맨 마지막에 0x1D(레코드 종료) + CRLF를 한 번 더 붙인다 — 원본 파일이 그 모양이었다
 * (111.txt는 마지막 필드의 0x1E 뒤에 0x1D가 따로 붙어있었음; 남산마크.txt는 그게
 * 빠져있었는데 ISO 2709 표준·pymarc의 .mrc 출력과도 맞는 111.txt 쪽을 따른다). */
export function serializeRecordAsMarcBinary(fields: MrkField[]): string {
  const body = fields.map((f) => serializeFieldAsMarcBinary(f) + MARC_FT + '\r\n').join('')
  return body + MARC_RT + '\r\n'
}

/** 사서편집 화면에서 마우스로 드래그 선택한, "화면에 보이는 그대로의" 부분 문자열
 * 한 조각(▼가 문자 그대로 들어있는 자유 텍스트 — 태그가 안 채워졌거나 값 중간에서
 * 잘렸을 수도 있음)을 실제 MARC 바이트 표기로 바꾼다. FieldEditor.tsx의 onCopy
 * 핸들러(드래그 선택 후 Ctrl+C)가 클립보드에 넣기 직전에 쓴다 — serializeFieldAsMarcBinary와
 * 달리 완성된 MrkField 단위가 아니라 임의의 부분 문자열을 받으므로, 서브필드로
 * 다시 조립하지 않고 이미 화면에 있는 문자만 두 가지 그대로 치환한다: "▼"(식별기호
 * 구분자) → 진짜 0x1F(MARC_US), "₩"(원화 표시, toRealMarcValue) → 실제 MARC
 * 원본과 같은 백슬래시(0x5C). */
export function toRealMarcRowFragment(displayText: string): string {
  return toRealMarcValue(displayText.split('▼').join(MARC_US))
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
  // 245 $a 값 끝에는 진짜 제목이 아니라 다음 서브필드로 이어지는 ISBD 구두점이
  // 그대로 남아있을 수 있다 — 백엔드가 mrk_text를 만들 때 그 구두점을 "다음
  // 서브필드 앞"이 아니라 "이 서브필드 값 끝"에 붙이는 MARC 관례를 그대로
  // 따르기 때문이다(예: core/fields/marc_245.py의 `f" :$b {b_part}"` — $b로
  // 이어지는 콜론이 $a 쪽 텍스트에 남는다; $d 앞의 '/'도 동일한 이유). 그
  // 구두점은 서브필드끼리의 연결 표시일 뿐 제목 자체의 일부가 아니므로,
  // "책 이름"으로 보여줄 때는 걷어낸다.
  return a.value.trim().replace(/\s*[/:;,.]\s*$/, '') || '(제목 없음)'
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

/** 049(소장사항/등록번호) 필드를 draft에 반영 — ISBN 변환만으로는 알 수 없는, 사서가
 * 직접 입력해야 하는 값이라(다른 필드처럼 백엔드가 만들어주지 않음) HoldingsPanel의
 * 입력창이 매 타이핑마다 이 함수로 draftFields를 갱신한다. 지시기호는 '0'(첫 번째)·
 * ' '(두 번째, 빈칸)로, 서브필드 코드는 '$l'(소문자 엘 — 대문자 아이 아님, 실제 표기
 * 확인 후 정정됨)로 고정한다(요청 사양).
 *
 * 예전엔 regNo가 비어 있으면(전부 지웠으면) 049 필드 자체를 없앴는데, "사서가 아직
 * 안 채운 상태에서도 950 아래에 항상 빈 049 자리가 보여야 한다"는 요청(2026-09-10)으로
 * 바뀌었다 — 이제 비어 있어도 지우지 않고 subfields:[]인 스텁으로 남긴다(서브필드가
 * 없는 049 행 자체는 그대로 화면에 보임). "채워졌는지"는 ReviewChecklist가
 * subfields.length로 판단한다. 049가 아직 없을 때 새로 만드는 경우에만 950 바로
 * 다음 자리에 끼워 넣는다(950이 없으면 맨 끝) — 태그 번호 정렬(parseMrkText의 sort)과
 * 무관하게 "언제나 950 다음"이어야 한다는 화면 위치 요구사항 때문에 여기서 직접
 * 다룬다. 이미 049가 있으면(사서가 FieldEditor에서 직접 옮겨놨을 수도 있으니) 값만
 * 갱신하고 위치는 건드리지 않는다. */
export function applyHoldingsRegToFields(fields: MrkField[], regNo: string): MrkField[] {
  const trimmed = regNo.trim()
  const idx049 = fields.findIndex((f) => f.tag === '049')
  const field049: MrkDataField = {
    tag: '049',
    kind: 'data',
    ind1: '0',
    ind2: ' ',
    subfields: trimmed ? [{ code: 'l', value: trimmed }] : [],
  }

  if (idx049 !== -1) {
    const next = [...fields]
    next[idx049] = field049
    return next
  }

  const idx950 = fields.findIndex((f) => f.tag === '950')
  const insertAt = idx950 === -1 ? fields.length : idx950 + 1
  const next = [...fields]
  next.splice(insertAt, 0, field049)
  return next
}

/** 090(자관청구기호) 필드를 draft에 반영 — 049와 마찬가지로 ISBN 변환만으로는 알 수
 * 없는, 사서가 직접 입력해야 하는 값이라 CallNumberPanel의 세 입력창(분류기호/
 * 저자기호/권·연차기호)이 타이핑마다 이 함수로 draftFields를 갱신한다. 지시기호는
 * 둘 다 빈칸으로 고정한다(요청 사양). 채워진 값만 해당 서브필드로 넣는다(예: 저자기호만
 * 비어 있으면 $b 없이 $a·$c만).
 *
 * 예전엔 세 값이 다 비어 있으면 090 필드 자체를 없앴는데, "사서가 아직 안 채운
 * 상태에서도 056 아래에 항상 빈 090 자리가 보여야 한다"는 요청(2026-09-10)으로
 * 바뀌었다 — 이제 비어 있어도 지우지 않고 subfields:[]인 스텁으로 남긴다.
 * "채워졌는지"는 ReviewChecklist가 subfields.length로 판단한다.
 *
 * 049(950 다음에 강제로 끼워 넣음)와 달리, 090은 처음 만들어질 때 태그 번호
 * 오름차순 위치("090" 이상인 첫 필드 앞")에 끼워 넣는다 — 049처럼 위치를 특별
 * 취급해야 할 요구사항이 없고, 이 방식이 056(있으면 090보다 앞)과 245(090보다 뒤)
 * 사이에 자연스럽게 들어가면서(즉 결과적으로 "항상 056 아래") 056이 아직 없는
 * 레코드(KDC 후보 미생성)에도 안전하게 동작한다. 이미 090이 있으면(사서가
 * FieldEditor에서 직접 옮겼을 수도 있으니) 값만 갱신하고 위치는 그대로 둔다. */
export function applyCallNumberToFields(
  fields: MrkField[],
  classMark: string,
  authorMark: string,
  volMark: string,
): MrkField[] {
  const idx090 = fields.findIndex((f) => f.tag === '090')
  const subfields: MrkSubfield[] = []
  if (classMark.trim()) subfields.push({ code: 'a', value: classMark.trim() })
  if (authorMark.trim()) subfields.push({ code: 'b', value: authorMark.trim() })
  if (volMark.trim()) subfields.push({ code: 'c', value: volMark.trim() })

  const field090: MrkDataField = { tag: '090', kind: 'data', ind1: ' ', ind2: ' ', subfields }

  if (idx090 !== -1) {
    const next = [...fields]
    next[idx090] = field090
    return next
  }

  const insertAt = fields.findIndex((f) => f.tag >= '090')
  const next = [...fields]
  next.splice(insertAt === -1 ? fields.length : insertAt, 0, field090)
  return next
}

let _nextUid = 1
/** 프론트 전용 임시 id 발급 — 백엔드와 무관, 변환 내역/컴포넌트 key 용도. */
export function nextUid(): number {
  return _nextUid++
}
