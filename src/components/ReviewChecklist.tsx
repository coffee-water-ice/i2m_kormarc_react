import { FIELD_653_FLAGS } from '../lib/qualityFlags653'
import './ReviewChecklist.css'

interface ReviewChecklistProps {
  /** 090(자관청구기호)이 채워졌는지 — 세 서브필드 중 하나라도 있으면 true. */
  has090: boolean
  /** 049(소장사항/등록번호)이 채워졌는지 — $l 값이 있으면 true. */
  has049: boolean
  /** 지금 레코드의 653 품질 경고 원본 코드 목록(비어 있으면 항목 자체가 안 뜸). */
  field653Flags: string[]
}

/**
 * "사서 편집" 필드 목록 바로 아래에 두는 검토 항목 — lib/mrk.ts의
 * applyCallNumberToFields/applyHoldingsRegToFields가 090(056 아래)·049(950 아래)를
 * 사서가 채우기 전에도 항상 빈 스텁으로 만들어 두므로(2026-09-10 요청), 여기서는
 * "채워졌는지"만 보고 안내 문구를 켰다/껐다 한다 — 채우면 그 즉시(리렌더 시) 목록에서
 * 사라진다. 즉 090/049가 비어 있는 기본 상태에서는 검토 항목이 항상 떠 있다.
 *
 * 653 품질 경고는 FieldEditor의 ⚠️ 아이콘(툴팁으로 요약)과 별개로, 여기서는 표
 * 형태로 "원본 코드 / 화면 문구 / 설명"을 전부 펼쳐서 보여준다(lib/qualityFlags653.ts
 * 가 세 컴포넌트— 이 컴포넌트·FieldEditor 툴팁·Home.tsx 안내표—의 공용 출처).
 */
export default function ReviewChecklist({ has090, has049, field653Flags }: ReviewChecklistProps) {
  const pending: { key: string; message: string }[] = []
  if (!has090) pending.push({ key: '090', message: '090 자관 청구기호를 입력하세요.' })
  if (!has049) pending.push({ key: '049', message: '049 소장사항(등록번호)을 입력하세요.' })

  const flagMetas = FIELD_653_FLAGS.filter((f) => field653Flags.includes(f.code))

  if (pending.length === 0 && flagMetas.length === 0) {
    return (
      <div className="review-checklist">
        <div className="review-checklist-head">검토 항목</div>
        <p className="review-empty">✅ 검토할 항목이 없어요.</p>
      </div>
    )
  }

  return (
    <div className="review-checklist">
      <div className="review-checklist-head">검토 항목</div>

      {pending.length > 0 && (
        <ul className="review-list">
          {pending.map((p) => (
            <li key={p.key}>⚠️ {p.message}</li>
          ))}
        </ul>
      )}

      {flagMetas.length > 0 && (
        <div className="review-653">
          <div className="review-653-caption">⚠️ 653 품질 경고</div>
          <div className="review-653-scroll">
            <table className="review-653-table">
              <thead>
                <tr>
                  <th>원본 코드</th>
                  <th>화면 문구</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {flagMetas.map((f) => (
                  <tr key={f.code}>
                    <td>
                      <code>{f.code}</code>
                    </td>
                    <td>{f.label}</td>
                    <td>{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
