import { useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { HistoryRecord } from './types/history'
import type { IsbnHistoryContextValue } from './context/isbnHistory'
import { useBatchUpload } from './hooks/useBatchUpload'
import { batchLabel } from './lib/batchConfig'
import './App.css'

/**
 * 레이아웃 뼈대 — prototypes/mrk_editor_prototype.html의 .app(사이드바 252px + 본문) 그리드를 이식.
 *
 * 변환 내역 상태는 원래 ISBN 변환 페이지 안에서만 살았는데, "ISBN 변환" 네비 항목에
 * 토글 버튼 + 드롭다운으로 붙여달라는 요청 때문에 여기(App.tsx)로 끌어올렸다 — 사이드바가
 * 페이지 전환과 무관하게 항상 떠 있으므로, 드롭다운도 여기서 그려야 한다. 페이지 쪽은
 * context/isbnHistory.ts의 useIsbnHistory() 훅으로 이 상태를 읽고 쓴다(Outlet context).
 *
 * "ISBN 변환" 드롭다운은 다시 "단건 변환"/"일괄 변환" 두 갈래로 나뉜다(요청 6) —
 * 단건 변환은 ISBN 입력창으로 만든 레코드만, 일괄 변환은 "배치 N"(업로드한 순서대로)
 * 아래에 그 배치가 만든 레코드만 보여준다. 이 구분은 HistoryRecord 자체에 필드를
 * 추가하지 않고, hooks/useBatchUpload.ts의 runs(각 배치가 만든 record.uid 목록)와
 * history를 uid로 대조해서 매 렌더마다 계산한다 — "이 레코드가 어느 배치 출신인지"를
 * 저장해두지 않아도 항상 일관되게 나온다.
 *
 * 드롭다운은 바깥 클릭/Esc가 아니라 토글 버튼을 다시 눌렀을 때만 닫힌다 — 항목을
 * 고르는 동작(selectRecord)도 열림 상태를 건드리지 않는다(요구사항: 항목 선택으로
 * 닫히지 않게).
 *
 * 다른 항목으로 전환하기 전에 저장 안 한 변경사항이 있으면 확인창을 띄운다 — 실제
 * dirty 여부는 ISBN 변환 페이지(초안 상태를 들고 있는 쪽)만 알 수 있어서, dirtyRef를
 * Outlet context로 내려주고 페이지가 매 렌더마다 그 값을 채워 넣게 한다.
 */
export default function App() {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [currentUid, setCurrentUid] = useState<number | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [singleOpen, setSingleOpen] = useState(false)
  const [batchListOpen, setBatchListOpen] = useState(false)
  const [openBatchId, setOpenBatchId] = useState<string | null>(null)
  const dirtyRef = useRef(false)
  const navigate = useNavigate()
  const batchRun = useBatchUpload()

  function selectRecord(uid: number) {
    if (uid === currentUid) {
      navigate('/isbn')
      return
    }
    if (dirtyRef.current) {
      const ok = window.confirm(
        '사서 편집에서 저장하지 않은 변경사항이 있어요. 저장하지 않고 다른 항목으로 이동할까요?',
      )
      if (!ok) return
    }
    setCurrentUid(uid)
    navigate('/isbn')
  }

  const outletContext: IsbnHistoryContextValue = { history, setHistory, currentUid, setCurrentUid, dirtyRef }

  // 배치가 만든 record.uid 전체 — 이 집합에 없으면 "단건 변환"으로 분류한다.
  const batchUids = new Set(
    batchRun.runs.flatMap((r) => r.entries.filter((e) => e.record).map((e) => e.record!.uid)),
  )
  const singleRecords = history.filter((rec) => !batchUids.has(rec.uid))
  function recordsOfBatch(run: (typeof batchRun.runs)[number]): HistoryRecord[] {
    const uids = new Set(run.entries.filter((e) => e.record).map((e) => e.record!.uid))
    return history.filter((rec) => uids.has(rec.uid))
  }

  function renderRecordButton(rec: HistoryRecord) {
    return (
      <button
        key={rec.uid}
        className={'history-item' + (rec.uid === currentUid ? ' active' : '')}
        onClick={() => selectRecord(rec.uid)}
      >
        <div className="hi-title">
          {/* edited는 "저장을 한 번이라도 눌렀는지"를 뜻한다(IsbnConvert.tsx의
              handleSaveDraft에서만 true가 됨) — 아직 한 번도 저장 안 한
              항목을 눈에 띄게 표시해서 사서가 놓치지 않게 한다. */}
          {!rec.edited && <span className="unsaved-dot" data-tooltip="아직 저장하지 않음" />}
          {rec.title}
        </div>
        <div className="hi-meta">{rec.isbn}</div>
      </button>
    )
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-head">2026 I2M KORMARC</div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => 'app-nav-link' + (isActive ? ' active' : '')}>
            홈
          </NavLink>

          <NavLink to="/eval" className={({ isActive }) => 'app-nav-link' + (isActive ? ' active' : '')}>
            평가시스템
          </NavLink>

          <div className="app-nav-group">
            <div className="app-nav-row">
              <NavLink
                to="/isbn"
                className={({ isActive }) => 'app-nav-link' + (isActive ? ' active' : '')}
              >
                ISBN 변환
              </NavLink>
              <button
                type="button"
                className={'app-nav-toggle' + (historyOpen ? ' active' : '')}
                onClick={() => setHistoryOpen((v) => !v)}
                aria-expanded={historyOpen}
                aria-label="변환 내역 열기"
                data-tooltip="변환 내역"
              >
                <span className="count">{history.length}</span>
                <span className="chev">{historyOpen ? '▲' : '▼'}</span>
              </button>
            </div>

            {historyOpen && (
              <div className="app-nav-history">
                {/* ── 단건 변환 ── */}
                <button
                  type="button"
                  className={'app-nav-subtoggle' + (singleOpen ? ' active' : '')}
                  onClick={() => setSingleOpen((v) => !v)}
                >
                  <span>단건 변환</span>
                  <span className="count">{singleRecords.length}</span>
                  <span className="chev">{singleOpen ? '▲' : '▼'}</span>
                </button>
                {singleOpen && (
                  <div className="history-list">
                    {singleRecords.length === 0 && <div className="history-empty">단건 변환 내역이 없어요.</div>}
                    {singleRecords.map(renderRecordButton)}
                  </div>
                )}

                {/* ── 일괄 변환 ── */}
                <button
                  type="button"
                  className={'app-nav-subtoggle' + (batchListOpen ? ' active' : '')}
                  onClick={() => setBatchListOpen((v) => !v)}
                >
                  <span>일괄 변환</span>
                  <span className="count">{batchRun.runs.length}</span>
                  <span className="chev">{batchListOpen ? '▲' : '▼'}</span>
                </button>
                {batchListOpen && (
                  <div className="history-list">
                    {batchRun.runs.length === 0 && (
                      <div className="history-empty">아직 일괄 업로드한 배치가 없어요.</div>
                    )}
                    {batchRun.runs.map((r, i) => {
                      const records = recordsOfBatch(r)
                      const isOpen = openBatchId === r.id
                      return (
                        <div key={r.id} className="app-nav-batch">
                          <button
                            type="button"
                            className={'app-nav-batchtoggle' + (isOpen ? ' active' : '')}
                            onClick={() => setOpenBatchId((id) => (id === r.id ? null : r.id))}
                          >
                            <span>{batchLabel(i)}</span>
                            <span className="count">{records.length}</span>
                            <span className="chev">{isOpen ? '▲' : '▼'}</span>
                          </button>
                          {isOpen && (
                            <div className="history-list nested">
                              {records.length === 0 && (
                                <div className="history-empty">아직 변환된 항목이 없어요.</div>
                              )}
                              {records.map(renderRecordButton)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>
      <main className="app-main">
        <Outlet context={outletContext} />
      </main>
    </div>
  )
}
