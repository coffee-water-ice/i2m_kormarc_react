import type { KdcCandidate } from '../types/api'
import './ClassificationPanel.css'

const KDC_CLASS_NAME: Record<string, string> = {
  '0': '총류', '1': '철학', '2': '종교', '3': '사회과학', '4': '자연과학',
  '5': '기술과학', '6': '예술', '7': '언어', '8': '문학', '9': '역사',
}

function kdcLabel(code: string): string {
  const name = KDC_CLASS_NAME[code[0] ?? '']
  return name ? `${code} · ${name}` : code
}

interface ClassificationPanelProps {
  candidates: KdcCandidate[]
  ratio?: number
  lowConfidence?: boolean
  reason?: string
  edition?: string
  selected: string
  detail: string
  onSelect: (kdc: string) => void
  onDetailChange: (detail: string) => void
}

/** mrk_editor_prototype.html의 .class-panel(056 KDC 분류기호)을 이식. */
export default function ClassificationPanel({
  candidates,
  ratio,
  lowConfidence,
  reason,
  edition,
  selected,
  detail,
  onSelect,
  onDetailChange,
}: ClassificationPanelProps) {
  if (candidates.length === 0) {
    return (
      <aside className="class-panel">
        <h3>056 KDC 분류기호</h3>
        <p className="class-sub">{reason ? `056 미생성: ${reason}` : '분류 후보가 없습니다.'}</p>
      </aside>
    )
  }

  const topProb = Math.max(...candidates.map((c) => c.prob)) || 1
  // 모델은 강(2자리)까지만 판단한다 — 세목 칸이 비어 있으면 '0'을 기본으로 보여주고
  // 적용한다(직접 입력하면 그 값으로 바뀜). candidates 자체(후보 목록·확률)는 그대로다.
  const effectiveDetail = detail.trim() || '0'
  const finalKdc = `${selected}${effectiveDetail}`

  return (
    <aside className="class-panel">
      <h3>056 KDC 분류기호</h3>
      <p className="class-sub">
        {lowConfidence
          ? '1순위와 2순위가 대등합니다 — 검토가 필요합니다.'
          : ratio
            ? `1순위가 2순위보다 ${ratio}배 우세합니다.`
            : ''}
      </p>

      <div className="class-bars">
        {candidates.map((c, i) => (
          <div className="class-bar-row" key={c.kdc}>
            <div className="class-bar-label">
              <span>{kdcLabel(`${c.kdc}${effectiveDetail}`)}</span>
              <span>{(c.prob * 100).toFixed(1)}%</span>
            </div>
            <div className="class-bar-track">
              <div
                className="class-bar-fill"
                style={{
                  width: `${((c.prob / topProb) * 100).toFixed(1)}%`,
                  opacity: i === 0 ? 1 : 0.55,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="class-radios">
        {candidates.map((c) => (
          <label className="class-radio" key={c.kdc}>
            <input
              type="radio"
              name="classPick"
              value={c.kdc}
              checked={selected === c.kdc}
              onChange={() => onSelect(c.kdc)}
            />
            {kdcLabel(`${c.kdc}${effectiveDetail}`)}
          </label>
        ))}
      </div>

      <div className="class-detail">
        <label htmlFor="kdc-detail">세목 (직접 입력)</label>
        <input
          id="kdc-detail"
          value={detail}
          maxLength={8}
          placeholder="예: 8 → 808"
          onChange={(e) => onDetailChange(e.target.value)}
        />
      </div>

      <div className="class-apply">
        → 적용될 값
        <code>
          =056  \\$a{finalKdc}
          {edition ? `$2${edition}` : ''}
        </code>
      </div>
    </aside>
  )
}
