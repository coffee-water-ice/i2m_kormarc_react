import { createPortal } from 'react-dom'
import type { MarcSubfieldMeta } from '../data/marcSchema'
import './MarcCaretHint.css'

/** 캐럿의 화면(뷰포트) 위치 — Range.getBoundingClientRect()/getClientRects()[0]에서 뽑아
 * FieldEditor.tsx가 넘긴다. DOMRect 전체가 아니라 필요한 필드만 받아 이 파일은 DOM을
 * 직접 건드리지 않는 순수 프레젠테이션 컴포넌트로 남긴다. */
export interface CaretRect {
  left: number
  top: number
  bottom: number
}

function floatingStyle(rect: CaretRect): React.CSSProperties {
  return { position: 'fixed', left: rect.left, top: rect.bottom + 6 }
}

/** 지시기호 값·식별기호 코드의 의미를 보여주는 작은 말풍선 — 기존 [data-tooltip]과
 * 같은 톤(어두운 배경/흰 글자)으로 맞췄다. 순수 정보 표시라 클릭을 가로채지 않는다
 * (pointer-events:none, CSS에서 지정). */
export function IndicatorSubfieldTooltip({ rect, title, body }: { rect: CaretRect; title: string; body: string }) {
  return createPortal(
    <div className="marc-hint-tooltip" style={floatingStyle(rect)}>
      <div className="marc-hint-tooltip-title">{title}</div>
      <div className="marc-hint-tooltip-body">{body}</div>
    </div>,
    document.body,
  )
}

/** Alt 단독 tap으로 뜨는 식별기호 선택 목록 — contentEditable 포커스는 FieldEditor 쪽에
 * 그대로 둔 채(항목 클릭 시 onMouseDown에서 preventDefault) 목록만 마우스/방향키로
 * 고를 수 있게 보여준다. 실제 방향키/Enter 처리는 FieldEditor.tsx의
 * handleContainerKeyDown이 한다 — 이 컴포넌트는 highlightedIndex를 그대로 반영만 한다. */
export function SubfieldPicker({
  rect,
  tag,
  items,
  highlightedIndex,
  onHoverIndex,
  onChoose,
}: {
  rect: CaretRect
  tag: string
  items: MarcSubfieldMeta[]
  highlightedIndex: number
  onHoverIndex: (index: number) => void
  onChoose: (code: string) => void
}) {
  return createPortal(
    <div className="marc-subfield-picker" style={floatingStyle(rect)}>
      <div className="marc-subfield-picker-header">{tag} 식별기호</div>
      <ul>
        {items.map((item, i) => (
          <li
            key={item.code}
            className={i === highlightedIndex ? 'active' : ''}
            onMouseEnter={() => onHoverIndex(i)}
            onMouseDown={(e) => {
              // contentEditable의 선택(캐럿)을 이 클릭이 건드리지 않게 — 실제 삽입은
              // onChoose가 FieldEditor에 저장해둔 캐럿 좌표로 직접 복원한 뒤 수행한다.
              e.preventDefault()
              onChoose(item.code)
            }}
          >
            <span className="marc-subfield-picker-code">▼{item.code}</span>
            <span className="marc-subfield-picker-name">{item.name}</span>
            <span className={'marc-subfield-picker-badge' + (item.repeatable ? '' : ' non-repeatable')}>
              {item.repeatable ? '반복' : '반복불가'}
            </span>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  )
}
