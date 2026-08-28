import { useEffect, useRef, useState } from 'react'
import type { MrkField, MrkSubfield } from '../types/mrk'
import { RAIL_COLOR, TAG_META } from '../types/mrk'
import { missingSubfields, serializeField } from '../lib/mrk'
import { updateIndicator, insertSubfieldAtCaret, deleteSubfield, trimSubfieldLeadingSpace } from '../lib/mrkEdit'
import './FieldEditor.css'

interface FocusRequest {
  row: number
  role: string
  caretEnd?: boolean
}

interface FieldEditorProps {
  fields: MrkField[]
  onChange: (fields: MrkField[]) => void
  /** 서브필드 삭제/삽입, 지시기호 변경, 공백 트림처럼 "되돌릴 만한 가치가 있는" 구조적
   * 조작 직전에 호출된다(Ctrl+Z 되돌리기용 스냅샷 — pages/IsbnConvert.tsx가 소유).
   * 값 타이핑은 매 키 입력마다 찍으면 너무 촘촘해서 제외했다. */
  onBeforeStructuralChange?: () => void
  onCopyLine: (line: string) => void
  /** 특정 태그 행을 반짝이며 스크롤로 보여준다(예: 056 KDC 후보 선택 직후) — token이
   * 바뀔 때마다 재실행되므로 같은 태그를 연달아 골라도 다시 반짝인다. */
  pulseSignal?: { tag: string; token: number } | null
}

/*
 * ── 왜 이 파일이 <input>/<textarea> 여러 개가 아니라 행 하나짜리 contentEditable인가 ──
 *
 * "245 00 $a값"을 마우스로 드래그해서 한 번에 긁어 선택/복사하고 싶다는 요구사항 때문이다.
 * 브라우저는 서로 다른 <input>/<textarea>에 걸친 텍스트 선택을 근본적으로 지원하지 않는다
 * (내부 value가 렌더된 텍스트 노드가 아니라서 Selection/Range가 넘나들 수 없음) — 그래서
 * 태그·지시기호·서브필드를 전부 "한 행 = 하나의 contentEditable"로 합쳤다. 구분자($, 태그
 * 뒤 2칸 공백)와 액션 버튼(␣ 트림, × 삭제)은 그 안에 contenteditable="false" 섬으로 박아
 * 넣어서 — 드래그 선택은 자연스럽게 넘나들지만, 타이핑으로 지워지지는 않는다.
 *
 * React가 매 렌더마다 이 영역의 자식을 그려버리면 caret이 맨 앞으로 튀는 유명한 버그가
 * 난다(파일 초반부터 있던 코멘트가 경고하던 바로 그 문제) — 그래서 이 영역의 DOM은
 * React가 아니라 우리가 직접 손으로 관리한다:
 *   1. 평소 타이핑은 브라우저가 alright 처리하게 그냥 둔다(아무 것도 안 함).
 *   2. onInput에서 그 행의 데이터롤 다시 읽어(readRowFromDom) React 상태로 "내보내기만"
 *      한다 — 이 행 자체는 즉시 다시 그리되, caret 위치(문자 오프셋)를 저장했다가 그대로
 *      복원한다(getCaretOffsetInRow/setCaretOffsetInRow).
 *   3. 서브필드 삽입/삭제·지시기호 변경처럼 "구조가 바뀌는" 조작은 여전히 mrkEdit.ts의
 *      순수 함수로 계산한 뒤, 같은 재구성+caret 복원 경로를 pendingFocus로 요청한다.
 *   4. 되돌리기(Ctrl+Z)·KDC 적용·원본 텍스트 반영처럼 "이 행 밖에서" fields가 바뀌면
 *      (lastSyncedRef와 실제 fields가 어긋나면) 그때만 다시 그린다 — 그 외엔 손대지 않는다.
 *
 * 한글 입력(IME 조합) 중에는 이 재구성을 절대 하지 않는다(composingRowsRef) — 조합 중에
 * DOM을 갈아치우면 한글 입력 자체가 깨진다.
 */

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
}
// 완전히 빈 칸은 클릭으로 caret을 놓기 어려워서(폭 0) 폭 없는 문자를 채워둔다 — 읽어낼 때 걷어낸다.
const ZWSP = '​'
function textOrPlaceholder(s: string): string {
  return s.length > 0 ? escapeHtml(s) : ZWSP
}
function stripPlaceholder(s: string): string {
  return s.replace(new RegExp(ZWSP, 'g'), '')
}

function buildRowHtml(f: MrkField): string {
  const tagTooltip = escapeHtml(TAG_META[f.tag] ?? '')
  const tagSpan = `<span class="tag-badge" data-role="tag" data-tooltip="${tagTooltip}">${textOrPlaceholder(f.tag)}</span>`
  const sep = `<span class="rt-sep" contenteditable="false">&nbsp;&nbsp;</span>`

  if (f.kind === 'control') {
    return `${tagSpan}${sep}<span class="control-val" data-role="control-value">${textOrPlaceholder(f.value)}</span>`
  }

  const indHtml =
    `<span class="ind" data-role="ind1">${textOrPlaceholder(f.ind1)}</span>` +
    `<span class="ind" data-role="ind2">${textOrPlaceholder(f.ind2)}</span>`

  const sfHtml = f.subfields
    .map((sf, i) => {
      const leadSpace = /^\s/.test(sf.value)
      const trimIsland = leadSpace
        ? `<span class="rt-island" contenteditable="false"><button type="button" class="sf-trim" data-sf-trim="${i}" data-tooltip="값 앞에 불필요한 공백이 있어요 — 클릭하면 제거">␣</button></span>`
        : ''
      return (
        `<span class="sf" data-sf-idx="${i}">` +
        `<span class="sf-code-wrap"><span class="sf-dollar" contenteditable="false">$</span>` +
        `<span class="sf-code" data-role="sf-code-${i}">${textOrPlaceholder(sf.code)}</span></span>` +
        trimIsland +
        `<span class="sf-val" data-role="sf-value-${i}">${textOrPlaceholder(sf.value)}</span>` +
        `<span class="rt-island" contenteditable="false"><button type="button" class="sf-del" data-sf-del="${i}" data-tooltip="이 서브필드 삭제">×</button></span>` +
        `</span>`
      )
    })
    .join('')

  return `${tagSpan}${sep}${indHtml}${sfHtml}`
}

/** contenteditable="false" 섬(구분자·$·버튼) 안의 텍스트 노드인지. */
function isInsideNonEditableIsland(node: Node, root: HTMLElement): boolean {
  let el = node.parentElement
  while (el && el !== root) {
    if (el.getAttribute('contenteditable') === 'false') return true
    el = el.parentElement
  }
  return false
}

/** caret 위치를(섬 제외, 실제 데이터 글자 기준) 행 전체에서의 문자 오프셋으로. */
function getCaretOffsetInRow(root: HTMLElement): number | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!root.contains(range.startContainer)) return null
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let offset = 0
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    if (isInsideNonEditableIsland(node, root)) continue
    const clean = stripPlaceholder(node.data)
    if (node === range.startContainer) {
      return offset + Math.min(range.startOffset, clean.length)
    }
    offset += clean.length
  }
  return offset
}

/** getCaretOffsetInRow의 역 — 문자 오프셋을 실제 DOM Range로 되돌린다. */
function setCaretOffsetInRow(root: HTMLElement, offset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let remaining = offset
  let lastNode: Text | null = null
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    if (isInsideNonEditableIsland(node, root)) continue
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

/** role(예: "sf-value-1") 칸의 시작/끝에 해당하는, 행 전체 기준 문자 오프셋. */
function computeRowOffsetForRole(root: HTMLElement, role: string, withinRoleOffset: number): number {
  const target = root.querySelector<HTMLElement>(`[data-role="${role}"]`)
  if (!target) return 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let offset = 0
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    if (isInsideNonEditableIsland(node, root)) continue
    if (target.contains(node)) {
      return offset + Math.min(withinRoleOffset, stripPlaceholder(node.data).length)
    }
    offset += stripPlaceholder(node.data).length
  }
  return offset
}

/**
 * 지금 caret이 들어있는 role 칸을 찾는다 — keydown의 e.target은 못 쓴다: span은 그
 * 자체로 포커스를 받지 못해서, contentEditable 루트(행 div) 안 어디를 타이핑하든
 * e.target은 항상 루트 자신이다(개별 span이 아니라). 그래서 Selection API로 caret이
 * 실제로 어느 role 조상 안에 있는지 직접 찾아야 한다.
 */
function getFocusedRoleElement(root: HTMLElement): HTMLElement | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  let node: Node | null = sel.getRangeAt(0).startContainer
  while (node && node !== root) {
    if (node instanceof HTMLElement && node.dataset.role !== undefined) return node
    node = node.parentNode
  }
  return null
}

function readRoleText(root: HTMLElement, role: string): string {
  const el = root.querySelector<HTMLElement>(`[data-role="${role}"]`)
  return stripPlaceholder(el?.textContent ?? '')
}

function readRowFromDom(root: HTMLElement, prevField: MrkField): MrkField {
  const tag = readRoleText(root, 'tag')
  if (prevField.kind === 'control') {
    return { tag, kind: 'control', value: readRoleText(root, 'control-value') }
  }
  const subfields: MrkSubfield[] = prevField.subfields.map((_, i) => ({
    code: readRoleText(root, `sf-code-${i}`),
    value: readRoleText(root, `sf-value-${i}`),
  }))
  return {
    tag,
    kind: 'data',
    ind1: readRoleText(root, 'ind1') || '\\',
    ind2: readRoleText(root, 'ind2') || '\\',
    subfields,
  }
}

/** 자유 타이핑 후 규칙 정리 — 예전 updateTag/updateSubfieldCode의 정리 규칙과 동일. */
function cleanField(raw: MrkField): MrkField {
  const tag = raw.tag.replace(/[^0-9]/g, '').slice(0, 3)
  if (raw.kind === 'control') return { ...raw, tag }
  return {
    ...raw,
    tag,
    ind1: raw.ind1.slice(0, 1) || '\\',
    ind2: raw.ind2.slice(0, 1) || '\\',
    subfields: raw.subfields.map((sf) => ({
      code: sf.code.replace(/[^0-9a-zA-Z]/g, '').slice(0, 1),
      value: sf.value,
    })),
  }
}

/**
 * mrk_editor_prototype.html의 필드 편집 카드를 이식 — 다만 프로토타입조차 칸마다 별도
 * contenteditable이라 칸을 넘나드는 드래그 선택은 안 됐다. 여기서는 한 행을 통째로 하나의
 * contenteditable로 묶어서 그것까지 가능하게 했다(자세한 설명은 파일 상단 코멘트).
 */
export default function FieldEditor({
  fields,
  onChange,
  onBeforeStructuralChange,
  onCopyLine,
  pulseSignal,
}: FieldEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const lastSyncedRef = useRef<Map<number, string>>(new Map())
  const composingRowsRef = useRef<Set<number>>(new Set())
  const [pendingFocus, setPendingFocus] = useState<FocusRequest | null>(null)

  function commitFields(newFields: MrkField[], rowIdx: number, role: string, caretEnd: boolean) {
    lastSyncedRef.current.set(rowIdx, serializeField(newFields[rowIdx]))
    onChange(newFields)
    setPendingFocus({ row: rowIdx, role, caretEnd })
  }

  /** 이 행의 라이브 DOM을 읽어 React 상태로 내보내고, 그 자리에서 바로 다시 그려 caret을
   * 지킨다 — 자유 타이핑(값/코드/태그/컨트롤값) 전용 경로. */
  function syncRowFromDom(rowIdx: number) {
    const rowEl = rowRefs.current.get(rowIdx)
    const field = fields[rowIdx]
    if (!rowEl || !field) return
    const caretOffset = getCaretOffsetInRow(rowEl)
    const cleaned = cleanField(readRowFromDom(rowEl, field))
    const serialized = serializeField(cleaned)
    lastSyncedRef.current.set(rowIdx, serialized)
    rowEl.innerHTML = buildRowHtml(cleaned)
    if (caretOffset !== null) setCaretOffsetInRow(rowEl, caretOffset)
    onChange(fields.map((f, i) => (i === rowIdx ? cleaned : f)))
  }

  // 외부 요인(되돌리기·KDC 적용·원본 텍스트 반영·다른 레코드로 전환)으로 fields가 바뀌었거나,
  // 구조적 조작이 pendingFocus를 요청했을 때만 해당 행을 다시 그린다. 평소 타이핑은
  // syncRowFromDom이 자체적으로 처리하므로 여기서 다시 손대지 않는다(caret 보존).
  useEffect(() => {
    fields.forEach((f, rowIdx) => {
      const rowEl = rowRefs.current.get(rowIdx)
      if (!rowEl) return
      const serialized = serializeField(f)
      const isPendingTarget = pendingFocus?.row === rowIdx
      if (!isPendingTarget && lastSyncedRef.current.get(rowIdx) === serialized) return

      rowEl.innerHTML = buildRowHtml(f)
      lastSyncedRef.current.set(rowIdx, serialized)

      if (isPendingTarget && pendingFocus) {
        const target = rowEl.querySelector<HTMLElement>(`[data-role="${pendingFocus.role}"]`)
        if (target) {
          const text = stripPlaceholder(target.textContent ?? '')
          rowEl.focus()
          setCaretOffsetInRow(
            rowEl,
            computeRowOffsetForRole(rowEl, pendingFocus.role, pendingFocus.caretEnd ? text.length : 0),
          )
        }
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
    void el.offsetWidth // 리플로우를 강제해 같은 클래스를 다시 붙여도 애니메이션이 재생되게 한다
    el.classList.add('pulse')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [pulseSignal])

  function navigateRow(rowIdx: number, dir: number) {
    const target = rowIdx + dir
    if (target < 0 || target >= fields.length) return
    const f = fields[target]
    setPendingFocus({ row: target, role: f.kind === 'control' ? 'control-value' : 'tag', caretEnd: false })
  }

  function handleIndicatorKey(e: React.KeyboardEvent<HTMLDivElement>, rowIdx: number, which: 'ind1' | 'ind2') {
    const key = e.key
    if (key === 'Tab' || key === 'Shift' || key.startsWith('Arrow')) return
    if (key === ' ') {
      e.preventDefault()
      onBeforeStructuralChange?.()
      commitFields(updateIndicator(fields, rowIdx, which, '\\'), rowIdx, which === 'ind1' ? 'ind2' : 'sf-value-0', false)
      return
    }
    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault()
      onBeforeStructuralChange?.()
      commitFields(updateIndicator(fields, rowIdx, which, '\\'), rowIdx, which, false)
      return
    }
    if (/^[0-9a-zA-Z]$/.test(key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      onBeforeStructuralChange?.()
      commitFields(updateIndicator(fields, rowIdx, which, key), rowIdx, which === 'ind1' ? 'ind2' : 'sf-value-0', false)
      return
    }
    if (key.length === 1) e.preventDefault()
  }

  function handleValueKey(
    e: React.KeyboardEvent<HTMLDivElement>,
    rowIdx: number,
    sfIdx: number,
    field: Extract<MrkField, { kind: 'data' }>,
    el: HTMLElement,
  ) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && /^[a-zA-Z0-9]$/.test(e.key)) {
      e.preventDefault()
      const caret = computeCaretOffsetWithin(el)
      onBeforeStructuralChange?.()
      commitFields(insertSubfieldAtCaret(fields, rowIdx, sfIdx, e.key, caret), rowIdx, `sf-value-${sfIdx + 1}`, false)
      return
    }
    if (e.key === 'Backspace') {
      const atStart = computeCaretOffsetWithin(el) === 0
      const multipleLeft = field.subfields.length > 1
      if (atStart && multipleLeft) {
        e.preventDefault()
        onBeforeStructuralChange?.()
        const newFields = deleteSubfield(fields, rowIdx, sfIdx)
        if (sfIdx > 0) commitFields(newFields, rowIdx, `sf-value-${sfIdx - 1}`, true)
        else commitFields(newFields, rowIdx, 'ind2', true)
      }
    }
  }

  /** el(하나의 role 칸) 안에서의 caret 문자 오프셋 — el 자체가 텍스트 노드 하나만 담고
   * 있다는 전제(buildRowHtml이 항상 그렇게 만든다). */
  function computeCaretOffsetWithin(el: HTMLElement): number {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return stripPlaceholder(el.textContent ?? '').length
    const range = sel.getRangeAt(0)
    if (!el.contains(range.startContainer)) return stripPlaceholder(el.textContent ?? '').length
    return Math.min(range.startOffset, stripPlaceholder(el.textContent ?? '').length)
  }

  // Enter = 다음 필드 행으로 이동(Shift+Enter = 이전), Alt+Enter = 값 칸 안에서 줄바꿈.
  // 태그/지시기호/코드/컨트롤값처럼 한 줄짜리 칸에서 Alt+Enter는 아무 의미가 없어 무시된다.
  // ←/→를 비롯한 일반 캐럿 이동은 이제 한 행이 진짜 이어진 텍스트라 브라우저 기본 동작이
  // 그대로 칸을 넘나든다 — 예전처럼 따로 가로챌 필요가 없다.
  function handleRowKeyDown(e: React.KeyboardEvent<HTMLDivElement>, rowIdx: number) {
    if (e.nativeEvent.isComposing) return // 한글 등 IME 조합 중엔 아무 것도 가로채지 않는다
    const rowEl = rowRefs.current.get(rowIdx)
    const field = fields[rowIdx]
    if (!field || !rowEl) return
    const roleEl = getFocusedRoleElement(rowEl)
    const role = roleEl?.dataset.role

    if (e.key === 'Enter') {
      const isValueRole = role?.startsWith('sf-value-')
      if (e.altKey) {
        if (!isValueRole) e.preventDefault()
        return
      }
      e.preventDefault()
      navigateRow(rowIdx, e.shiftKey ? -1 : 1)
      return
    }

    if (field.kind === 'data' && roleEl && (role === 'ind1' || role === 'ind2')) {
      handleIndicatorKey(e, rowIdx, role)
      return
    }
    if (field.kind === 'data' && roleEl && role?.startsWith('sf-value-')) {
      const sfIdx = Number(role.slice('sf-value-'.length))
      handleValueKey(e, rowIdx, sfIdx, field, roleEl)
    }
  }

  function handleRowInput(rowIdx: number) {
    if (composingRowsRef.current.has(rowIdx)) return
    syncRowFromDom(rowIdx)
  }
  function handleRowCompositionStart(rowIdx: number) {
    composingRowsRef.current.add(rowIdx)
  }
  function handleRowCompositionEnd(rowIdx: number) {
    composingRowsRef.current.delete(rowIdx)
    syncRowFromDom(rowIdx)
  }

  // 버튼(␣ 트림/× 삭제) 클릭이 caret 이동으로 오인되지 않게 — contenteditable 영역
  // 안에서 버튼을 누르면 브라우저가 먼저 선택부터 옮기려 드는 경우가 있다.
  function handleRowMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).tagName === 'BUTTON') e.preventDefault()
  }

  function handleRowClick(e: React.MouseEvent<HTMLDivElement>, rowIdx: number) {
    const target = e.target as HTMLElement
    const trimIdx = target.closest<HTMLElement>('[data-sf-trim]')?.dataset.sfTrim
    if (trimIdx !== undefined) {
      onBeforeStructuralChange?.()
      commitFields(trimSubfieldLeadingSpace(fields, rowIdx, Number(trimIdx)), rowIdx, `sf-value-${trimIdx}`, false)
      return
    }
    const delIdx = target.closest<HTMLElement>('[data-sf-del]')?.dataset.sfDel
    if (delIdx !== undefined) {
      onBeforeStructuralChange?.()
      commitFields(deleteSubfield(fields, rowIdx, Number(delIdx)), rowIdx, `sf-value-${delIdx}`, false)
    }
  }

  return (
    <div className="field-rows" ref={containerRef}>
      {fields.map((f, rowIdx) => {
        const missing = missingSubfields(f)
        return (
          <div
            key={rowIdx}
            className={'field-row' + (missing.length ? ' has-warning' : '')}
            data-tag={f.tag}
            style={{ ['--rail-color' as string]: RAIL_COLOR[f.tag] ?? (f.kind === 'control' ? 'var(--rail-control)' : 'transparent') }}
          >
            <div
              className="field-row-edit"
              contentEditable
              suppressContentEditableWarning
              data-row={rowIdx}
              ref={(el) => {
                if (el) {
                  if (rowRefs.current.get(rowIdx) !== el) {
                    // 새로 마운트된 DOM 노드 — 다른 레코드가 쓰던 낡은 동기화 기록이 같은
                    // rowIdx에 남아있을 수 있어서(예: 15행짜리 레코드 → 10행 → 다시 15행),
                    // 우연히 값이 같아 보여 리빌드를 건너뛰는 일이 없도록 지운다.
                    lastSyncedRef.current.delete(rowIdx)
                  }
                  rowRefs.current.set(rowIdx, el)
                } else {
                  rowRefs.current.delete(rowIdx)
                }
              }}
              onInput={() => handleRowInput(rowIdx)}
              onCompositionStart={() => handleRowCompositionStart(rowIdx)}
              onCompositionEnd={() => handleRowCompositionEnd(rowIdx)}
              onKeyDown={(e) => handleRowKeyDown(e, rowIdx)}
              onClick={(e) => handleRowClick(e, rowIdx)}
              onMouseDown={handleRowMouseDown}
              onBlur={() => syncRowFromDom(rowIdx)}
            />
            {missing.length > 0 && (
              <div className="warn-icon" data-tooltip={`필수 서브필드 누락: $${missing.join(', $')}`}>
                ⚠
              </div>
            )}
            <div className="row-actions">
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
  )
}
