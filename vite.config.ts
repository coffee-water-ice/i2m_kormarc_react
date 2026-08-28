import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// 개발 중에는 로컬 FastAPI 백엔드(python -m uvicorn app:app --port 8000, i2m_kormarc 폴더에서
// 실행)가 별도 포트에서 떠 있다고 가정한다. 브라우저가 /api/* 를 부르면 Vite 개발 서버가
// 서버 쪽에서 대신 백엔드로 중계해주므로(same-origin으로 보임) CORS 설정을 건드릴 필요가
// 없다 — app.py의 CORSMiddleware(현재 localhost:8501만 허용)는 그대로 둬도 된다.
// 배포할 때는 이 proxy 대신 실제 백엔드 URL을 환경변수(VITE_API_BASE_URL)로 넘길 예정.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
