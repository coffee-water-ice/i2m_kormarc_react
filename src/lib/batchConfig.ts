/**
 * 일괄 업로드 기능(엑셀 업로드 → ISBN 순차 변환 → MRC/MRK 일괄 저장)의 공용 설정값.
 * 검증 로직(excelUpload.ts)과 화면 안내 문구(BatchUploadModal.tsx)가 전부 이 상수
 * 하나를 가져다 쓴다 — 숫자를 한 곳에서만 바꾸면 되게 하기 위함.
 *
 * 10건으로 잡은 근거: 이 세션에서 직접 관찰한 ISBN 1건 변환 소요시간이 GPT 호출
 * 포함 1분 31초~2분 11초였다 — 10건이면 최대 약 15분 안쪽. 평가시스템(useEvalRun)은
 * 채점용이라 최대 200건까지 처리하도록 만들어져 있지만, 이건 사서가 결과를 바로
 * 확인·편집해야 하는 실무용이라 훨씬 보수적으로 잡았다(사용자 확정, 2026-09-09).
 * 나중에 실사용 데이터가 쌓이면 이 값만 올리면 된다.
 */
export const MAX_BATCH_SIZE = 10

/** 엑셀 업로드 열 이름 — 예시 파일(excelTemplate.ts)과 업로드 파싱(excelUpload.ts)이
 * 같은 헤더 문자열을 봐야 하므로 여기 하나로 고정한다. */
export const UPLOAD_COLUMNS = {
  regMark: '등록구분',
  regNo: '등록번호',
  isbn: 'ISBN',
} as const

/** 업로드한 순서 그대로("배치 1"이 가장 먼저 올린 것) 매기는 배치 이름 — 사이드바
 * (App.tsx, "일괄 변환" 목록)와 일괄 저장 화면(BatchSaveModal, "배치" 열)이 같은
 * 번호를 봐야 하므로 여기 하나로 고정한다. useBatchUpload().runs 배열의 index를
 * 그대로 넘기면 된다(runs는 생성 순으로 쌓이고 지난 실행도 안 지워지므로 index가
 * 곧 업로드 순번이다). */
export function batchLabel(index: number): string {
  return `배치 ${index + 1}`
}
