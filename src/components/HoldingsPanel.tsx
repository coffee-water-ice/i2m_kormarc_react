import './ClassificationPanel.css'

interface HoldingsPanelProps {
  value: string
  onChange: (value: string) => void
}

/** 049(소장사항/등록번호) 입력 패널 — 056 KDC 분류기호 패널(ClassificationPanel) 바로
 * 아래, 같은 사이드 컬럼에 놓인다(IsbnConvert.tsx의 .side-panels). ISBN 변환만으로는
 * 알 수 없는, 사서가 직접 입력해야 하는 값이라 후보/선택 같은 복잡한 상태 없이
 * 텍스트 입력창 하나로만 받는다 — 타이핑마다 lib/mrk.ts의 applyHoldingsRegToFields가
 * draftFields의 049 필드를 즉시 갱신한다(950 다음 자리·지시기호 0/빈칸·$I 고정,
 * 자세한 규칙은 그 함수 코멘트 참고). CSS는 새로 만들지 않고 ClassificationPanel.css의
 * .class-panel/.class-detail/.class-apply를 그대로 재사용해 두 패널이 한 세트로
 * 보이게 했다. */
export default function HoldingsPanel({ value, onChange }: HoldingsPanelProps) {
  const trimmed = value.trim()

  return (
    <aside className="class-panel">
      <h3>049 소장사항(등록번호)</h3>
      <p className="class-sub">ISBN 변환으로는 알 수 없는 값이라 직접 입력해야 해요.</p>

      <div className="class-detail">
        <label htmlFor="holdings-reg">등록번호</label>
        <input
          id="holdings-reg"
          value={value}
          placeholder="예: EM0000123456"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <div className="class-apply">
        → 적용될 값
        <code>{trimmed ? `0490 ▼I${trimmed}` : '(비어 있음 — 필드 생략)'}</code>
      </div>
    </aside>
  )
}
