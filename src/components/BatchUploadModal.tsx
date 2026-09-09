import { useEffect, useRef, useState } from 'react'
import { useIsbnHistory } from '../context/isbnHistory'
import { downloadUploadTemplate } from '../lib/excelTemplate'
import { parseUploadFile, rowHasIssue, validRowsOnly, type UploadRow, type RowIssue } from '../lib/excelUpload'
import { MAX_BATCH_SIZE, UPLOAD_COLUMNS } from '../lib/batchConfig'
import { useBatchUpload } from '../hooks/useBatchUpload'
import { saveBatchAsFiles } from '../lib/batchExport'
import './BatchUploadModal.css'

interface BatchUploadModalProps {
  onClose: () => void
}

/**
 * "일괄 업로드" 모달 — 3단계(업로드→미리보기/확인→진행)를 한 모달 안에서 전환한다.
 * 이 프로젝트에 모달 패턴이 아직 없어서 새로 만들었다(오버레이+흰 패널, IsbnConvert.css의
 * .card 톤/토큰 재사용). 진행 로직 자체는 hooks/useBatchUpload.ts(모듈 레벨 싱글턴)가
 * 들고 있어서, 이 모달이 닫혀도 배치는 계속 진행된다 — 나중에 다시 열면 이어서 보인다
 * (평가시스템의 EvalSystem.tsx/useEvalRun.ts와 같은 관계).
 */
export default function BatchUploadModal({ onClose }: BatchUploadModalProps) {
  const { setHistory } = useIsbnHistory()
  const run = useBatchUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pushedUidsRef = useRef<Set<number>>(new Set())

  const [rows, setRows] = useState<UploadRow[]>([])
  const [issues, setIssues] = useState<RowIssue[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [savingFiles, setSavingFiles] = useState(false)

  const hasParsed = rows.length > 0 || issues.length > 0
  const started = run.status !== 'idle'

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600)
  }

  // 완료된 항목이 생기는 즉시(새로고침 없이) 왼쪽 사이드바 변환 내역에 반영한다 —
  // 이미 반영한 uid는 pushedUidsRef로 걸러서 중복 추가를 막는다.
  useEffect(() => {
    const fresh = run.entries.filter((e) => e.record && !pushedUidsRef.current.has(e.record.uid))
    if (fresh.length === 0) return
    for (const e of fresh) pushedUidsRef.current.add(e.record!.uid)
    setHistory((h) => [...h, ...fresh.map((e) => e.record!)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.entries])

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
    run.reset()
    pushedUidsRef.current = new Set()
  }

  const valid = validRowsOnly(rows, issues)

  function handleConfirm() {
    if (valid.length === 0) return
    run.start(valid)
  }

  async function handleSaveBatch() {
    const records = run.entries.filter((e) => e.record).map((e) => e.record!)
    if (records.length === 0) {
      showToast('저장할 레코드가 없어요.')
      return
    }
    setSavingFiles(true)
    const result = await saveBatchAsFiles(records)
    setSavingFiles(false)
    if (result.mode === 'cancelled') return
    if (!result.ok) {
      showToast(`저장 실패 — ${result.error ?? '알 수 없는 오류'}`)
      return
    }
    const modeLabel = result.mode === 'directory' ? '선택한 폴더에 저장했어요' : 'zip 파일로 내려받았어요'
    const failNote = result.failedIsbns.length > 0 ? ` (${result.failedIsbns.length}건은 MARC 인코딩 실패로 제외됨)` : ''
    showToast(`MRC 1개 + MRK ${result.savedCount}개를 ${modeLabel}.${failNote}`)
  }

  const running = run.status === 'running'
  const paused = run.status === 'paused'
  const finished = run.status === 'done' || run.status === 'stopped-gpt'

  return (
    <div className="bu-overlay" onClick={onClose}>
      <div className="bu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="bu-header">
          <h2>📤 일괄 업로드</h2>
          <button type="button" className="bu-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* ── 재개 배너: 아직 아무것도 안 올렸고, 이전에 하다 만 배치가 있으면 ── */}
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

        {/* ── 1단계: 업로드 ── */}
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

        {/* ── 2단계: 진행 ── */}
        {started && (
          <div className="bu-step">
            {run.status === 'preflight-blocked' && (
              <>
                <div className="status-banner error">⛔ 실행을 시작하지 않았어요 — {run.blockDetail}</div>
                <div className="bu-confirm-row">
                  <button type="button" className="btn-primary" onClick={() => run.start(run.rows)}>
                    다시 시도
                  </button>
                  <button type="button" onClick={handleReupload}>
                    새 배치 시작
                  </button>
                </div>
              </>
            )}

            {(running || paused) && run.total > 0 && (
              <div className="bu-progress">
                <div className="bu-progress-track">
                  <div className="bu-progress-fill" style={{ width: `${Math.round((run.done / run.total) * 100)}%` }} />
                </div>
                <span>
                  {run.done}/{run.total} {paused ? '일시정지됨' : '변환 중...'}
                </span>
                {running && (
                  <button type="button" onClick={() => run.pause()}>
                    일시정지
                  </button>
                )}
                {paused && (
                  <button type="button" className="btn-primary" onClick={() => run.start(run.rows)}>
                    재개
                  </button>
                )}
              </div>
            )}

            {run.checkpointDegraded && (
              <p className="bu-warn">⚠️ 브라우저 저장 공간이 부족해 새로고침 시 이어할 수 없어요 — 지금 이 세션은 그대로 진행돼요.</p>
            )}

            {run.status === 'stopped-gpt' && (
              <div className="status-banner error">
                ⛔ {run.done}건 시점에 OpenAI 호출이 실패했습니다 — {run.blockDetail}
                <br />
                여기까지 처리된 {run.done}건은 사이드바에 반영돼 있어요.
              </div>
            )}

            {/* 완료 전이라도 지금까지 변환된 항목 목록을 바로 보여준다 — 사이드바에서
                하나씩 골라 편집할 수 있다는 걸 눈으로 확인시켜주기 위함. */}
            {run.entries.length > 0 && (
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
                    {run.entries.map((e) => (
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

            {finished && (
              <div className="bu-confirm-row">
                <button type="button" className="btn-primary" onClick={handleSaveBatch} disabled={savingFiles}>
                  {savingFiles ? '저장 중...' : '💾 일괄 저장 (MRC 1개 + MRK 파일)'}
                </button>
                <button type="button" onClick={handleReupload}>
                  새 배치 시작
                </button>
              </div>
            )}
          </div>
        )}

        {toast && <div className="bu-toast">{toast}</div>}
      </div>
    </div>
  )
}
