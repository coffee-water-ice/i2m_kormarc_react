import { useEffect, useRef, useState } from 'react'
import { convertIsbn, mrkToMarc } from '../api/client'
import type { HistoryRecord } from '../types/history'
import type { MrkField } from '../types/mrk'
import { useIsbnHistory } from '../context/isbnHistory'
import {
  parseMrkText,
  serializeRecord,
  serializeRecordAsMarcBinary,
  serializeRecordForMarcExport,
  extractTitle,
  applyKdcToFields,
  applyHoldingsRegToFields,
  nextUid,
  missingSubfields,
} from '../lib/mrk'
import { formatElapsed } from '../lib/format'
import FieldEditor from '../components/FieldEditor'
import ClassificationPanel from '../components/ClassificationPanel'
import HoldingsPanel from '../components/HoldingsPanel'
import './IsbnConvert.css'

/**
 * 사서 편집은 편집 중엔 형식을 검사하지 않는다(자유 텍스트라 뭐든 될 수 있음) — 대신
 * "저장" 버튼을 눌렀을 때만 검사해서, 문제가 있으면 저장을 보류하고 그 행을 가리켜준다.
 * 첫 번째로 발견된 문제만 반환(한 번에 여러 개를 보여주면 오히려 헷갈려서).
 */
function findSaveBlockingIssue(fields: MrkField[]): { tag: string; reason: string } | null {
  for (const f of fields) {
    if (!/^\d{3}$/.test(f.tag)) {
      return { tag: f.tag || '?', reason: '필드 번호는 숫자 3자리여야 해요.' }
    }
    if (f.kind === 'data') {
      const codeless = f.subfields.find((sf) => sf.code === '')
      if (codeless) {
        return { tag: f.tag, reason: `식별기호($코드)가 빠진 값이 있어요: "${codeless.value}"` }
      }
      const missing = missingSubfields(f)
      if (missing.length > 0) {
        return { tag: f.tag, reason: `필수 서브필드 누락: $${missing.join(', $')}` }
      }
    }
  }
  return null
}

/**
 * pages/1_2026_ISBN_변환.py + pages/4_ISBN_변환_프로토타입.py(스트림릿)의 후속 —
 * prototypes/mrk_editor_prototype.html의 UI/UX를 React로 실제 이식한 페이지.
 * FieldEditor/ClassificationPanel 두 컴포넌트로 조립한다.
 *
 * 변환 내역(history) 자체는 이 페이지가 아니라 전역 사이드바(App.tsx)가 들고 있다 —
 * "ISBN 변환" 네비 항목에 토글 + 드롭다운으로 붙여야 해서(useIsbnHistory, Outlet context).
 */
export default function IsbnConvert() {
  const { history, setHistory, currentUid, setCurrentUid, dirtyRef } = useIsbnHistory()
  const [isbn, setIsbn] = useState('')
  const [converting, setConverting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [downloadingMrc, setDownloadingMrc] = useState(false)
  const [rawText, setRawText] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  // 056 후보를 고를 때마다 매번 다시 반짝이게(같은 태그를 연달아 골라도 재실행되도록)
  // 태그명이 아니라 매번 값이 바뀌는 토큰으로 들고 있는다.
  const [pulseSignal, setPulseSignal] = useState<{ tag: string; token: number } | null>(null)

  const current = history.find((r) => r.uid === currentUid) ?? null

  // "사서 편집" 카드는 저장 버튼을 눌러야 확정되는 초안(draft) 모델로 동작한다 — history
  // (전역 상태, App.tsx 사이드바가 참조)에는 곧바로 patch하지 않고, 이 페이지 안에서만
  // 사는 draftFields/draftKdcSelected/draftKdcDetail을 고치다가 handleSaveDraft에서
  // 한 번에 커밋한다. 다른 변환 내역으로 전환하면(currentUid 변경) 그 레코드의 마지막
  // 저장 상태로 초기화된다 — 저장하지 않은 변경사항은 그 시점에 버려진다(의도된 동작).
  const [draftFields, setDraftFields] = useState<MrkField[]>([])
  const [draftKdcSelected, setDraftKdcSelected] = useState('')
  const [draftKdcDetail, setDraftKdcDetail] = useState('')
  // Ctrl+Z 되돌리기 — "draft 필드 변경 전" 스냅샷을 쌓아둔다. 모든 키 입력마다 찍으면
  // (예: 제목 타이핑) 한 글자씩 undo해야 해서 정신없으므로, 서브필드 삭제·삽입·지시기호
  // 변경·공백 트림처럼 되돌릴 필요가 큰 "구조적" 조작과 원본 텍스트 일괄 반영·KDC 후보
  // 선택 직전에만 스냅샷을 남긴다(값 타이핑 자체는 각 <input>의 브라우저 기본 되돌리기에
  // 맡긴다). 레코드를 바꾸면 초안과 함께 스택도 비운다.
  const undoStackRef = useRef<MrkField[][]>([])

  useEffect(() => {
    setDraftFields(current?.fields ?? [])
    setDraftKdcSelected(current?.kdcSelected ?? '')
    setDraftKdcDetail(current?.kdcDetail ?? '')
    undoStackRef.current = []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.uid])

  // 마지막 저장 상태(current)와 지금 초안이 다르면 "저장 안 된 변경사항 있음".
  const dirty =
    !!current &&
    (JSON.stringify(draftFields) !== JSON.stringify(current.fields) ||
      draftKdcSelected !== current.kdcSelected ||
      draftKdcDetail !== current.kdcDetail)

  // App.tsx 사이드바가 "다른 항목으로 전환하기 전 확인창"을 띄울지 판단할 때 쓰는 값이라
  // 매 렌더마다 최신 dirty로 채워 넣는다(ref라서 이 자체는 리렌더를 유발하지 않는다).
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty, dirtyRef])

  // 이 페이지를 떠나면(홈/평가시스템으로 이동 등) 더 이상 보호할 초안이 없으니 ref를
  // 비워서, 나중에 사이드바에서 항목을 고를 때 낡은 dirty 값으로 확인창이 잘못 뜨지
  // 않게 한다.
  useEffect(() => {
    return () => {
      dirtyRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pushUndoSnapshot() {
    undoStackRef.current = [...undoStackRef.current, draftFields].slice(-30)
  }

  useEffect(() => {
    function handleUndoKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.key.toLowerCase() !== 'z') return
      // 원본 텍스트 textarea는 자기 자신의(여러 줄) 브라우저 되돌리기가 더 자연스러우니
      // 여기서는 손대지 않는다.
      if ((document.activeElement as HTMLElement | null)?.tagName === 'TEXTAREA') return
      const stack = undoStackRef.current
      if (stack.length === 0) return
      e.preventDefault()
      const prevFields = stack[stack.length - 1]
      undoStackRef.current = stack.slice(0, -1)
      setDraftFields(prevFields)
    }
    document.addEventListener('keydown', handleUndoKeyDown)
    return () => document.removeEventListener('keydown', handleUndoKeyDown)
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400)
  }

  function patchCurrent(patch: Partial<HistoryRecord>) {
    if (!current) return
    const uid = current.uid
    setHistory((h) => h.map((r) => (r.uid === uid ? { ...r, ...patch } : r)))
  }

  /** "저장" 버튼 — 지금까지의 초안을 실제 변환 내역(history)에 확정 반영한다. 저장
   * 전에 형식을 검사해서, 문제가 있으면 저장하지 않고 그 행으로 스크롤+반짝임을 준다. */
  function handleSaveDraft() {
    if (!current) return
    const issue = findSaveBlockingIssue(draftFields)
    if (issue) {
      showToast(`저장할 수 없어요 — ${issue.tag} 필드: ${issue.reason}`)
      setPulseSignal((s) => ({ tag: issue.tag, token: (s?.token ?? 0) + 1 }))
      return
    }
    patchCurrent({
      fields: draftFields,
      kdcSelected: draftKdcSelected,
      kdcDetail: draftKdcDetail,
      edited: true,
      title: extractTitle(draftFields),
    })
    showToast('사서 편집 내용을 저장했어요.')
  }

  async function handleConvert() {
    const clean = isbn.trim()
    if (!clean) {
      setErrorMsg('ISBN을 입력해 주세요.')
      return
    }
    setErrorMsg(null)
    setConverting(true)
    const result = await convertIsbn(clean)
    setConverting(false)

    if (result.error) {
      setErrorMsg(result.error)
      return
    }
    const fields = parseMrkText(result.mrk_text ?? '')
    const meta = result.meta ?? {}
    const candidates = meta.kdc_candidates ?? []
    const kdcSelected = candidates[0]?.kdc ?? ''
    // 모델은 강(2자리)까지만 판단한다(로직은 그대로) — 세목 입력창 자체는 빈 칸으로
    // 시작한다(2026-09-04까지는 '0'을 기본값으로 넣어놨었는데, 사서가 직접 입력하기
    // 전엔 빈 칸이 자연스럽다는 요청으로 바뀜). 다만 실제로 적용되는 056 $a 값과
    // 순위 표시(class-bar-label 등)는 세목이 비어 있어도 '0'을 기본으로 계산한다 —
    // 강(2자리)만 있는 완성 안 된 분류기호를 그대로 적용하지 않기 위함(pushKdcToFields의
    // `detail.trim() || '0'`와 같은 규칙). 후보가 없으면(056 미생성) 그대로 둔다.
    const kdcDetail = ''
    const initialFields = kdcSelected ? applyKdcToFields(fields, `${kdcSelected}${kdcDetail.trim() || '0'}`) : fields
    const rec: HistoryRecord = {
      uid: nextUid(),
      isbn: result.isbn,
      title: extractTitle(fields),
      meta,
      fields: initialFields,
      edited: false,
      kdcSelected,
      kdcDetail,
    }
    setHistory((h) => [...h, rec])
    setCurrentUid(rec.uid)
    setShowRaw(false)
  }

  const candidates = current?.meta.kdc_candidates ?? []
  // 아직 저장 전인 draftFields를 그대로 직렬화한다 — 복사/다운로드/원본 텍스트 미리보기
  // 모두 "지금 화면에 보이는 대로"를 내보내야 자연스럽다(저장 여부와 무관하게).
  const finalMrk = serializeRecord(draftFields)

  /** 라디오 선택/세목 입력 결과를 draft의 056 $a에 즉시 반영(저장 전까지는 초안일 뿐).
   * 세목 칸이 비어 있으면(사용자가 지웠거나) '0'을 기본값으로 쓴다 — 강(2자리)만
   * 있는 완성 안 된 분류기호를 그대로 적용하지 않기 위함. */
  function pushKdcToFields(selected: string, detail: string) {
    const finalKdc = `${selected}${detail.trim() || '0'}`
    setDraftKdcSelected(selected)
    setDraftKdcDetail(detail)
    setDraftFields((f) => applyKdcToFields(f, finalKdc))
  }

  function handleKdcSelect(kdc: string) {
    pushUndoSnapshot()
    pushKdcToFields(kdc, draftKdcDetail)
    // 라디오를 고른 순간만 반짝이게 한다(세목 입력은 타이핑마다 반짝이면 정신없어서 제외) —
    // prototype의 .pulse 애니메이션 + row.scrollIntoView.
    setPulseSignal((s) => ({ tag: '056', token: (s?.token ?? 0) + 1 }))
  }

  function handleKdcDetailChange(detail: string) {
    pushKdcToFields(draftKdcSelected, detail)
  }

  // 049(소장사항/등록번호) — kdcSelected/kdcDetail과 달리 별도 draft 상태를 안 둔다.
  // $I 값 하나뿐이라 draftFields 자체가 유일한 출처면 충분하고(있으면 그 필드에서
  // 바로 읽고, 없으면 빈 문자열), applyHoldingsRegToFields가 타이핑마다 draftFields의
  // 049를 직접 갱신한다(lib/mrk.ts 코멘트 참고 — 950 다음 위치·지시기호/코드 고정).
  const holdings049 = draftFields.find(
    (f): f is Extract<MrkField, { kind: 'data' }> => f.kind === 'data' && f.tag === '049',
  )
  const holdingsRegValue = holdings049?.subfields.find((sf) => sf.code === 'I')?.value ?? ''

  function handleHoldingsRegChange(value: string) {
    setDraftFields((f) => applyHoldingsRegToFields(f, value))
  }

  function handleDownload() {
    if (!current) return
    const blob = new Blob([finalMrk], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${current.isbn}.mrk`
    a.click()
    URL.revokeObjectURL(url)
    showToast('.mrk 파일을 내려받았어요.')
  }

  /** 진짜 바이너리 MARC(.mrc, ISO 2709) 다운로드 — 백엔드의 /api/mrk-to-marc로 지금
   * 화면에 있는 mrk 텍스트(저장 여부와 무관하게 draft 그대로)를 보내서 그 자리에서
   * 새로 인코딩받는다. 클라이언트엔 MARC 인코더가 없어서(직접 구현하면 ISO 2709
   * 포맷을 통째로 새로 짜야 함 — pymarc가 이미 하는 일을 중복 구현하는 셈) 백엔드에
   * 위임했다 — 그래서 사서 편집에서 고친 내용도 그대로 반영된다.
   * finalMrk가 아니라 serializeRecordForMarcExport(draftFields)를 보낸다 — 둘 다
   * "$" 관례 텍스트라 형태는 같지만, 원화 표기만 다르다(finalMrk는 화면에 보이는
   * 유니코드 ₩ 그대로, 이건 실제 남산마크 원본과 같은 백슬래시로 바꿔서 보냄) —
   * 진짜 바이너리로 나가는 파일이니 실제 MARC 바이트와 일치해야 한다(lib/mrk.ts
   * 상단 WON_SIGN 코멘트 참고). */
  async function handleDownloadMrc() {
    if (!current) return
    setDownloadingMrc(true)
    const result = await mrkToMarc(serializeRecordForMarcExport(draftFields))
    setDownloadingMrc(false)
    if (!result.marcBytesB64) {
      showToast(`.mrc 인코딩에 실패했어요 — ${result.error ?? '알 수 없는 오류'}`)
      return
    }
    const binary = atob(result.marcBytesB64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'application/marc' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${current.isbn}.mrc`
    a.click()
    URL.revokeObjectURL(url)
    showToast(
      result.error
        ? `.mrc 파일을 내려받았어요 — 일부 줄은 인식하지 못했어요: ${result.error}`
        : '.mrc 파일을 내려받았어요.',
    )
  }

  // "전체 복사"만 진짜 MARC 바이너리 구분자(0x1F/0x1E)로 내보낸다 — 다른 도서관리
  // 시스템(예: 남산마크)에 바로 붙여넣을 수 있게 하기 위함. 화면(▼)·행 복사·.mrk
  // 다운로드·저장 검증 등 나머지는 전부 지금 그대로("$" 기반 mrk 텍스트) 둔다 — 이건
  // 명시적으로 요청받은 범위다(2026-09-04).
  function handleCopyAll() {
    navigator.clipboard.writeText(serializeRecordAsMarcBinary(draftFields))
    showToast('레코드 전체를 MARC 바이너리 형식으로 복사했어요.')
  }

  function handleCopyLine(line: string) {
    navigator.clipboard.writeText(line)
    showToast('해당 필드를 복사했어요.')
  }

  function handleOpenRaw() {
    if (!showRaw) setRawText(finalMrk)
    setShowRaw((v) => !v)
  }

  function handleApplyRaw() {
    const parsed = parseMrkText(rawText)
    if (parsed.length === 0) {
      showToast('파싱할 수 있는 필드를 찾지 못했어요. "=245  00$a..." 형식인지 확인해주세요.')
      return
    }
    pushUndoSnapshot()
    setDraftFields(parsed)
    setShowRaw(false)
    showToast('원본 텍스트를 편집 화면에 반영했어요 — 저장 버튼을 눌러야 확정돼요.')
  }

  const elapsedMs = current?.meta.elapsed_ms
  const totalTokens = current?.meta.token_usage?.total_tokens ?? 0

  return (
    <div className="isbn-page">
      <div className="isbn-main">
        <div className="topbar">
          <div className="isbn-row">
            <div className="isbn-field">
              <label htmlFor="isbn-input">ISBN-13</label>
              <input
                id="isbn-input"
                value={isbn}
                placeholder="예: 9788937462849"
                onChange={(e) => setIsbn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
              />
            </div>
            <button className="btn-primary" onClick={handleConvert} disabled={converting}>
              {converting ? '변환 중...' : '변환 실행'}
            </button>
          </div>
          {converting && (
            // 변환은 몇 초~수십 초 걸려서(GPT 호출 포함) 그냥 기다리기 심심하니까 —
            // 개구리 하나가 트랙을 왔다갔다 뛰어다니는 순수 CSS 애니메이션.
            <div className="frog-track" role="status" aria-label="변환 중">
              <span className="frog-hop">
                <span className="frog-emoji" aria-hidden="true">
                  🐸
                </span>
              </span>
            </div>
          )}
          {errorMsg && <div className="status-banner error">⛔ {errorMsg}</div>}
          {!errorMsg && current && elapsedMs !== undefined && (
            <div className="status-banner">
              ● 변환 완료 · 소요시간 {formatElapsed(elapsedMs)} · GPT 토큰 {totalTokens.toLocaleString()}개
            </div>
          )}
        </div>

        {!current && !converting && (
          <p style={{ color: 'var(--ink-dim)' }}>
            ISBN을 입력하고 변환 실행을 누르면 편집 화면이 나타납니다. 지난 변환 내역은 왼쪽
            사이드바의 "ISBN 변환" 옆 토글에서 확인할 수 있어요.
          </p>
        )}

        {current && (
          <section className="editor-wrap">
            <div className="card">
              <div className="card-toolbar">
                <div className="card-title">
                  사서 편집
                  <small className={dirty ? 'dirty' : undefined}>
                    {dirty
                      ? '저장하지 않은 변경사항이 있어요 — 저장을 눌러야 확정돼요.'
                      : '필드를 직접 클릭해서 값을 고칠 수 있어요'}
                  </small>
                </div>
                <div className="card-actions">
                  <button className="btn-save" onClick={handleSaveDraft} disabled={!dirty}>
                    💾 저장
                  </button>
                  <button className={'raw-toggle' + (showRaw ? ' active' : '')} onClick={handleOpenRaw}>
                    ⇄ 원본 텍스트
                  </button>
                  <button onClick={handleCopyAll}>⧉ 전체 복사</button>
                  <button onClick={handleDownload}>↓ .mrk</button>
                  <button
                    className="mrc"
                    onClick={handleDownloadMrc}
                    disabled={downloadingMrc}
                    data-tooltip="진짜 바이너리 MARC(ISO 2709) — 사서 편집에서 고친 내용도 반영해서 새로 인코딩"
                  >
                    {downloadingMrc ? '인코딩 중...' : '↓ .mrc'}
                  </button>
                </div>
              </div>

              {showRaw && (
                <div className="raw-panel">
                  <p>여기서 직접 고친 뒤 아래 버튼으로 편집 화면에 반영할 수 있어요.</p>
                  <textarea
                    value={rawText}
                    spellCheck={false}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                  <div className="raw-actions">
                    <button className="primary" onClick={handleApplyRaw}>
                      구조화된 편집에 반영
                    </button>
                    <button onClick={() => setShowRaw(false)}>닫기</button>
                  </div>
                </div>
              )}

              <FieldEditor
                fields={draftFields}
                onChange={setDraftFields}
                onBeforeStructuralChange={pushUndoSnapshot}
                onCopyLine={handleCopyLine}
                pulseSignal={pulseSignal}
              />
            </div>

            <div className="side-panels">
              <ClassificationPanel
                candidates={candidates}
                ratio={current.meta.kdc_margin_ratio}
                lowConfidence={current.meta.kdc_low_confidence}
                reason={current.meta.kdc_reason}
                edition={current.meta.kdc_edition}
                selected={draftKdcSelected}
                detail={draftKdcDetail}
                onSelect={handleKdcSelect}
                onDetailChange={handleKdcDetailChange}
              />
              <HoldingsPanel value={holdingsRegValue} onChange={handleHoldingsRegChange} />
            </div>
          </section>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
