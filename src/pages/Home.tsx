import { useEffect, useState } from 'react'
import { checkBackendHealth } from '../api/client'
import type { HealthStatus } from '../types/api'

/**
 * streamlit_app.py(Home)의 "시스템 상태" 패널을 대응시킨 것.
 * 지금은 준비 단계 확인용 — 실제로 로컬 백엔드(uvicorn app:app --port 8000)에
 * 연결되는지를 눈으로 볼 수 있게 하는 배관(plumbing) 테스트 페이지 역할이 크다.
 */
export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkBackendHealth().then((h) => {
      setHealth(h)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1>I2M KORMARC 통합 변환 시스템 (React 준비)</h1>
      <p style={{ color: 'var(--text-dim)' }}>
        아직 기능을 이식하지 않은 준비(스캐폴딩) 단계입니다. 이 페이지는 로컬 FastAPI
        백엔드와의 연결 배관이 정상인지 확인하는 용도입니다.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>백엔드 연결 상태</h2>
      {loading && <p>확인 중...</p>}
      {!loading && health && (
        <div
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--border-dark)',
            borderRadius: 10,
            padding: 16,
            fontSize: 13.5,
            lineHeight: 1.8,
          }}
        >
          <div>{health.ok ? '✅ 백엔드 연결 정상' : '⛔ 백엔드 연결 실패'} — {health.detail}</div>
          {health.version?.deployed_at && (
            <div>
              🔄️ 마지막 배포: {health.version.deployed_at} · 커밋 `{health.version.commit}`
            </div>
          )}
          {health.secrets_configured && (
            <div>
              🔑{' '}
              {Object.entries(health.secrets_configured)
                .map(([k, v]) => `${v ? '✅' : '⛔'} ${k}`)
                .join('  ·  ')}
            </div>
          )}
          {/* GPT를 실제로 호출하는 필드만 나열 — core/fields/*.py를 openai_client 사용처
              기준으로 확인한 목록(041/546 언어부호 판정, 246 원제 조회, 653 주제어 생성,
              700 외국인 이름 성/이름 순서 판별). 245/300 등 나머지는 규칙 기반이라
              크레딧이 없어도 그대로 동작한다. */}
          {health.openai_live && (
            <div>
              {health.openai_live.ok ? '✅' : '⛔'} OpenAI 실호출 {health.openai_live.ok ? '정상' : '실패'}
              {' — '}
              {health.openai_live.ok
                ? '041·246·653·700의 GPT 기능이 동작합니다.'
                : `${health.openai_live.detail ?? health.openai_live.code ?? '원인 불명'} (041·246·653·700의 GPT 기능에 영향)`}
            </div>
          )}
          {!health.ok && (
            <div style={{ color: 'var(--accent-amber)', marginTop: 8 }}>
              로컬에서 확인하려면 i2m_kormarc 폴더에서 아래 명령으로 백엔드를 먼저 띄우세요:
              <pre
                style={{
                  background: 'var(--shell-bg2)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  marginTop: 6,
                }}
              >
                python -m uvicorn app:app --host 127.0.0.1 --port 8000
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
