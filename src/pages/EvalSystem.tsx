import { useEffect, useMemo, useState } from 'react'
import { checkBackendHealth } from '../api/client'
import type { HealthStatus } from '../types/api'
import { useEvalRun } from '../hooks/useEvalRun'
import { buildEvalTable } from '../lib/evalColumns'
import { buildCsv, downloadCsv } from '../lib/csvExport'
import EvalCheckpointList from '../components/EvalCheckpointList'
import './EvalSystem.css'

/** pages/3_평가시스템.py의 ISBN 정제 로직 그대로 — 대문자 변환 후 [0-9X]만 남기고,
 * 길이가 10 또는 13일 때만 인정, 순서를 유지하며 중복 제거. */
function parseIsbnList(text: string): string[] {
  const list: string[] = []
  for (const line of text.split(/\r?\n/)) {
    const cleaned = line.trim().toUpperCase().replace(/[^0-9X]/g, '')
    if (cleaned.length === 10 || cleaned.length === 13) list.push(cleaned)
  }
  const seen = new Set<string>()
  return list.filter((x) => {
    if (seen.has(x)) return false
    seen.add(x)
    return true
  })
}

/**
 * pages/3_평가시스템.py의 "고도화 I2M" 절반을 이식한 배치 평가 화면 — "기존 I2M"(2025년
 * 원본 코드, 인프로세스로만 재사용 가능)은 이식 대상에서 빠져 스트림릿 전용으로 남는다.
 *
 * 진행률/이어하기는 브라우저 로컬(hooks/useEvalRun.ts + lib/evalCheckpoint.ts)에서만
 * 처리한다("A안") — 이 페이지 자체는 그 결과 상태만 구독해서 보여줄 뿐, 진행 로직을
 * 직접 갖고 있지 않다(나중에 백엔드 job API로 옮겨가도 이 파일은 거의 안 바뀜).
 */
export default function EvalSystem() {
  const [rawText, setRawText] = useState('')
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const run = useEvalRun()

  useEffect(() => {
    checkBackendHealth().then(setHealth)
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400)
  }

  async function handleRecheck() {
    setChecking(true)
    setHealth(await checkBackendHealth())
    setChecking(false)
  }

  const isbns = useMemo(() => parseIsbnList(rawText), [rawText])

  // 200건 다 돌린 뒤에야 653이 전부 비었다는 걸 알게 되는 상황을 막는 사전 점검(화면
  // 표시용, 캐시된 값 — 실제 차단은 run.start()가 매번 강제로 다시 확인해서 건다).
  const backendDown = health !== null && !health.ok
  const openaiCached = health?.openai_live ?? null
  const openaiBlocked = health !== null && health.ok && openaiCached !== null && !openaiCached.ok
  const preflightBlocked = backendDown || openaiBlocked

  function handleRun() {
    if (isbns.length === 0) return
    run.start(isbns)
  }

  const running = run.status === 'running'
  const paused = run.status === 'paused'
  const finished = run.status === 'done' || run.status === 'stopped-gpt'

  const successCount = run.results.filter((r) => !r.error).length
  const failCount = run.results.filter((r) => r.error).length
  const notGptCalled = run.results.filter((r) => !r.error && r.meta.gpt_called === false)
  const reviewNeeded = run.results.filter((r) => r.meta.tag_056 && r.meta.kdc_low_confidence).length
  const missing653 = run.results.filter((r) => r.meta.kdc_input_presence?.keywords === false).length
  const made056 = run.results.filter((r) => (r.mrkText || '').includes('=056')).length

  function handleDownload() {
    const { headers, rows } = buildEvalTable(run.results)
    downloadCsv('평가결과.csv', buildCsv(headers, rows))
    showToast('CSV 파일을 내려받았어요.')
  }

  return (
    <div className="eval-page">
      <h1>평가시스템</h1>
      <p className="eval-sub">
        ISBN을 일괄 변환해서 채점용 CSV를 만듭니다. <b>고도화 I2M</b>(2026 파이프라인)만 여기서 실행할 수 있어요 — 2025년
        원본 코드 비교는 화면·로직이 분리돼 있지 않아 스트림릿 전용으로 계속 남아있습니다.
      </p>

      {run.status === 'idle' && run.resumable && (
        <div className="eval-banner">
          <span>
            ⏸️ 중단된 실행이 있어요 — {run.resumable.doneCount}/{run.resumable.meta.total}건 완료 (
            {run.resumable.meta.total - run.resumable.doneCount}건 남음)
          </span>
          <div className="eval-banner-actions">
            <button type="button" className="btn-primary" onClick={() => run.resume()}>
              바로 이어서 실행
            </button>
            <button type="button" onClick={() => run.discardResumable()}>
              새로 시작
            </button>
          </div>
        </div>
      )}

      <div className="eval-input-row">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={'ISBN을 한 줄에 하나씩 붙여넣으세요\n예: 9791190406260\n9788937462849\n9791162246015'}
          rows={8}
          disabled={running}
        />
      </div>
      {rawText.trim() !== '' && <p className="eval-count">평가 대상: {isbns.length}건 (중복 제거 후)</p>}
      <p className="eval-caption">
        ⚠️ 실제 외부 API(알라딘/OpenAI/KPIPA/행안부 등)를 호출하므로 건수가 많으면 시간이 오래 걸리고 실제 API
        사용량(비용)이 발생합니다.
      </p>

      {backendDown && (
        <div className="status-banner error eval-preflight">
          <div>⛔ 백엔드에 연결할 수 없습니다 — {health?.detail}</div>
          <button type="button" onClick={handleRecheck} disabled={checking}>
            {checking ? '확인 중...' : '🔄 다시 확인'}
          </button>
        </div>
      )}
      {!backendDown && openaiBlocked && (
        <div className="status-banner error eval-preflight">
          <div>
            ⛔ OpenAI 호출 불가 — 지금 실행하면 결과를 쓸 수 없습니다.
            <br />
            {openaiCached?.detail}
            <br />
            653이 생성되지 않고, 653을 입력으로 쓰는 056의 정확도가 함께 떨어집니다.
          </div>
          <button type="button" onClick={handleRecheck} disabled={checking}>
            {checking ? '확인 중...' : '🔄 다시 확인'}
          </button>
        </div>
      )}
      {!preflightBlocked && openaiCached && (
        <p className="eval-caption ok">✅ OpenAI 실호출 점검 통과 — 실행 직전과 실행 중 25건마다 다시 확인합니다.</p>
      )}

      <div className="eval-run-row">
        <button type="button" className="btn-primary" onClick={handleRun} disabled={isbns.length === 0 || preflightBlocked || running}>
          생성 실행
        </button>
        {running && (
          <button type="button" onClick={() => run.pause()}>
            일시정지
          </button>
        )}
        {paused && (
          <button type="button" className="btn-primary" onClick={() => run.start(isbns)}>
            재개
          </button>
        )}
      </div>

      {(running || paused) && run.total > 0 && (
        <div className="eval-progress">
          <div className="eval-progress-track">
            <div className="eval-progress-fill" style={{ width: `${Math.round((run.done / run.total) * 100)}%` }} />
          </div>
          <span>
            {run.done}/{run.total} {paused ? '일시정지됨' : '생성 중... (고도화 I2M)'}
          </span>
        </div>
      )}

      {run.checkpointDegraded && (
        <p className="eval-caption warn">
          ⚠️ 브라우저 저장 공간이 부족해 이번 실행은 새로고침 시 이어할 수 없어요 — 완료 후 CSV는 정상적으로 받을 수
          있습니다.
        </p>
      )}

      {run.status === 'preflight-blocked' && (
        <div className="status-banner error">⛔ 실행을 시작하지 않았습니다 — {run.blockDetail}</div>
      )}

      {run.status === 'stopped-gpt' && (
        <div className="status-banner error">
          ⛔ {run.done}건 시점에 OpenAI 호출이 실패했습니다 — {run.blockDetail}
          <br />
          여기까지 처리된 {run.done}건은 저장되어 있어요.
        </div>
      )}

      {finished && run.results.length > 0 && (
        <div className="eval-summary">
          <div className="status-banner">
            ✅ 생성 완료 — 성공 {successCount}건 / 실패 {failCount}건
          </div>
          {failCount > 0 && (
            <details className="eval-details">
              <summary>실패 목록 ({failCount}건)</summary>
              <p>{run.results.filter((r) => r.error).map((r) => r.isbn).join(', ')}</p>
            </details>
          )}
          <p className="eval-caption">
            056 생성: {made056}/{run.results.length}건 · 검토 필요 {reviewNeeded}건 · 653 결손 {missing653}건
          </p>
          {notGptCalled.length > 0 && (
            <details className="eval-details warn">
              <summary>⚠️ GPT 미호출 — 채점 제외 대상 ({notGptCalled.length}건)</summary>
              <p>{notGptCalled.map((r) => r.isbn).join(', ')}</p>
            </details>
          )}
          <button type="button" className="btn-primary" onClick={handleDownload}>
            ⬇ CSV 파일 다운로드
          </button>
        </div>
      )}

      <EvalCheckpointList onResume={(list) => run.start(list)} disabled={running} />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
