import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// 개발 중에는 로컬 FastAPI 백엔드(python -m uvicorn app:app --port 8000, i2m_kormarc 폴더에서
// 실행)가 별도 포트에서 떠 있다고 가정한다. 브라우저가 /api/* 를 부르면 Vite 개발 서버가
// 서버 쪽에서 대신 백엔드로 중계해주므로(same-origin으로 보임) CORS 설정을 건드릴 필요가
// 없다 — app.py의 CORSMiddleware(현재 localhost:8501만 허용)는 그대로 둬도 된다.
// 배포 시에도 API는 같은 오리진(nginx가 /api를 같은 도메인에서 중계)이라 baseUrl은
// 그대로 빈 문자열이면 된다(src/api/client.ts) — VITE_API_BASE_URL은 안 씀.
//
// 프로덕션 빌드만 base를 "/app/"로 둔다 — i2m_kormarc(백엔드) Space에서 nginx가
// 이 빌드 결과를 "/app" 경로 아래로 서비스하기 때문에(주소 자체가 .../app/...),
// 정적 자산(js/css) 경로도 그 앞으로 맞춰야 한다. 로컬 개발 서버는 그대로 루트(/).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/app/' : '/',
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
}))
