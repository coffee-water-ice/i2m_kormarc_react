import { useState } from 'react'
import { listCheckpoints, deleteCheckpoint, checkpointResultsInOrder, type EvalCheckpointSummary } from '../lib/evalCheckpoint'
import { buildEvalTable } from '../lib/evalColumns'
import { buildCsv, downloadCsv } from '../lib/csvExport'
import { refreshResumable } from '../hooks/useEvalRun'

interface EvalCheckpointListProps {
  onResume: (isbns: string[]) => void
  disabled: boolean
}

/** 스트림릿의 "💾 저장된 실행 결과" 익스팬더에 대응 — localStorage에 있는 모든 평가
 * 체크포인트(지금 진행 중인 것 포함, 예전 실행 포함)를 나열하고 행마다 이어서 실행/
 * CSV 다운로드/삭제를 제공한다. */
export default function EvalCheckpointList({ onResume, disabled }: EvalCheckpointListProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<EvalCheckpointSummary[]>(() => listCheckpoints())

  function refresh() {
    setItems(listCheckpoints())
    refreshResumable()
  }

  function handleOpen() {
    if (!open) refresh()
    setOpen((v) => !v)
  }

  function handleDownload(item: EvalCheckpointSummary) {
    const entries = checkpointResultsInOrder(item.key)
    const { headers, rows } = buildEvalTable(entries)
    downloadCsv('평가결과.csv', buildCsv(headers, rows))
  }

  function handleDelete(item: EvalCheckpointSummary) {
    if (!window.confirm('이 실행 결과를 삭제할까요? 되돌릴 수 없어요.')) return
    deleteCheckpoint(item.key)
    refresh()
  }

  return (
    <div className="eval-ckpt-list">
      <button type="button" className="eval-ckpt-toggle" onClick={handleOpen}>
        💾 저장된 실행 결과 ({items.length}) {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="eval-ckpt-body">
          {items.length === 0 && <p className="eval-ckpt-empty">브라우저에 저장된 실행 결과가 없어요.</p>}
          {items.map((item) => (
            <div className="eval-ckpt-row" key={item.key}>
              <div className="eval-ckpt-info">
                <span className="eval-ckpt-count">
                  {item.doneCount}/{item.meta.total}건
                </span>
                <span className="eval-ckpt-date">{new Date(item.meta.updatedAt).toLocaleString('ko-KR')}</span>
              </div>
              <div className="eval-ckpt-actions">
                <button
                  type="button"
                  disabled={disabled || item.doneCount >= item.meta.total}
                  onClick={() => onResume(item.meta.isbns)}
                >
                  이어서 실행
                </button>
                <button type="button" disabled={item.doneCount === 0} onClick={() => handleDownload(item)}>
                  CSV 다운로드
                </button>
                <button type="button" className="danger" onClick={() => handleDelete(item)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
