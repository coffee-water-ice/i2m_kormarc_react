import { useEffect, useRef, useState } from 'react'
import type { MrkField, MrkSubfield } from '../types/mrk'
import { RAIL_COLOR, TAG_META } from '../types/mrk'
import { missingSubfields, serializeField } from '../lib/mrk'
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
}

/*
 * ── 이 파일의 편집 모델: "한 행 = 완전히 자유로운 텍스트 한 줄" ──
 *
 * 이전 버전들은 태그·지시기호·서브필드를 각각 별도 역할(role)로 구분해 서로 다른
 * 키보드 규칙을 적용했다(지시기호는 한 글자 치면 자동으로 다음 칸으로, 서브필드는
 * Alt+글자로 "새로 만들고" Backspace로 "통째로 지우고" 등). 문제는 이게 자유로운
 * 편집을 가로막는다는 것 — 예를 들어 Alt+글자로 만든 서브필드는 뒷부분 전체가
 * 그 서브필드에 "묶여"버려서, 식별기호($코드)만 따로 지우거나 고칠 수 없었다.
 *
 * 그래서 구조를 완전히 뒤집었다: 편집 중에는 행 전체가 그냥 "일반 텍스트"다.
 * 태그(3자리)·지시기호(그다음 2자리, 컨트롤필드면 없음)·서브필드($코드+값 반복)는
 * 전부 "위치"로만 구분되고(색·굵기는 그 위치를 눈으로 보여주는 장식일 뿐), 어디든
 * 자유롭게 클릭·선택·타이핑·삭제할 수 있다. 그 결과 "지금 이 텍스트가 유효한 MRK
 * 구조인가"는 편집 중엔 검사하지 않고, "저장" 버튼을 누르는 시점에만 검사해서
 * 문제가 있으면 저장을 보류하고 그 행을 가리켜준다(IsbnConvert.tsx의 저장 검증).
 *
 * DOM은 여전히 React가 아니라 직접 관리한다(caret 유지) — 다만 예전처럼
 * contenteditable="false" "섬"이 하나도 없어서(모든 게 진짜 자유 텍스트라) 이전에
 * 있었던 "섬 경계에서 캐럿이 애매해지는" 부류의 버그 자체가 구조적으로 사라졌다.
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

interface RowToken {
  text: string
  cls: 'tok-tag' | 'tok-ind' | 'tok-dollar' | 'tok-val' | 'tok-raw'
}

/** 순수 텍스트 한 줄을 위치 규칙(태그 3자리 → [지시기호 2자리] → $코드+값 반복)에 따라
 * 색칠용 토큰으로 나눈다. 형식이 아무리 어긋나 있어도(편집 중이라 당연히 그럴 수 있다)
 * 절대 던지지 않고 "그냥 이런 모양이겠거니" 하고 최대한 그럴듯하게 나눈다 — 진짜 검증은
 * 저장 시점에 따로 한다. */
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

  const re = /\$(.)([^$]*)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(rest))) {
    if (m.index > lastIndex) tokens.push({ text: rest.slice(lastIndex, m.index), cls: 'tok-raw' })
    tokens.push({ text: '$' + m[1], cls: 'tok-dollar' })
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
 * 코멘트 참고) — 코드가 빈 서브필드는 "$"를 안 붙이고 값만 그대로 내보내고, 지시기호는
 * 사용자가 실제로 입력한 글자를 그대로 내보낸다(빈 값일 때만 '\'로 채운다). */
function fieldToRowText(f: MrkField): string {
  if (f.kind === 'control') return f.tag + f.value
  const ind1 = f.ind1 === '' ? '\\' : f.ind1
  const ind2 = f.ind2 === '' ? '\\' : f.ind2
  const sf = f.subfields.map((s) => (s.code ? `$${s.code}${s.value}` : s.value)).join('')
  return f.tag + ind1 + ind2 + sf
}

/**
 * 순수 텍스트 한 줄 → MrkField. tokenizeRow와 같은 위치 규칙을 쓴다(진짜 파싱, 색칠용
 * 아님) — 저장 시 검증은 이 결과를 보고 별도로 한다.
 *
 * 절대 글자를 바꾸거나 버리면 안 된다(이 함수와 fieldToRowText는 항상 정확히 왕복해야
 * 한다) — 예전엔 지시기호에 스페이스를 치면 "빈 지시기호=\"라는 mrk 관례에 맞춰
 * 여기서 바로 백슬래시로 바꿔버렸는데, 그러면 한 번의 타이핑에 대해 이 함수가 계산한
 * 값과 fieldToRowText가 재구성한 텍스트가 서로 달라져서 — 방금 친 문자를 그대로
 * 보여주고 있던 화면(syncRowFromDom의 자체 리빌드)을, 뒤이어 도는 "바깥에서 fields가
 * 바뀌었다" 감지 이펙트가 다른 버전으로 또 한 번 덮어썼다(그 이펙트는 caret 복원까지는
 * 안 해서, 결과적으로 스페이스가 눈앞에서 백슬래시로 바뀌면서 caret도 엉뚱한 데로
 * 튀었다 — Playwright로 재현해서 찾음). 빈 지시기호(스페이스)→\ 정규화는 이제 여기서
 * 하지 않고 내보내기 시점(lib/mrk.ts의 serializeField)에서만 한다 — 편집 중엔 스페이스가
 * 스페이스로 그냥 남아있는다.
 *
 * "$" 앞에 뜬금없는 텍스트가 낀 순간도 있을 수 있는데(예: 태그를 고치는 도중 지시기호
 * 칸이 밀려서 "$"를 삼켜버린 경우) — 코드가 빈 서브필드({code:'', value:그텍스트})로
 * 보존한다. 저장 검증에서 "코드 없음"으로 걸러지긴 하지만 데이터 자체는 안 사라진다.
 */
function rowTextToField(rowText: string): MrkField {
  const tag = rowText.slice(0, 3)
  if (isControlTag(tag)) return { tag, kind: 'control', value: rowText.slice(3) }

  const ind1 = rowText[3] ?? ''
  const ind2 = rowText[4] ?? ''
  const rest = rowText.slice(5)
  const subfields: MrkSubfield[] = []
  const re = /\$(.)([^$]*)/g
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

/**
 * mrk_editor_prototype.html의 필드 편집 카드를 이식 — 다만 프로토타입도 칸마다 별도
 * contenteditable이라 이 정도로 자유롭게 옮겨다니며 편집하지는 못했다. 파일 상단
 * 코멘트에 전체 설계를 적어뒀다.
 */
export default function FieldEditor({ fields, onChange, onBeforeStructuralChange, onCopyLine, pulseSignal }: FieldEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const lastSyncedRef = useRef<Map<number, string>>(new Map())
  const composingRowsRef = useRef<Set<number>>(new Set())
  const lastSnapshotTimeRef = useRef<Map<number, number>>(new Map())
  const [pendingFocus, setPendingFocus] = useState<{ row: number; offset: number } | null>(null)

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

  /** 이 행의 라이브 DOM(순수 텍스트)을 읽어 React 상태로 내보내고, 그 자리에서 다시
   * 그려 색을 최신화한다 — caret은 절대 문자 오프셋으로 저장했다가 그대로 복원한다.
   * 더 이상 "이 칸은 편집 금지" 섬이 없어서 예전 같은 경계 모호함이 없다. */
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
        rowEl.focus()
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

  function navigateRow(rowIdx: number, dir: number) {
    const target = rowIdx + dir
    if (target < 0 || target >= fields.length) return
    setPendingFocus({ row: target, offset: 0 })
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

  function handleRowInput(rowIdx: number) {
    if (composingRowsRef.current.has(rowIdx)) return // 한글 등 IME 조합 중엔 손대지 않는다
    maybeSnapshot(rowIdx)
    syncRowFromDom(rowIdx)
  }
  function handleRowCompositionEnd(rowIdx: number) {
    composingRowsRef.current.delete(rowIdx)
    maybeSnapshot(rowIdx)
    syncRowFromDom(rowIdx)
  }

  // Enter = 다음 행(Shift+Enter = 이전), Alt+Enter = 줄바꿈(기본 동작 그대로 둠).
  // Alt+글자 = "$글자" 두 글자를 caret 위치에 꽂아 넣는 편의 단축키 — 그 뒤로는 평범한
  // 텍스트라 자유롭게 고치거나 지울 수 있다(예전처럼 "서브필드 객체"로 묶여서 한
  // 덩어리로만 지워지는 일이 없다).
  function handleRowKeyDown(e: React.KeyboardEvent<HTMLDivElement>, rowIdx: number) {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      if (e.altKey) return
      e.preventDefault()
      navigateRow(rowIdx, e.shiftKey ? -1 : 1)
      return
    }
    if (e.altKey && !e.ctrlKey && !e.metaKey && /^[a-zA-Z0-9]$/.test(e.key)) {
      e.preventDefault()
      document.execCommand('insertText', false, '$' + e.key.toLowerCase())
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
              ref={getRowRefCallback(rowIdx)}
              onInput={() => handleRowInput(rowIdx)}
              onCompositionStart={() => composingRowsRef.current.add(rowIdx)}
              onCompositionEnd={() => handleRowCompositionEnd(rowIdx)}
              onKeyDown={(e) => handleRowKeyDown(e, rowIdx)}
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
