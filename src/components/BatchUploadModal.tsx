import { useEffect, useRef, useState } from 'react'
import { useIsbnHistory } from '../context/isbnHistory'
import { downloadUploadTemplate } from '../lib/excelTemplate'
import { parseUploadFile, rowHasIssue, validRowsOnly, type UploadRow, type RowIssue } from '../lib/excelUpload'
import { MAX_BATCH_SIZE, UPLOAD_COLUMNS } from '../lib/batchConfig'
import { useBatchUpload, type BatchUploadStatus } from '../hooks/useBatchUpload'
import './BatchUploadModal.css'

interface BatchUploadModalProps {
  onClose: () => void
}

/**
 * "일괄 업로드" 모달 — 업로드 → 미리보기/확인 → 진행 화면을 한 모달 안에서 전환한다.
 * 진행 로직 자체는 hooks/useBatchUpload.ts(모듈 레벨 싱글턴)가 들고 있어서, 이 모달이
 * 닫혀도 배치는 계속 진행된다.
 *
 * 완료되면(요청 사양) 이 모달이 "일괄 저장" 버튼을 보여주는 대신 스스로 닫히고 사서
 * 편집 화면으로 돌아간다 — 방금 만든 레코드 중 마지막 것을 바로 펼쳐서, 사서가 곧장
 * 확인·편집·저장할 수 있게 한다("일괄 저장"은 이제 이 모달이 아니라 IsbnConvert.tsx의
 * 별도 "일괄 저장" 버튼/BatchSaveModal이 맡는다). 다만 이미 끝난 실행을 다시 보려고
 * "일괄 업로드"를 또 누르면(재마운트) 그때는 자동으로 닫지 않고 요약을 그대로 보여준다
 * — prevStatusRef로 "지금 이 마운트에서 방금 진행 중→완료로 바뀐 경우"만 가려낸다.
 */
export default function BatchUploadModal({ onClose }: BatchUploadModalProps) {
  const { setHistory, setCurrentUid } = useIsbnHistory()
  const run = useBatchUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prevStatusRef = useRef<BatchUploadStatus | null>(null)

  const [rows, setRows] = useState<UploadRow[]>([])
  const [issues, setIssues] = useState<RowIssue[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  const hasParsed = rows.length > 0 || issues.length > 0
  const active = run.active
  const started = active !== null

  // 완료된 항목이 생기는 즉시(새로고침 없이) 왼쪽 사이드바 변환 내역에 반영한다.
  // "이미 반영했는지"는 컴포넌트 로컬 ref가 아니라 history 자체를 기준으로 판단한다
  // — 이 모달은 (요청 5에 따라) 같은 실행을 다시 열어볼 때마다 리마운트되는데,
  // ref로 추적하면 리마운트 때마다 "아직 안 넣은 것처럼" 보여서 같은 레코드가
  // 사이드바에 중복으로 쌓이는 버그가 있었다(React key 중복 경고로 발견) — history
  // 안에 그 uid가 실제로 있는지를 매번 다시 확인하는 게 리마운트에 안전하다.
  useEffect(() => {
    if (!active) return
    const freshRecords = active.entries.filter((e): e is typeof e & { record: NonNullable<typeof e.record> } => !!e.record).map((e) => e.record)
    if (freshRecords.length === 0) return
    setHistory((h) => {
      const existingUids = new Set(h.map((r) => r.uid))
      const toAdd = freshRecords.filter((r) => !existingUids.has(r.uid))
      return toAdd.length === 0 ? h : [...h, ...toAdd]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.entries])

  // 진행 중/일시정지 → 완료/중단으로 "지금 막" 바뀐 경우에만 자동으로 닫고 사서편집
  // 화면으로 넘어간다(요청 1) — 이미 끝나 있던 실행을 다시 열어본 경우는 그대로 둔다.
  useEffect(() => {
    const cur = active?.status ?? null
    const prev = prevStatusRef.current
    prevStatusRef.current = cur
    const justFinished = (prev === 'running' || prev === 'paused') && (cur === 'done' || cur === 'stopped-gpt')
    if (!justFinished || !active) return
    const successes = active.entries.filter((e) => e.record)
    const last = successes[successes.length - 1]
    if (last?.record) setCurrentUid(last.record.uid)
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.status])

  function handlePickFile() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일을 다시 골라도 onChange가 다시 뜨도록
    if (!file) return
    setParseError(null)
    try {
      const parsed = await parseUploadFile(file)
      setRows(parsed.rows)
      setIssues(parsed.issues)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : '파일을 읽는 중 오류가 발생했어요.')
    }
  }

  function handleReupload() {
    setRows([])
    setIssues([])
    setParseError(null)
  }

  function handleStartNewBatch() {
    run.startNewBatch()
    handleReupload()
  }

  const valid = validRowsOnly(rows, issues)

  function handleConfirm() {
    if (valid.length === 0) return
    run.start(valid)
  }

  const running = active?.status === 'running'
  const paused = active?.status === 'paused'

  return (
    <div className="bu-overlay" onClick={onClose}>
      <div className="bu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="bu-header">
          <h2>📤 일괄 업로드</h2>
          <button type="button" className="bu-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* ── 재개 배너: 아직 아무것도 안 올렸고, 새로고침 전에 하다 만 배치가 있으면 ── */}
        {!started && !hasParsed && run.resumable && (
          <div className="bu-resume-banner">
            <span>
              ⏸️ 중단된 일괄 업로드가 있어요 — {run.resumable.doneCount}/{run.resumable.meta.total}건 완료
            </span>
            <div className="bu-resume-actions">
              <button type="button" className="btn-primary" onClick={() => run.resume()}>
                이어서 실행
              </button>
              <button type="button" onClick={() => run.discardResumable()}>
                새로 시작
              </button>
            </div>
          </div>
        )}

        {/* ── 업로드/미리보기 단계 ── */}
        {!started && (
          <div className="bu-step">
            <p className="bu-desc">
              등록구분·등록번호·ISBN이 짝을 이룬 엑셀 파일을 올리면, ISBN을 순서대로 변환하면서 각 레코드의
              049(소장사항)에 등록구분+등록번호를 자동으로 채워요. 한 번에 최대 {MAX_BATCH_SIZE}건까지 처리할 수
              있어요.
            </p>
            <div className="bu-upload-row">
              <button type="button" onClick={downloadUploadTemplate}>
                ⬇ 예시 파일 다운로드
              </button>
              <button type="button" className="btn-primary" onClick={handlePickFile}>
                📄 엑셀 파일 선택
              </button>
              <input ref={fileInputRef} type="file" accept=".xlsx" hidden onChange={handleFileChange} />
            </div>
            {parseError && <p className="bu-error">⛔ {parseError}</p>}

            {hasParsed && (
              <>
                <p className="bu-summary">
                  유효 {valid.length}건 / 오류 {rows.length - valid.length}건 — 오류 행은 제외하고 진행됩니다.
                </p>
                <div className="bu-table-wrap">
                  <table className="bu-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>{UPLOAD_COLUMNS.regMark}</th>
                        <th>{UPLOAD_COLUMNS.regNo}</th>
                        <th>{UPLOAD_COLUMNS.isbn}</th>
                        <th>적용될 049</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const bad = rowHasIssue(issues, r.no)
                        const rowIssues = issues.filter((i) => i.no === r.no)
                        return (
                          <tr key={r.no} className={bad ? 'bu-row-bad' : undefined}>
                            <td>{r.no}</td>
                            <td>{r.regMark}</td>
                            <td>{r.regNo}</td>
                            <td>{r.isbnRaw}</td>
                            <td className="bu-mono">{bad ? '—' : `▼l${r.regMark}${r.regNo}`}</td>
                            <td className="bu-status">{bad ? rowIssues.map((i) => i.reason).join(' / ') : '정상'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="bu-confirm-row">
                  <button type="button" className="btn-primary" onClick={handleConfirm} disabled={valid.length === 0}>
                    확인 ({valid.length}건 진행)
                  </button>
                  <button type="button" onClick={handleReupload}>
                    다른 파일 선택
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 진행/요약 단계 ── */}
        {started && active && (
          <div className="bu-step">
            {active.status === 'preflight-blocked' && (
              <>
                <div className="status-banner error">⛔ 실행을 시작하지 않았어요 — {active.blockDetail}</div>
                <div className="bu-confirm-row">
                  <button type="button" className="btn-primary" onClick={() => run.start(active.rows)}>
                    다시 시도
                  </button>
                  <button type="button" onClick={handleStartNewBatch}>
                    새 배치 시작
                  </button>
                </div>
              </>
            )}

            {(running || paused) && active.total > 0 && (
              <div className="bu-progress">
                <div className="bu-progress-track">
                  <div className="bu-progress-fill" style={{ width: `${Math.round((active.done / active.total) * 100)}%` }} />
                </div>
                <span>
                  {active.done}/{active.total} {paused ? '일시정지됨' : '변환 중...'}
                </span>
                {running && (
                  <button type="button" onClick={() => run.pause()}>
                    일시정지
                  </button>
                )}
                {paused && (
                  <button type="button" className="btn-primary" onClick={() => run.start(active.rows)}>
                    재개
                  </button>
                )}
              </div>
            )}

            {run.checkpointDegraded && (
              <p className="bu-warn">⚠️ 브라우저 저장 공간이 부족해 새로고침 시 이어할 수 없어요 — 지금 이 세션은 그대로 진행돼요.</p>
            )}

            {active.status === 'stopped-gpt' && (
              <div className="status-banner error">
                ⛔ {active.done}건 시점에 OpenAI 호출이 실패했습니다 — {active.blockDetail}
                <br />
                여기까지 처리된 {active.done}건은 사이드바에 반영돼 있어요.
              </div>
            )}

            {/* 완료된 실행을 다시 열어본 경우에만 여기까지 온다(방금 끝난 경우는 위
                useEffect가 자동으로 닫아버림) — 지난 실행 요약 + "새 배치 시작"만 제공.
                "일괄 저장"은 이제 IsbnConvert.tsx의 별도 버튼(BatchSaveModal)에서 한다. */}
            {active.entries.length > 0 && (
              <div className="bu-table-wrap">
                <table className="bu-table">
                  <thead>
                    <tr>
                      <th>ISBN</th>
                      <th>제목</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.entries.map((e) => (
                      <tr key={e.row.isbn} className={e.error ? 'bu-row-bad' : undefined}>
                        <td>{e.row.isbn}</td>
                        <td>{e.record?.title ?? '—'}</td>
                        <td className="bu-status">{e.error || '✅ 변환 완료 · 사이드바에 추가됨'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(active.status === 'done' || active.status === 'stopped-gpt') && (
              <div className="bu-confirm-row">
                <button type="button" className="btn-primary" onClick={handleStartNewBatch}>
                  새 배치 시작
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
