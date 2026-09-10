import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { checkBackendHealth } from '../api/client'
import type { HealthStatus } from '../types/api'
import { FIELD_653_FLAGS } from '../lib/qualityFlags653'

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '6px 10px',
  borderBottom: '1px solid var(--border-dark)',
  color: 'var(--text-dim)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}
const tdStyle: CSSProperties = {
  textAlign: 'left',
  padding: '6px 10px',
  borderBottom: '1px solid var(--border-dark)',
  verticalAlign: 'top',
}

/**
 * streamlit_app.py(Home)의 "시스템 상태" 패널을 대응시킨 것 + 사용 설명서(사서 대상
 * 안내문, 2026-09-09 요청 그대로 반영 — 단건/일괄 변환 각각의 개념 한 줄 설명과
 * "방법" 단계 목록). 백엔드 연결 상태 패널은 로컬 백엔드(uvicorn app:app --port 8000)에
 * 연결되는지를 눈으로 볼 수 있게 하는 배관(plumbing) 확인용으로 그대로 둔다.
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
      <h1>I2M KORMARC 통합 변환 시스템</h1>
      <p style={{ color: 'var(--text-dim)' }}>
        왼쪽 사이드바의 "ISBN 변환"(단건/일괄)과 "평가시스템"을 바로 사용할 수 있습니다.
        아래 사용 설명서를 참고하세요.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>ISBN 변환_사용 설명서</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--border-dark)',
            borderRadius: 10,
            padding: 16,
            fontSize: 13.5,
            lineHeight: 1.75,
          }}
        >
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>📄 단건 변환</h3>
          <p style={{ margin: '0 0 10px', color: 'var(--text-dim)' }}>
            ISBN 한 건을 입력 후 수정 및 다운로드 가능
          </p>
          <div style={{ color: 'var(--text-faint)', fontSize: 12, marginBottom: 4 }}>방법</div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li>ISBN 입력 후 변환 실행.</li>
            <li>이때는 049(소장사항)을 별도로 입력해야 함.</li>
            <li>수정 후 "수정함" 클릭.</li>
            <li>사서 편집 항목의 전체 복사나 MRC 다운 사용.</li>
          </ol>
        </div>

        <div
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--border-dark)',
            borderRadius: 10,
            padding: 16,
            fontSize: 13.5,
            lineHeight: 1.75,
          }}
        >
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>📤 일괄 변환</h3>
          <p style={{ margin: '0 0 10px', color: 'var(--text-dim)' }}>
            2건 이상의 ISBN을 검색 시 사용하며 입력 후 수정 및 일괄 다운로드 가능
          </p>
          <div style={{ color: 'var(--text-faint)', fontSize: 12, marginBottom: 4 }}>방법</div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li>일괄 업로드 &gt; 예시파일 다운로드 &gt; 해당 내용 입력 및 컴퓨터에 저장.</li>
            <li>일괄 업로드 &gt; 엑셀 파일 선택 &gt; 저장한 파일 선택 &gt; 내용 검토 &gt; 확인.</li>
            <li>이때는 049(소장사항)을 별도로 입력 불필요.</li>
            <li>수정 후 "수정함" 클릭.</li>
            <li>일괄 저장 &gt; 필요한 항목 선택 &gt; 일괄 저장(MRC+MRK) 클릭.</li>
          </ol>
        </div>
      </div>

      {/* 사서편집 화면에서 653 필드 옆에 뜨는 ⚠️ 아이콘이 무슨 뜻인지 궁금할 때만
          펼쳐보면 되는 참고 자료 — 평소엔 접혀 있어서 홈 화면을 어지럽히지 않는다
          (2026-09-10 요청: "653 경고 표를 홈에 필요하면 볼 수 있도록"). 코드/문구/설명
          내용은 lib/qualityFlags653.ts 하나를 IsbnConvert.tsx(⚠️ 아이콘 툴팁·검토
          항목 표)와 함께 공유한다 — 여기서 문구를 고치면 사서편집 화면도 같이 바뀐다. */}
      <h2 style={{ fontSize: 16, marginTop: 28 }}>653 품질 경고 안내</h2>
      <details
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--border-dark)',
          borderRadius: 10,
          padding: 16,
          fontSize: 13,
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
          사서편집 화면에서 653(비통제 주제어) 필드 옆에 ⚠️가 뜨는 이유 — 펼쳐서 보기
        </summary>
        <p style={{ color: 'var(--text-dim)', margin: '10px 0', lineHeight: 1.6 }}>
          GPT가 653 키워드를 생성하는 과정의 품질에 따라 아래 경고 중 하나 이상이 함께 뜰 수
          있어요(같은 책이라도 변환할 때마다 결과가 달라질 수 있는 AI 생성 특성상, 경고가
          뜨지 않는 게 오히려 자연스러운 경우도 많아요). ⚠️ 아이콘에 마우스를 올리면 지금 뜬
          경고만 요약해서 보여주고, 사서 편집 필드 목록 아래 "검토 항목"에는 전체 설명이
          표로 함께 나와요.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                <th style={thStyle}>원본 코드</th>
                <th style={thStyle}>화면 문구</th>
                <th style={thStyle}>설명</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_653_FLAGS.map((f) => (
                <tr key={f.code}>
                  <td style={tdStyle}>
                    <code
                      style={{
                        fontFamily: 'var(--font-mono)',
                        background: 'var(--shell-bg2)',
                        padding: '1px 6px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.code}
                    </code>
                  </td>
                  <td style={tdStyle}>{f.label}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)' }}>{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

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
