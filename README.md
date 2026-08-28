# i2m_kormarc_react (준비 단계 — 로컬 전용, GitHub 미반영)

`i2m_kormarc`(스트림릿) 프론트엔드를 React로 옮기기 위한 준비 프로젝트다. **아직 GitHub에
올리지 않고 로컬에서만 진행한다** — 잘 되면 그때 저장소 안으로 옮긴다. 그래서 일부러
`i2m_kormarc` 깃 저장소 밖(형제 폴더)에 만들었고, 여기엔 `.git`도 없다.

## 스택
- Vite + React + TypeScript
- react-router-dom (스트림릿 사이드바 멀티페이지 구조 대응)
- 별도 UI 컴포넌트 라이브러리 없음 — `prototypes/mrk_editor_prototype.html`(i2m_kormarc
  저장소)의 다크 테마 디자인 토큰을 `src/styles/tokens.css`에 그대로 옮겨와 사용

## 실행 방법 (둘 다 띄워야 함)

```bash
# 1) 백엔드 (i2m_kormarc 폴더에서)
cd ../i2m_kormarc
python -m uvicorn app:app --host 127.0.0.1 --port 8000

# 2) 프론트엔드 (이 폴더에서, 새 터미널)
npm install   # 최초 1회
npm run dev
```

브라우저에서 **http://localhost:5173** 접속. (`127.0.0.1:5173`이 아니라 `localhost`로 열 것 —
이 환경에서는 Vite 개발 서버가 IPv6(`::1`)로 바인딩돼 `127.0.0.1` 직접 접속은 안 될 수 있다.)

`vite.config.ts`의 dev proxy(`/api`, `/health` → `127.0.0.1:8000`)가 브라우저 기준으로는
같은 출처(same-origin)처럼 보이게 중계해주므로, 로컬 개발 중에는 백엔드 `app.py`의 CORS
설정을 건드릴 필요가 없다.

## 현재 상태 (2026-08-25 기준)
- [x] 프로젝트 스캐폴딩 + 타입체크(`npx tsc -b`)·빌드(`npm run build`) 정상 확인
- [x] `src/api/client.ts` — `i2m_kormarc/api_client.py`와 1:1 대응하는 fetch 클라이언트
      (`checkBackendHealth` / `convertIsbn` / `convertBatch`)
- [x] `src/types/api.ts` — 백엔드 응답 타입(실제 변환 호출로 관찰한 `meta` 키 기준)
- [x] 레이아웃 뼈대(`App.tsx`) + 라우트 3개 — Home(백엔드 연결 상태 확인용, 실제 동작),
      ISBN 변환·평가시스템(둘 다 아직 준비 중 placeholder)
- [ ] ISBN 변환 페이지 — `mrk_editor_prototype.html`의 필드별 편집 UX를 실제로 구현
- [ ] 평가시스템 페이지 — **먼저 백엔드에 비동기 배치 작업 API(job 시작 → id 발급 →
      진행률 폴링/SSE)를 추가해야 함**. 지금의 "스트림릿 프로세스가 반복문을 돌리며 화면을
      계속 다시 그리는" 방식은 SPA에서는 쓸 수 없다.
- [ ] 2025 레거시 비교 페이지 — **이식 안 함(결정됨)**. 원본 5,284줄 파일이 화면·로직
      분리 없이 fused돼 있어 API로 감쌀 수 없고, 내부 비교용 도구라 스트림릿에 그대로 둔다.
- [ ] 배포용 백엔드 주소 주입(`.env.production`의 `VITE_API_BASE_URL`) — 아직 미설정
- [ ] 실제 로그인 검증 — 지금 스트림릿의 비밀번호 게이트(`auth_gate.py`)는 서버가 직접
      비교해서 막지만, React SPA는 브라우저에서만 체크하면 사실상 뚫린 것과 같다.
      백엔드에 로그인 확인용 엔드포인트를 새로 만들어야 한다(아직 없음).
