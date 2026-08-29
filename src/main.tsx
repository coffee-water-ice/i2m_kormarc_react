import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import IsbnConvert from './pages/IsbnConvert.tsx'
import EvalSystem from './pages/EvalSystem.tsx'

// 라우트 구성 — 스트림릿 사이드바 멀티페이지 구조를 그대로 대응.
// 2025 레거시 비교 페이지(pages/2_2025_I2M.py)는 이식 대상에서 제외하기로 했으므로
// (원본 5,284줄 파일이 화면·로직 분리 없이 fused돼 있어 API로 감쌀 수 없음) 여기 없다 —
// 필요하면 계속 스트림릿 쪽에서만 운영한다.
// basename: 로컬 개발("/")에서는 사실상 no-op이고, 프로덕션 빌드("/app/", vite.config.ts의
// base와 반드시 같아야 함)에서는 백엔드 Space의 nginx가 이 앱을 그 경로 아래에 서비스하므로
// 라우팅도 그만큼 밀어줘야 한다(안 그러면 새로고침 시 "/app/isbn" 같은 주소가 404).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="isbn" element={<IsbnConvert />} />
          <Route path="eval" element={<EvalSystem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
