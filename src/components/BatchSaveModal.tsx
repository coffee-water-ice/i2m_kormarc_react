import { useState } from 'react'
import { useIsbnHistory } from '../context/isbnHistory'
import { useBatchUpload, type BatchRun } from '../hooks/useBatchUpload'
import { saveBatchAsFiles } from '../lib/batchExport'
import { batchLabel } from '../lib/batchConfig'
import './BatchUploadModal.css'

interface BatchSaveModalProps {
  onClose: () => void
}

const STATUS_LABEL: Record<BatchRun['status'], string> = {
  idle: '대기 중',
  'preflight-blocked': '시작 못 함',
  running: '진행 중',
  paused: '일시정지',
  'stopped-gpt': '중단됨',
  cancelled: '취소됨',
  done: '완료',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function statusText(run: BatchRun): string {
  const base = STATUS_LABEL[run.status]
  const showProgress = run.status === 'running' || run.status === 'paused' || run.status === 'stopped-gpt' || run.status === 'cancelled'
  return showProgress ? `${base} (${run.done}/${run.total})` : base
}

/**
 * "일괄 저장" 전용 화면 — 지금까지(이 세션에서) 일괄 업로드로 실행한 배치를 전부
 * 목록으로 보여주고, 체크박스로 골라 한 번에 MRC 1개 + MRK 여러 개로 내보낸다.
 * 데이터 출처는 hooks/useBatchUpload.ts의 runs(실행 기록)지만, 실제로 파일에
 * 담기는 내용은 각 레코드의 "지금" 상태(history에서 uid로 다시 찾음) — 배치 직후
 * 스냅숏이 아니라 사서가 사서편집에서 고치고 저장한 최신 내용을 반영하기 위함.
 */
export default function BatchSaveModal({ onClose }: BatchSaveModalProps) {
  const { history } = useIsbnHistory()
  const run = useBatchUpload()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 3200)
  }

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((s) => (s.size === run.runs.length ? new Set() : new Set(run.runs.map((r) => r.id))))
  }

  async function handleSave() {
    const selectedRuns = run.runs.filter((r) => selected.has(r.id))
    const uids = new Set(
      selectedRuns.flatMap((r) => r.entries.filter((e) => e.record).map((e) => e.record!.uid)),
    )
    // 배치가 만들었을 때의 스냅숏이 아니라, 지금 사이드바(history)에 있는 최신 상태를
    // uid로 다시 찾아서 저장한다 — 사서가 그 사이에 사서편집에서 고쳤을 수 있으므로.
    const records = history.filter((h) => uids.has(h.uid))
    if (records.length === 0) {
      showToast('저장할 레코드가 없어요 — 배치를 선택했는지 확인해주세요.')
      return
    }
    setSaving(true)
    const result = await saveBatchAsFiles(records)
    setSaving(false)
    if (result.mode === 'cancelled') return
    if (!result.ok) {
      showToast(`저장 실패 — ${result.error ?? '알 수 없는 오류'}`)
      return
    }
    const modeLabel = result.mode === 'directory' ? '선택한 폴더에 저장했어요' : 'zip 파일로 내려받았어요'
    const failNote = result.failedIsbns.length > 0 ? ` (${result.failedIsbns.length}건은 MARC 인코딩 실패로 제외됨)` : ''
    showToast(`MRC 1개 + MRK ${result.savedCount}개를 ${modeLabel}.${failNote}`)
  }

  return (
    <div className="bu-overlay" onClick={onClose}>
      <div className="bu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="bu-header">
          <h2>💾 일괄 저장</h2>
          <button type="button" className="bu-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <p className="bu-desc">그동안 일괄 업로드로 실행한 배치예요. 저장할 배치를 골라 MRC 1개 + MRK 여러 개로 받으세요.</p>

        {run.runs.length === 0 ? (
          <p className="bu-summary">아직 일괄 업로드로 실행한 배치가 없어요.</p>
        ) : (
          <div className="bu-table-wrap">
            <table className="bu-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.size === run.runs.length && run.runs.length > 0}
                      onChange={toggleAll}
                      aria-label="전체 선택"
                    />
                  </th>
                  <th>배치</th>
                  <th>건수</th>
                  <th>첫 등록번호</th>
                  <th>저장시간</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {run.runs.map((r, i) => (
                  <tr key={r.id}>
                    <td>
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                    </td>
                    <td>{batchLabel(i)}</td>
                    <td>{r.total}건</td>
                    <td className="bu-mono">{r.rows[0]?.regNo ?? '—'}</td>
                    <td>{formatTime(r.updatedAt)}</td>
                    <td className="bu-status">{statusText(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bu-confirm-row">
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving || selected.size === 0}>
            {saving ? '저장 중...' : '💾 일괄 저장 (MRC + MRK)'}
          </button>
        </div>

        {toast && <div className="bu-toast">{toast}</div>}
      </div>
    </div>
  )
}
