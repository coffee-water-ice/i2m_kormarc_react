import { useEffect, useRef, useState } from 'react'
import type { MrkField, MrkSubfield } from '../types/mrk'
import { RAIL_COLOR, TAG_META } from '../types/mrk'
import { MARC_FT, missingSubfields, serializeField, toRealMarcRowFragment } from '../lib/mrk'
import type { MarcSubfieldMeta } from '../data/marcSchema'
import { getIndicatorHint, getSubfieldHint, listSubfields } from '../lib/marcSchema'
import type { CaretRect } from './MarcCaretHint'
import { IndicatorSubfieldTooltip, SubfieldPicker } from './MarcCaretHint'
import './FieldEditor.css'

interface FieldEditorProps {
  fields: MrkField[]
  onChange: (fields: MrkField[]) => void
  /** 타이핑이 잠시 멈췄다가 다시 시작될 때(되돌리기용 스냅샷 지점) 호출된다 —
   * pages/IsbnConvert.tsx가 소유한 Ctrl+Z 스택에 쌓는다. */
  onBeforeStructuralChange?: () => void
  onCopyLine: (line: string) => void
  /** 특정 태그 행을 반짝이며 스크롤로 보여준다(예: 056 KDC 후보 선택 직후, 저장 시
   * 검증 실패한 행을 가리킬 때) — token이 바뀔 때마다 재실행되므로 같은 태그를
   * 연달아 골라도 다시 반짝인다. */
  pulseSignal?: { tag: string; token: number } | null
  /** 태그별로 행 복사(⧉) 버튼 옆에 ⚠️ 아이콘을 띄우고, 호버 시 보여줄 툴팁 텍스트
   * (줄바꿈 "\n" 포함 가능). 값이 있는 태그의 행에서만 아이콘이 뜬다. 이 컴포넌트는
   * 어떤 필드가 왜 경고 대상인지 모르며(범용), IsbnConvert.tsx가 653 품질 경고
   * (core/fields/marc_653.py의 _finalize_653) 문구를 만들어 넘긴다(2026-09-10 요청 —
   * 예전엔 카드 상단에 별도 배너로 떴었는데, "653 필드 복사 옆에 ⚠️ 표시만"으로
   * 바뀌었다). */
  tagWarningTooltips?: Record<string, string>
}

/*
 * ── 이 파일의 편집 모델: "레코드 전체가 하나의 텍스트" ──
 *
 * 태그·지시기호·서브필드는 전부 "위치"로만 구분되고(색·굵기는 장식일 뿐), 어디든
 * 자유롭게 클릭·선택·타이핑·삭제할 수 있다 — "지금 이 텍스트가 유효한 MRK 구조인가"는
 * 편집 중엔 검사하지 않고 "저장" 버튼을 누르는 시점에만 검사한다(IsbnConvert.tsx).
 *
 * 이번 버전은 여기서 한 단계 더 나갔다: 예전엔 "행 하나 = contentEditable 하나"라
 * 245에서 260까지 드래그로 한 번에 선택/복사하는 게 안 됐는데(각 행이 서로 다른
 * 편집 루트라 브라우저 Selection이 행을 못 넘나든다), 이제 .field-rows 컨테이너
 * 전체가 하나의 contentEditable이라 여러 필드에 걸친 드래그 선택·복사가 자연스럽게
 * 된다. 다만 "필드끼리 실제로 합쳐지는" 것까지 허용하면 MRK 구조 자체가 깨지므로,
 * 필드 경계를 넘나드는 "편집"(Backspace/Delete/타이핑/붙여넣기)만 명시적으로
 * 막는다 — 선택·복사는 읽기 전용이라 이 차단과 무관하게 항상 자유롭다.
 *
 * DOM은 여전히 React가 아니라 직접 관리한다(행별로 innerHTML을 다시 그리고 caret을
 * 절대 오프셋으로 복원) — 다만 편집 루트가 하나로 합쳐지면서 "지금 caret이 어느
 * 행에 있는지"를 이벤트의 target이 아니라(합쳐진 루트 자신을 가리켜서 못 씀)
 * Selection에서 가장 가까운 .field-row 조상을 찾아 판단한다.
 */

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
}
// 행이 완전히 비어 있으면 클릭으로 caret을 놓을 자리가 없어서(폭 0) 폭 없는 문자를
// 채워둔다 — 읽어낼 때 항상 걷어낸다.
const ZWSP = '​'
function stripPlaceholder(s: string): string {
  return s.replace(new RegExp(ZWSP, 'g'), '')
}

/** 태그가 제어필드(007/008 등, 3자리 숫자가 010 미만)로 "지금 보이는 대로" 해석되는지. */
function isControlTag(tag: string): boolean {
  return /^\d{3}$/.test(tag) && parseInt(tag, 10) < 10
}

/** 태그 자리(첫 3자)가 완성된 3자리 숫자인지 — 제어필드 여부와 무관하게 "형식 자체"만
 * 본다. 행 렌더링에서 이게 false면 실시간으로 오류 표시를 띄운다(태그를 마저 쳐서
 * 3자리 숫자가 되면 다음 렌더에서 저절로 사라짐). */
function isThreeDigitTag(tag: string): boolean {
  return /^\d{3}$/.test(tag)
}

interface RowToken {
  text: string
  cls: 'tok-tag' | 'tok-ind' | 'tok-delim' | 'tok-dollar' | 'tok-val' | 'tok-raw'
}

/** 순수 텍스트 한 줄을 위치 규칙(태그 3자리 → [지시기호 2자리] → ▼코드+값 반복)에 따라
 * 색칠용 토큰으로 나눈다. 형식이 아무리 어긋나 있어도(편집 중이라 당연히 그럴 수 있다)
 * 절대 던지지 않고 "그냥 이런 모양이겠거니" 하고 최대한 그럴듯하게 나눈다 — 진짜 검증은
 * 저장 시점에 따로 한다.
 *
 * 식별기호 구분자는 "▼"(국립중앙도서관 표시 관례)를 그대로 편집 화면의 실제 문자로
 * 쓴다 — 진짜 MARC 바이너리 구분자(0x1F, Unit Separator)는 눈에 안 보이는 제어문자라
 * 화면에 직접 놓고 편집할 수 없다(글꼴에 따라 아예 안 그려지거나 캐럿 위치를 알기
 * 어려움). "▼"는 실제로 보이고 클릭·선택·삭제가 되는 진짜 한 글자라 예전에 겪었던
 * "안 보이는 문자 + 화면에만 다른 걸 겹쳐 보여주기" 방식의 캐럿 버그를 피할 수 있다.
 * 0x1F로의 진짜 변환은 IsbnConvert.tsx의 "전체복사"에서만 일어난다(lib/mrk.ts의
 * serializeRecordAsMarcBinary). */
function tokenizeRow(rowText: string): RowToken[] {
  const tag = rowText.slice(0, 3)
  const tokens: RowToken[] = [{ text: tag, cls: 'tok-tag' }]

  if (isControlTag(tag)) {
    const rest = rowText.slice(3)
    if (rest) tokens.push({ text: rest, cls: 'tok-raw' })
    return tokens
  }

  const ind = rowText.slice(3, 5)
  if (ind) tokens.push({ text: ind, cls: 'tok-ind' })
  const rest = rowText.slice(5)
  if (!rest) return tokens

  const re = /▼(.)([^▼]*)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(rest))) {
    if (m.index > lastIndex) tokens.push({ text: rest.slice(lastIndex, m.index), cls: 'tok-raw' })
    // "▼"와 코드 글자를 별도 토큰(span)으로 나눈다 — 텍스트 내용은 합쳐서 보나
    // ("▼a") 똑같지만(TreeWalker/caret 계산엔 영향 없음), 삼각형 기호만 따로
    // 작게 그리고 싶어서(코드 글자는 그대로 원래 크기) 스타일링 단위를 쪼갠다.
    tokens.push({ text: '▼', cls: 'tok-delim' })
    tokens.push({ text: m[1], cls: 'tok-dollar' })
    if (m[2]) tokens.push({ text: m[2], cls: 'tok-val' })
    lastIndex = re.lastIndex
  }
  if (lastIndex < rest.length) tokens.push({ text: rest.slice(lastIndex), cls: 'tok-raw' })
  return tokens
}

function buildRowHtml(rowText: string): string {
  const tokens = tokenizeRow(rowText)
  const tooltip = escapeHtml(TAG_META[rowText.slice(0, 3)] ?? '')
  return tokens
    .map((t, i) => {
      const attrs = i === 0 ? ` data-tooltip="${tooltip}"` : ''
      return `<span class="${t.cls}"${attrs}>${escapeHtml(t.text) || ZWSP}</span>`
    })
    .join('')
}

/** MrkField(구조화된 상태) → 편집용 순수 텍스트 한 줄.
 * rowTextToField와 반드시 "글자 하나도 안 바뀌게" 왕복해야 한다(아래 rowTextToField의
 * 코멘트 참고) — 코드가 빈 서브필드는 "▼"를 안 붙이고 값만 그대로 내보내고, 지시기호는
 * 사용자가 실제로 입력한 글자를 그대로 내보낸다(빈 값일 때만 '\'로 채운다). */
function fieldToRowText(f: MrkField): string {
  if (f.kind === 'control') return f.tag + f.value
  // mrk 원문(parseMrkText)에서 빈 지시기호는 "\"로 들어온다 — 그걸 편집 화면에
  // 그대로 보여주면 사서 입장에선 뜬금없는 백슬래시로 보인다. 화면에는 실제로
  // 스페이스를 친 것처럼 빈 칸으로 보여주고, 내보낼 때만 lib/mrk.ts의
  // serializeField가 다시 "\"로 정리한다(그 반대 방향 정리).
  //
  // 반드시 "\"일 때만 스페이스로 바꾼다 — 빈 문자열("")일 때는 절대 바꾸면 안 된다.
  // 빈 문자열은 rowTextToField가 "아직 그 자리까지 안 쳤다"는 뜻으로만 만든다(태그를
  // 새로 만들어서 "7"까지만 쳤을 때 등). 여기서 그걸 스페이스로 채우면 아직 3자리도
  // 안 된 태그 뒤에 스페이스 2칸이 몰래 끼어들어 rowTextToField(rowText)를 다시
  // fieldToRowText에 넣었을 때 원래 글자 수와 달라지고("7" → "7  "), 그 차이 때문에
  // "이미 동기화된 행"으로 착각 못 하고 캐럿 복원 없이 다시 그려버려 캐럿이 맨 앞으로
  // 튕기는 버그가 났다(타이핑이 거꾸로 되는 것처럼 보이고 Backspace도 매번 "행 맨 앞"
  // 취급돼서 막혔던 원인). 실제 백엔드 데이터의 빈 지시기호는 항상 "\"로 들어오지
  // 빈 문자열로 오지 않으므로, 이 조건으로 좁혀도 원래 기능은 그대로다.
  const ind1 = f.ind1 === '\\' ? ' ' : f.ind1
  const ind2 = f.ind2 === '\\' ? ' ' : f.ind2
  const sf = f.subfields.map((s) => (s.code ? `▼${s.code}${s.value}` : s.value)).join('')
  return f.tag + ind1 + ind2 + sf
}

/**
 * 순수 텍스트 한 줄 → MrkField. tokenizeRow와 같은 위치 규칙을 쓴다(진짜 파싱, 색칠용
 * 아님) — 저장 시 검증은 이 결과를 보고 별도로 한다.
 *
 * 절대 글자를 바꾸거나 버리면 안 된다(이 함수와 fieldToRowText는 항상 정확히 왕복해야
 * 한다) — "▼" 앞에 뜬금없는 텍스트가 낀 순간도 있을 수 있는데(예: 태그를 고치는 도중
 * 지시기호 칸이 밀려서 "▼"를 삼켜버린 경우) 코드가 빈 서브필드({code:'', value:그
 * 텍스트})로 보존한다. 저장 검증에서 "코드 없음"으로 걸러지긴 하지만 데이터 자체는
 * 안 사라진다. 지시기호에 남는 스페이스도 여기서 바꾸지 않는다(내보내기 시점인
 * lib/mrk.ts의 serializeField에서만 '\'로 정리) — 편집 중 눈앞에서 글자가 바뀌는
 * 것처럼 보이는 걸 막기 위함.
 */
function rowTextToField(rowText: string): MrkField {
  const tag = rowText.slice(0, 3)
  if (isControlTag(tag)) return { tag, kind: 'control', value: rowText.slice(3) }

  const ind1 = rowText[3] ?? ''
  const ind2 = rowText[4] ?? ''
  const rest = rowText.slice(5)
  const subfields: MrkSubfield[] = []
  const re = /▼(.)([^▼]*)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(rest))) {
    if (m.index > lastIndex) subfields.push({ code: '', value: rest.slice(lastIndex, m.index) })
    subfields.push({ code: m[1], value: m[2] })
    lastIndex = re.lastIndex
  }
  if (lastIndex < rest.length) subfields.push({ code: '', value: rest.slice(lastIndex) })
  return { tag, kind: 'data', ind1, ind2, subfields }
}

function getCaretOffsetInRow(root: HTMLElement): number | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!root.contains(range.startContainer)) return null
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let offset = 0
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    const clean = stripPlaceholder(node.data)
    if (node === range.startContainer) return offset + Math.min(range.startOffset, clean.length)
    offset += clean.length
  }
  return offset
}

/** root 안의 임의의 (node, nodeOffset) 지점이 root 기준 몇 번째 문자 오프셋인지
 * 계산한다 — getCaretOffsetInRow와 같은 걷기 로직이지만 "지금 caret"이 아니라
 * 특정 Range 경계(예: 선택 범위의 시작/끝)를 대상으로 써야 할 때 필요하다(Enter로
 * 필드를 쪼갤 때 선택 범위 양끝을 각각 알아야 함). */
function offsetOfPoint(root: HTMLElement, node: Node, nodeOffset: number): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let offset = 0
  let n: Text | null
  while ((n = walker.nextNode() as Text | null)) {
    const clean = stripPlaceholder(n.data)
    if (n === node) return offset + Math.min(nodeOffset, clean.length)
    offset += clean.length
  }
  return offset
}

function setCaretOffsetInRow(root: HTMLElement, offset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let remaining = offset
  let lastNode: Text | null = null
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    lastNode = node
    const isPlaceholder = node.data.includes(ZWSP)
    const len = isPlaceholder ? 0 : node.data.length
    if (remaining <= len) {
      const range = document.createRange()
      range.setStart(node, isPlaceholder ? 0 : remaining)
      range.collapse(true)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      return
    }
    remaining -= len
  }
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  if (lastNode) range.setStart(lastNode, lastNode.data.length)
  else range.selectNodeContents(root)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

/** node에서부터 위로 올라가며 가장 가까운 .field-row 조상을 찾는다 — container 밖으로는
 * 안 나간다. keydown/input의 e.target은 합쳐진 편집 루트 자신을 가리켜서 못 쓰기
 * 때문에(span은 자체적으로 포커스를 못 받는다), Selection 기준으로 "지금 caret이 어느
 * 필드에 있는지"를 직접 찾아야 한다. */
function closestFieldRow(node: Node | null, container: HTMLElement): HTMLElement | null {
  let el: Node | null = node
  while (el && el !== container) {
    if (el instanceof HTMLElement && el.classList.contains('field-row')) return el
    el = el.parentNode
  }
  return null
}

/** Alt 단독 tap으로 뜨는 식별기호 픽커의 상태 — 열 때의 캐럿 자리(rowIdx/savedOffset)를
 * 같이 들고 있다가, 항목을 고르면 그 자리로 캐럿을 되돌린 뒤 Alt+글자와 같은 방식으로
 * 삽입한다(FieldEditor 안 chooseSubfieldFromPicker 참고). */
interface SubfieldPickerState {
  rowIdx: number
  savedOffset: number
  tag: string
  items: MarcSubfieldMeta[]
  highlightedIndex: number
  rect: CaretRect
}

/**
 * mrk_editor_prototype.html의 필드 편집 카드를 이식 — 다만 프로토타입도 칸/행마다 별도
 * contenteditable이라 여러 필드에 걸친 드래그 선택은 안 됐다. 파일 상단 코멘트에
 * 전체 설계를 적어뒀다.
 */
export default function FieldEditor({
  fields,
  onChange,
  onBeforeStructuralChange,
  onCopyLine,
  pulseSignal,
  tagWarningTooltips,
}: FieldEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const lastSyncedRef = useRef<Map<number, string>>(new Map())
  const composingRowsRef = useRef<Set<number>>(new Set())
  const lastSnapshotTimeRef = useRef<Map<number, number>>(new Map())
  const [pendingFocus, setPendingFocus] = useState<{ row: number; offset: number } | null>(null)

  // ── 지시기호·식별기호 캐럿 힌트 + Alt 단독 tap 식별기호 픽커 ──
  // marcSchema 조회 자체는 src/lib/marcSchema.ts가 하고, 여기서는 "캐럿이 지금 어디에
  // 있는가"만 판단한다(recomputeCaretHint/openSubfieldPicker 참고).
  const [caretHint, setCaretHint] = useState<{ title: string; body: string; rect: CaretRect } | null>(null)
  const [subfieldPicker, setSubfieldPicker] = useState<SubfieldPickerState | null>(null)
  // document 레벨 mousedown 리스너(아래 useEffect)는 한 번만 등록돼 있어 React state를
  // 직접 못 읽으므로(클로저가 첫 렌더 값에 고정됨) ref로 최신값을 따로 미러링한다.
  const subfieldPickerRef = useRef<SubfieldPickerState | null>(null)
  useEffect(() => {
    subfieldPickerRef.current = subfieldPicker
  }, [subfieldPicker])
  // Alt가 다른 키 없이 "단독으로" 눌렸다 떼졌는지 추적 — keydown에서 Alt가 눌리면 true,
  // Alt가 아닌 다른 키가 끼어들면(Alt+글자 조합 포함) 곧바로 false로 꺼진다. keyup에서
  // 여전히 true일 때만 "단독 tap"으로 보고 식별기호 픽커를 연다.
  const altArmedRef = useRef(false)

  // rowIdx별로 "같은" ref 콜백 함수를 재사용한다 — 인라인 화살표 함수를 ref에 직접
  // 넘기면 렌더마다 새 함수 레퍼런스가 되어 React가 매 렌더마다 detach(null)→
  // reattach(엘리먼트) 사이클을 돈다. 예전에 바로 이것 때문에 매 키 입력마다
  // lastSyncedRef가 지워져서 두 번째 글자부터 사라지는 버그가 있었다(Playwright로
  // 재현해서 찾음) — 콜백을 캐싱해서 재사용하면 그 사이클 자체가 안 생긴다.
  const rowRefCallbacks = useRef<Map<number, (el: HTMLDivElement | null) => void>>(new Map())
  function getRowRefCallback(rowIdx: number) {
    let cb = rowRefCallbacks.current.get(rowIdx)
    if (!cb) {
      cb = (el) => {
        if (el) {
          if (rowRefs.current.get(rowIdx) !== el) lastSyncedRef.current.delete(rowIdx)
          rowRefs.current.set(rowIdx, el)
        } else {
          rowRefs.current.delete(rowIdx)
        }
      }
      rowRefCallbacks.current.set(rowIdx, cb)
    }
    return cb
  }

  /** 지금 caret(또는 선택 시작점)이 있는 행의 인덱스. 없으면 null. */
  function currentRowIndex(): number | null {
    const containerEl = containerRef.current
    if (!containerEl) return null
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return null
    const rowEl = closestFieldRow(sel.getRangeAt(0).startContainer, containerEl)
    return rowEl ? Number(rowEl.dataset.row) : null
  }

  /** 지금 캐럿(collapsed 선택)의 뷰포트 좌표 — 말풍선/픽커를 그 근처에 띄우는 데 쓴다.
   * 선택이 없거나 범위 선택 중이면 null(그 경우 호출한 쪽에서 힌트 자체를 안 띄운다). */
  function getCaretRect(): CaretRect | null {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null
    const range = sel.getRangeAt(0)
    const rects = range.getClientRects()
    const r = rects.length > 0 ? rects[0] : range.getBoundingClientRect()
    if (r.left === 0 && r.top === 0 && r.bottom === 0) return null
    return { left: r.left, top: r.top, bottom: r.bottom }
  }

  /** 캐럿이 지시기호 자리(태그 뒤 3~4번째 글자)나 이미 입력된 식별기호 코드 글자
   * 위/직후에 있으면 그 의미를 말풍선으로 띄운다 — "지시기호에 유효한 값이 입력되면
   * 이름·의미를 보여준다"와 "식별기호 알파벳에 커서가 갔을 때 의미를 보여준다"를 캐럿
   * 위치 하나로 함께 판단한다. document의 selectionchange(아래 useEffect)에서 호출된다. */
  function recomputeCaretHint() {
    const containerEl = containerRef.current
    if (!containerEl) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) {
      setCaretHint(null)
      return
    }
    const rowEl = closestFieldRow(sel.getRangeAt(0).startContainer, containerEl)
    if (!rowEl) {
      setCaretHint(null)
      return
    }
    const rowIdx = Number(rowEl.dataset.row)
    const contentEl = rowRefs.current.get(rowIdx)
    const offset = contentEl ? getCaretOffsetInRow(contentEl) : null
    if (!contentEl || offset === null) {
      setCaretHint(null)
      return
    }
    const rowText = stripPlaceholder(contentEl.textContent ?? '')
    const tag = rowText.slice(0, 3)
    if (!isThreeDigitTag(tag) || isControlTag(tag)) {
      setCaretHint(null)
      return
    }

    // 지시기호: 오프셋 3/4/5가 각각 1·2지시기호와 맞닿아 있다. 글자를 막 입력하면
    // 캐럿이 그 글자 "뒤"로 넘어가므로(offset 3에 "2"를 치면 캐럿은 offset 4가 됨),
    // "방금 입력한 값"을 보여주려면 오프셋 4는 우선 1지시기호(바로 앞 글자)로,
    // 오프셋 5는 2지시기호(바로 앞 글자)로 해석해야 한다 — 그래야 "유효한 값이
    // 입력되면" 요구사항대로 타이핑 직후에 뜬다. 오프셋 3은 아직 아무것도 안 지나온
    // 자리라 그 자리(=1지시기호)의 글자를 그대로 본다. 오프셋 4에서 1지시기호가
    // 정의된 값이 아니면(아직 안 쳤거나 무효값) 2지시기호(그 자리에 이미 있는 값)로
    // 대체한다 — 클릭으로 캐럿만 옮겨온 경우를 위한 보조.
    if (offset === 3 || offset === 4 || offset === 5) {
      let pos: 1 | 2 | null = null
      let hint = null as ReturnType<typeof getIndicatorHint>
      if (offset === 3 && rowText.length > 3) {
        pos = 1
        hint = getIndicatorHint(tag, 1, rowText[3])
      } else if (offset === 4) {
        if (rowText.length > 3) hint = getIndicatorHint(tag, 1, rowText[3])
        if (hint) pos = 1
        else if (rowText.length > 4) {
          pos = 2
          hint = getIndicatorHint(tag, 2, rowText[4])
        }
      } else if (offset === 5 && rowText.length > 4) {
        pos = 2
        hint = getIndicatorHint(tag, 2, rowText[4])
      }
      const rect = hint && getCaretRect()
      setCaretHint(hint && pos && rect ? { title: `${pos}지시기호 — ${hint.name}`, body: hint.meaning, rect } : null)
      return
    }

    // 식별기호: "▼코드" 쌍의 코드 글자 직전/직후에 캐럿이 있는지 찾는다 — Alt+글자로
    // 막 삽입한 직후 캐럿이 서는 자리와 같은 위치라 자연스럽게 뜬다.
    const rest = rowText.slice(5)
    const re = /▼(.)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(rest))) {
      const codeIdx = 5 + m.index + 1
      if (offset === codeIdx || offset === codeIdx + 1) {
        const hint = getSubfieldHint(tag, m[1])
        const rect = hint && getCaretRect()
        setCaretHint(
          hint && rect
            ? { title: `▼${hint.code} — ${hint.name}`, body: hint.repeatable ? '반복 가능' : '반복 불가', rect }
            : null,
        )
        return
      }
    }
    setCaretHint(null)
  }

  /** handleContainerKeyUp(Alt 단독 tap)에서 호출 — 현재 캐럿이 있는 데이터필드 행의
   * 식별기호 목록을 그 자리에 띄운다. 제어필드·아직 3자리가 안 된 태그·스키마에 없는
   * 태그·캐럿 위치를 못 구하는 경우엔 조용히 무시한다(픽커 없이 기존 Alt+글자 단축키만
   * 계속 동작). */
  function openSubfieldPicker() {
    const rowIdx = currentRowIndex()
    if (rowIdx === null) return
    const f = fields[rowIdx]
    if (!f || f.kind !== 'data') return
    const items = listSubfields(f.tag)
    if (items.length === 0) return
    const rowEl = rowRefs.current.get(rowIdx)
    const savedOffset = rowEl ? getCaretOffsetInRow(rowEl) : null
    const rect = getCaretRect()
    if (!rowEl || savedOffset === null || !rect) return
    setCaretHint(null)
    setSubfieldPicker({ rowIdx, savedOffset, tag: f.tag, items, highlightedIndex: 0, rect })
  }

  function closeSubfieldPicker() {
    setSubfieldPicker(null)
  }

  /** 픽커에서 코드를 고르면(클릭 또는 Enter) 픽커를 열 때 저장해둔 캐럿 자리로 먼저
   * 되돌아간 뒤 Alt+글자와 완전히 같은 방식으로 삽입한다 — ▲ 표시/색상/직렬화 등 기존
   * 로직을 그대로 재사용하기 위함. */
  function chooseSubfieldFromPicker(code: string) {
    const picker = subfieldPicker
    if (!picker) return
    const rowEl = rowRefs.current.get(picker.rowIdx)
    if (rowEl) {
      containerRef.current?.focus()
      setCaretOffsetInRow(rowEl, picker.savedOffset)
    }
    document.execCommand('insertText', false, '▼' + code)
    setSubfieldPicker(null)
  }

  /** 이 행의 라이브 DOM(순수 텍스트)을 읽어 React 상태로 내보내고, 그 자리에서 다시
   * 그려 색을 최신화한다 — caret은 절대 문자 오프셋으로 저장했다가 그대로 복원한다. */
  function syncRowFromDom(rowIdx: number) {
    const rowEl = rowRefs.current.get(rowIdx)
    if (!rowEl) return
    const rowText = stripPlaceholder(rowEl.textContent ?? '')
    lastSyncedRef.current.set(rowIdx, rowText)
    onChange(fields.map((f, i) => (i === rowIdx ? rowTextToField(rowText) : f)))

    const caretOffset = getCaretOffsetInRow(rowEl)
    rowEl.innerHTML = buildRowHtml(rowText)
    if (caretOffset !== null) setCaretOffsetInRow(rowEl, caretOffset)
  }

  // 외부 요인(되돌리기·KDC 적용·원본 텍스트 반영·다른 레코드로 전환·저장 검증 실패로
  // 인한 포커스 이동)으로 fields가 바뀌었을 때만 해당 행을 다시 그린다. 평소 타이핑은
  // syncRowFromDom이 자체적으로 처리한다.
  useEffect(() => {
    fields.forEach((f, rowIdx) => {
      const rowEl = rowRefs.current.get(rowIdx)
      if (!rowEl) return
      const rowText = fieldToRowText(f)
      const isPendingTarget = pendingFocus?.row === rowIdx
      if (!isPendingTarget && lastSyncedRef.current.get(rowIdx) === rowText) return

      rowEl.innerHTML = buildRowHtml(rowText)
      lastSyncedRef.current.set(rowIdx, rowText)

      if (isPendingTarget && pendingFocus) {
        containerRef.current?.focus()
        setCaretOffsetInRow(rowEl, pendingFocus.offset)
      }
    })
    if (pendingFocus) setPendingFocus(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, pendingFocus])

  // prototype의 applyClassification() — 행을 잠깐 반짝이고 화면 가운데로 스크롤.
  useEffect(() => {
    if (!pulseSignal) return
    const el = containerRef.current?.querySelector<HTMLElement>(`.field-row[data-tag="${pulseSignal.tag}"]`)
    if (!el) return
    el.classList.remove('pulse')
    void el.offsetWidth
    el.classList.add('pulse')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [pulseSignal])

  // 캐럿이 움직일 때마다(타이핑·클릭·방향키 — syncRowFromDom/pendingFocus 복원도 전부
  // Selection.addRange를 거치므로 이 리스너 하나로 대부분 잡힌다) 지시기호·식별기호
  // 힌트를 다시 계산한다. recomputeCaretHint는 ref/순수 함수만 참조해서 fields를 직접
  // 읽지 않으므로(행의 실제 DOM 텍스트를 읽는다) 렌더마다 리스너를 다시 등록할 필요가
  // 없다 — 마운트 시 한 번만 붙인다.
  useEffect(() => {
    function handleSelectionChange() {
      const containerEl = containerRef.current
      const sel = window.getSelection()
      if (!containerEl || !sel || sel.rangeCount === 0 || !containerEl.contains(sel.getRangeAt(0).startContainer)) {
        setCaretHint(null)
        return
      }
      recomputeCaretHint()
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 스크롤되면 캐럿 rect가 낡아지므로(다시 계산하기보단) 그냥 닫는다 — 다음
  // selectionchange나 Alt tap에서 새 위치로 다시 뜬다.
  useEffect(() => {
    function handleScroll() {
      setCaretHint(null)
      setSubfieldPicker(null)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [])

  // 픽커가 열린 상태에서 픽커 바깥(에디터 안 다른 자리 포함)을 클릭하면 닫는다 — 목록
  // 자체 클릭(항목 선택)은 SubfieldPicker의 li가 onMouseDown에서 e.preventDefault()로
  // 먼저 처리하므로, 여기서는 항상 "픽커 바깥 클릭"만 걸러진다.
  useEffect(() => {
    function handleDocMouseDown(e: MouseEvent) {
      if (!subfieldPickerRef.current) return
      if ((e.target as HTMLElement)?.closest?.('.marc-subfield-picker')) return
      setSubfieldPicker(null)
    }
    document.addEventListener('mousedown', handleDocMouseDown, true)
    return () => document.removeEventListener('mousedown', handleDocMouseDown, true)
  }, [])

  /** rowIdx 행을 (startOffset, endOffset) 지점에서 둘로 쪼갠다 — 앞부분은 그 자리에
   * 남고, 뒷부분(선택 범위가 있었다면 그 사이 글자는 버려짐 — 일반 텍스트 에디터의
   * Enter와 같은 동작)은 새 필드로 바로 다음 줄에 들어간다. 커서가 행 맨 끝에 있었으면
   * (startOffset===endOffset===전체 길이) 뒷부분이 빈 문자열이라 그냥 빈 새 필드가
   * 하나 생기는 것과 같다 — 예전에 Alt+Enter가 "필드 끝에서만" 하던 일이 이제
   * Enter 하나로 통일된 것뿐이다.
   *
   * 앞/뒤 둘 다 rowTextToField로 다시 파싱한다 — 그 함수는 rowText가 무슨 모양이든
   * (태그 3자리가 안 채워졌어도) 절대 안 던지므로, 값 중간에서 Enter를 쳐서 뒷부분이
   * "▼d새뮤얼..." 같은 걸로 시작해도 tag="▼d새"(당연히 숫자 3자리가 아님)로 그대로
   * 보존된다 — 그 상태는 render의 tagOk가 실시간으로 오류 표시를 띄우고, 사서가
   * 정당한 3자리 숫자로 고치면 다음 렌더에서 저절로 사라진다. */
  function splitFieldAt(rowIdx: number, startOffset: number, endOffset: number) {
    const rowEl = rowRefs.current.get(rowIdx)
    if (!rowEl) return
    const fullText = stripPlaceholder(rowEl.textContent ?? '')
    const before = fullText.slice(0, startOffset)
    const after = fullText.slice(endOffset)
    const next = [...fields]
    next[rowIdx] = rowTextToField(before)
    next.splice(rowIdx + 1, 0, rowTextToField(after))
    onBeforeStructuralChange?.()
    onChange(next)
    setPendingFocus({ row: rowIdx + 1, offset: 0 })
  }

  /** 타이핑이 한동안(800ms) 없다가 다시 시작될 때만 되돌리기 스냅샷을 남긴다 — 매
   * 글자마다 남기면 한 단어 지우는 데도 여러 번 Ctrl+Z를 눌러야 해서 정신없다. */
  function maybeSnapshot(rowIdx: number) {
    const now = Date.now()
    const last = lastSnapshotTimeRef.current.get(rowIdx) ?? 0
    if (now - last > 800) {
      onBeforeStructuralChange?.()
      lastSnapshotTimeRef.current.set(rowIdx, now)
    }
  }

  function handleContainerInput() {
    const rowIdx = currentRowIndex()
    if (rowIdx === null) return
    if (composingRowsRef.current.has(rowIdx)) return // 한글 등 IME 조합 중엔 손대지 않는다
    maybeSnapshot(rowIdx)
    syncRowFromDom(rowIdx)
  }
  function handleContainerCompositionStart() {
    const rowIdx = currentRowIndex()
    if (rowIdx !== null) composingRowsRef.current.add(rowIdx)
  }
  function handleContainerCompositionEnd() {
    const rowIdx = currentRowIndex()
    if (rowIdx === null) return
    composingRowsRef.current.delete(rowIdx)
    maybeSnapshot(rowIdx)
    syncRowFromDom(rowIdx)
  }

  // Enter = 커서(또는 선택 범위) 위치에서 그 필드를 둘로 쪼개 새 데이터 필드를
  // 만든다(splitFieldAt) — 커서가 필드 맨 끝에 있으면 실질적으로 "빈 새 필드 추가"와
  // 같다. 여러 필드에 걸친 선택 상태에서는 막는다(아래 crossesRows 처리). Shift+Enter도
  // 똑같이 취급한다 — Enter의 의미가 "다음 행으로 이동"에서 "필드 쪼개기"로 바뀌면서
  // Shift+Enter만 따로 "이전 행으로 이동"으로 남겨둘 이유가 없어졌다(행 이동은 방향키로
  // 자유롭게 되는, 이 편집기 원래의 전제 그대로).
  // Alt+Enter = 필드를 쪼개지 않고 그 값 안에 줄바꿈을 하나 꽂아 넣는다(브라우저
  // 기본 동작 그대로 둠 — serializeField가 내보낼 때 공백 하나로 접어준다).
  // Alt+글자 = "▼글자" 두 글자를 caret 위치에 꽂아 넣는 편의 단축키(▼는 국중 표시
  // 관례를 그대로 편집 화면의 실제 문자로 쓴 것 — tokenizeRow 위 코멘트 참고).
  //
  // 여러 필드에 걸친 선택 상태에서 지우기/타이핑/붙여넣기/Enter를 막는다 — 필드끼리
  // 실제로 합쳐지거나 뜬금없이 쪼개지면 MRK 구조 자체가 깨지기 때문. 선택(그래서
  // 드래그 복사)은 이 핸들러를 안 거치니 그대로 자유롭다. 같은 이유로, 한 필드의
  // 맨 앞/맨 끝에서 Backspace/Delete로 옆 필드와 합쳐지려는 것도 막는다 — 다만 그
  // 필드가 완전히 비어 있으면(Enter로 쪼갰다가 그냥 지우고 싶은 경우) Backspace가
  // 그 빈 행 자체를 지워준다.
  function handleContainerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.nativeEvent.isComposing) return

    // Alt 단독 tap 감지: Alt가 아닌 다른 키가 끼어들면(Alt+글자 조합 포함) 자격을
    // 취소한다 — handleContainerKeyUp에서 여전히 true일 때만 "단독으로 눌렀다 뗐다"로
    // 보고 식별기호 픽커를 연다.
    if (e.key === 'Alt') altArmedRef.current = true
    else altArmedRef.current = false

    if (subfieldPicker) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSubfieldPicker({ ...subfieldPicker, highlightedIndex: (subfieldPicker.highlightedIndex + 1) % subfieldPicker.items.length })
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSubfieldPicker({
          ...subfieldPicker,
          highlightedIndex: (subfieldPicker.highlightedIndex - 1 + subfieldPicker.items.length) % subfieldPicker.items.length,
        })
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        chooseSubfieldFromPicker(subfieldPicker.items[subfieldPicker.highlightedIndex].code)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSubfieldPicker()
        return
      }
      // 방향키/Enter/Escape가 아닌 다른 키(타이핑 등)는 픽커를 닫고 평소대로 흘려보낸다
      // (아래로 계속 진행 — 예: 그냥 "a"를 치면 픽커는 닫히고 "a"는 정상적으로 입력된다).
      closeSubfieldPicker()
    }

    const containerEl = containerRef.current
    if (!containerEl) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const startRow = closestFieldRow(range.startContainer, containerEl)
    const endRow = closestFieldRow(range.endContainer, containerEl)
    const crossesRows = startRow !== endRow

    if (e.key === 'Enter') {
      if (e.altKey) return // 값 안에 줄바꿈 — 브라우저 기본 동작 그대로 둠
      if (crossesRows || !startRow) {
        e.preventDefault()
        return
      }
      const rowIdx = Number(startRow.dataset.row)
      const contentEl = rowRefs.current.get(rowIdx)
      if (!contentEl) return
      e.preventDefault()
      const startOffset = offsetOfPoint(contentEl, range.startContainer, range.startOffset)
      const endOffset = sel.isCollapsed ? startOffset : offsetOfPoint(contentEl, range.endContainer, range.endOffset)
      splitFieldAt(rowIdx, startOffset, endOffset)
      return
    }

    const isEditingKey =
      e.key === 'Backspace' || e.key === 'Delete' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)
    if (crossesRows && isEditingKey) {
      e.preventDefault()
      return
    }

    if (e.altKey && !e.ctrlKey && !e.metaKey && /^[a-zA-Z0-9]$/.test(e.key)) {
      e.preventDefault()
      document.execCommand('insertText', false, '▼' + e.key.toLowerCase())
      return
    }

    if (!crossesRows && sel.isCollapsed && startRow && (e.key === 'Backspace' || e.key === 'Delete')) {
      const rowIdx = Number(startRow.dataset.row)
      const contentEl = rowRefs.current.get(rowIdx)
      if (contentEl) {
        const offset = getCaretOffsetInRow(contentEl)
        const len = stripPlaceholder(contentEl.textContent ?? '').length
        if (e.key === 'Backspace' && offset === 0 && rowIdx > 0) {
          e.preventDefault()
          if (len === 0) {
            // 완전히 빈 행이면 옆 필드와 합칠 내용 자체가 없다 — 그 행을 지우고
            // 이전 필드 끝으로 이동한다(Alt+Enter로 새 필드를 만들었다가 취소하는
            // 유일한 방법).
            const prevRowIdx = rowIdx - 1
            const prevLen = stripPlaceholder(rowRefs.current.get(prevRowIdx)?.textContent ?? '').length
            onBeforeStructuralChange?.()
            onChange(fields.filter((_, i) => i !== rowIdx))
            setPendingFocus({ row: prevRowIdx, offset: prevLen })
          }
          return
        }
        if (e.key === 'Delete' && offset === len && rowIdx < fields.length - 1) {
          e.preventDefault()
          return
        }
      }
    }
  }

  /** Alt를 다른 키 없이 눌렀다 뗀 경우에만(altArmedRef가 handleContainerKeyDown에서
   * 계속 true로 유지돼 있던 경우) 식별기호 픽커를 연다 — Alt+글자 조합은 keydown에서
   * 이미 altArmedRef를 꺼두므로 그 조합을 쓰고 Alt를 뗄 때는 여기 안 걸린다. */
  function handleContainerKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Alt' && altArmedRef.current) {
      altArmedRef.current = false
      openSubfieldPicker()
    }
  }

  // 여러 필드에 걸친 선택 상태로는 붙여넣기도 막는다(같은 이유). 한 필드 안이면
  // 허용하되, 줄바꿈은 공백으로 접어서 꽂아 넣는다 — 붙여넣기로 필드가 여러 줄로
  // 쪼개지는 걸 막기 위함(줄바꿈이 필요하면 Alt+Enter를 쓰면 된다).
  function handleContainerPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const containerEl = containerRef.current
    const sel = window.getSelection()
    if (!containerEl || !sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const startRow = closestFieldRow(range.startContainer, containerEl)
    const endRow = closestFieldRow(range.endContainer, containerEl)
    if (startRow !== endRow) return
    const text = e.clipboardData.getData('text/plain').replace(/\r?\n/g, ' ')
    document.execCommand('insertText', false, text)
  }

  // 경고 아이콘·행 복사 버튼(contentEditable=false 섬) 클릭이 caret 이동으로 오인되지
  // 않게 — contenteditable 영역 안에서 버튼을 누르면 브라우저가 먼저 선택부터
  // 옮기려 드는 경우가 있다.
  function handleContainerMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).tagName === 'BUTTON') e.preventDefault()
  }

  /** 마우스로 드래그해서 여러 글자/여러 필드에 걸쳐 선택한 뒤 Ctrl+C(또는 우클릭
   * 복사)로 바로 복사할 때도 "전체 복사" 버튼과 같은 진짜 MARC 바이너리 구분자로
   * 나가게 한다 — 이전까지는 "전체 복사"를 눌러야만 진짜 0x1F/0x1E가 나갔고, 드래그
   * 복사는 브라우저 기본 동작대로 화면에 보이는 문자(▼ 등) 그대로 담겼다.
   *
   * 선택 범위를 행 단위로 쪼갠다(closestFieldRow + offsetOfPoint — splitFieldAt과
   * 같은 방식). 각 행에서 실제로 선택된 부분 문자열만 toRealMarcRowFragment로
   * 바꾸고, 그 행의 "끝까지" 온전히 선택된 경우에만 뒤에 진짜 필드 종료 0x1E(+CRLF)를
   * 붙인다 — 값 중간에서 드래그가 끊긴 마지막 행은 거기 없는 "필드 끝"을 만들어내면
   * 안 되므로 아무것도 안 붙인다. Range는 항상 start<=end로 정규화돼 있으므로(드래그
   * 방향과 무관) loIdx<=hiIdx로 그대로 순회하면 된다 — hiIdx가 아닌 행은 전부
   * sliceEnd가 그 행의 끝이라 자동으로 매 행 끝에 0x1E가 붙는다(행 사이 구분자를
   * 따로 안 넣어도 된다). 레코드 종료 0x1D는 여기서 절대 안 붙인다 — 부분 선택은
   * "레코드 전체"가 아니므로 그건 "전체 복사"만의 몫이다. */
  function handleContainerCopy(e: React.ClipboardEvent<HTMLDivElement>) {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return
    const containerEl = containerRef.current
    if (!containerEl) return
    const range = sel.getRangeAt(0)
    const startRow = closestFieldRow(range.startContainer, containerEl)
    const endRow = closestFieldRow(range.endContainer, containerEl)
    if (!startRow || !endRow) return

    const loIdx = Number(startRow.dataset.row)
    const hiIdx = Number(endRow.dataset.row)
    const parts: string[] = []

    for (let i = loIdx; i <= hiIdx; i++) {
      const contentEl = rowRefs.current.get(i)
      if (!contentEl) continue
      const fullText = stripPlaceholder(contentEl.textContent ?? '')
      const sliceStart = i === loIdx ? offsetOfPoint(contentEl, range.startContainer, range.startOffset) : 0
      const sliceEnd = i === hiIdx ? offsetOfPoint(contentEl, range.endContainer, range.endOffset) : fullText.length
      const marcFragment = toRealMarcRowFragment(fullText.slice(sliceStart, sliceEnd))
      parts.push(sliceEnd === fullText.length ? marcFragment + MARC_FT + '\r\n' : marcFragment)
    }

    e.clipboardData.setData('text/plain', parts.join(''))
    e.preventDefault()
  }

  return (
    <>
      <div
        className="field-rows"
        contentEditable
        suppressContentEditableWarning
        ref={containerRef}
        onInput={handleContainerInput}
        onCompositionStart={handleContainerCompositionStart}
        onCompositionEnd={handleContainerCompositionEnd}
        onKeyDown={handleContainerKeyDown}
        onKeyUp={handleContainerKeyUp}
        onPaste={handleContainerPaste}
        onCopy={handleContainerCopy}
        onMouseDown={handleContainerMouseDown}
      >
        {fields.map((f, rowIdx) => {
          const missing = missingSubfields(f)
          const tagOk = isThreeDigitTag(f.tag)
          const qualityTooltip = tagWarningTooltips?.[f.tag]
          return (
            <div
              key={rowIdx}
              className={'field-row' + (missing.length ? ' has-warning' : '') + (tagOk ? '' : ' tag-error')}
              data-tag={f.tag}
              data-row={rowIdx}
              style={{ ['--rail-color' as string]: RAIL_COLOR[f.tag] ?? (f.kind === 'control' ? 'var(--rail-control)' : 'transparent') }}
            >
              <div className="field-row-content" data-row={rowIdx} ref={getRowRefCallback(rowIdx)} />
              {missing.length > 0 && (
                <div
                  className="warn-icon"
                  contentEditable={false}
                  data-tooltip={`필수 서브필드 누락: ▼${missing.join(', ▼')}`}
                >
                  ⚠
                </div>
              )}
              {qualityTooltip && (
                <div
                  className="quality-icon tooltip-pre"
                  contentEditable={false}
                  data-tooltip={qualityTooltip}
                >
                  ⚠️
                </div>
              )}
              <div className="row-actions" contentEditable={false}>
                <button
                  type="button"
                  className="row-copy"
                  data-tooltip="이 필드 복사"
                  onClick={() => onCopyLine(serializeField(f))}
                >
                  ⧉
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {caretHint && <IndicatorSubfieldTooltip rect={caretHint.rect} title={caretHint.title} body={caretHint.body} />}
      {subfieldPicker && (
        <SubfieldPicker
          rect={subfieldPicker.rect}
          tag={subfieldPicker.tag}
          items={subfieldPicker.items}
          highlightedIndex={subfieldPicker.highlightedIndex}
          onHoverIndex={(i) => setSubfieldPicker({ ...subfieldPicker, highlightedIndex: i })}
          onChoose={chooseSubfieldFromPicker}
        />
      )}
    </>
  )
}
