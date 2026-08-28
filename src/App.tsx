import { useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { HistoryRecord } from './types/history'
import type { IsbnHistoryContextValue } from './context/isbnHistory'
import './App.css'

/**
 * 레이아웃 뼈대 — prototypes/mrk_editor_prototype.html의 .app(사이드바 252px + 본문) 그리드를 이식.
 *
 * 변환 내역 상태는 원래 ISBN 변환 페이지 안에서만 살았는데, "ISBN 변환" 네비 항목에
 * 토글 버튼 + 드롭다운으로 붙여달라는 요청 때문에 여기(App.tsx)로 끌어올렸다 — 사이드바가
 * 페이지 전환과 무관하게 항상 떠 있으므로, 드롭다운도 여기서 그려야 한다. 페이지 쪽은
 * context/isbnHistory.ts의 useIsbnHistory() 훅으로 이 상태를 읽고 쓴다(Outlet context).
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
  const dirtyRef = useRef(false)
  const navigate = useNavigate()

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

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-head">2026 I2M KORMARC</div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => 'app-nav-link' + (isActive ? ' active' : '')}>
            홈 (시스템 상태)
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
                {history.length === 0 && <div className="history-empty">아직 변환 내역이 없어요.</div>}
                {/* 최신순(위)이 아니라 추가된 순서 그대로 — 새 항목은 아래로 쌓인다. */}
                <div className="history-list">
                  {history.map((rec) => (
                    <button
                      key={rec.uid}
                      className={'history-item' + (rec.uid === currentUid ? ' active' : '')}
                      onClick={() => selectRecord(rec.uid)}
                    >
                      <div className="hi-title">
                        {rec.edited && <span className="edited-dot" data-tooltip="원본에서 수정됨" />}
                        {rec.title}
                      </div>
                      <div className="hi-meta">{rec.isbn}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink to="/eval" className={({ isActive }) => 'app-nav-link' + (isActive ? ' active' : '')}>
            평가시스템
          </NavLink>
        </nav>
        <div className="app-sidebar-foot">
          React 준비 단계 — 로컬 전용, 아직 GitHub에 올리지 않음.
        </div>
      </aside>
      <main className="app-main">
        <Outlet context={outletContext} />
      </main>
    </div>
  )
}
