import './ClassificationPanel.css'

interface CallNumberPanelProps {
  classMark: string
  authorMark: string
  volMark: string
  onClassMarkChange: (value: string) => void
  onAuthorMarkChange: (value: string) => void
  onVolMarkChange: (value: string) => void
}

/** 090(자관청구기호) 입력 패널 — 056 KDC 분류기호 패널과 049 소장사항 패널 사이,
 * 같은 사이드 컬럼에 놓인다(IsbnConvert.tsx의 .side-panels). 049와 마찬가지로
 * ISBN 변환만으로는 알 수 없는 값이라 사서가 직접 입력해야 한다 — 분류기호($a)·
 * 저자기호($b)·권·연차기호($c) 세 칸으로 나눠 받고, 타이핑마다 lib/mrk.ts의
 * applyCallNumberToFields가 draftFields의 090 필드를 즉시 갱신한다(지시기호
 * 빈칸/빈칸 고정, 채워진 서브필드만 포함 — 자세한 규칙은 그 함수 코멘트 참고).
 * CSS는 새로 만들지 않고 ClassificationPanel.css의 .class-panel/.class-detail/
 * .class-apply를 그대로 재사용해 세 패널이 한 세트로 보이게 했다. */
export default function CallNumberPanel({
  classMark,
  authorMark,
  volMark,
  onClassMarkChange,
  onAuthorMarkChange,
  onVolMarkChange,
}: CallNumberPanelProps) {
  const parts: string[] = []
  if (classMark.trim()) parts.push(`▼a${classMark.trim()}`)
  if (authorMark.trim()) parts.push(`▼b${authorMark.trim()}`)
  if (volMark.trim()) parts.push(`▼c${volMark.trim()}`)

  return (
    <aside className="class-panel">
      <h3>090 자관청구기호</h3>
      <p className="class-sub">ISBN 변환으로는 알 수 없는 값이라 직접 입력해야 해요.</p>

      <div className="class-detail">
        <label htmlFor="call-class-mark">분류기호</label>
        <input
          id="call-class-mark"
          value={classMark}
          placeholder="예: 813.7"
          onChange={(e) => onClassMarkChange(e.target.value)}
        />
      </div>
      <div className="class-detail">
        <label htmlFor="call-author-mark">저자기호</label>
        <input
          id="call-author-mark"
          value={authorMark}
          placeholder="예: ㅅ225ㅈ"
          onChange={(e) => onAuthorMarkChange(e.target.value)}
        />
      </div>
      <div className="class-detail">
        <label htmlFor="call-vol-mark">권·연차기호</label>
        <input
          id="call-vol-mark"
          value={volMark}
          placeholder="예: v.1"
          onChange={(e) => onVolMarkChange(e.target.value)}
        />
      </div>

      <div className="class-apply">
        → 적용될 값
        <code>{parts.length ? `090  ${parts.join('')}` : '(비어 있음 — 필드 생략)'}</code>
      </div>
    </aside>
  )
}
