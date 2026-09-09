/**
 * "일괄 업로드" 예시 엑셀 파일("엑셀 업로드 예시.xlsx") 생성 — 등록구분/등록번호/ISBN
 * 3열짜리 시트를 만들어 다운로드한다. 다른 다운로드(.mrk/.mrc/.csv)와 마찬가지로
 * Blob + createObjectURL + 숨긴 앵커 클릭 패턴을 그대로 쓴다(XLSX.writeFile 자체
 * 브라우저 다운로드 로직에 기대지 않고, XLSX.write로 바이트만 뽑아서 이 프로젝트의
 * 기존 다운로드 관례에 맞춘다).
 */
import * as XLSX from 'xlsx'
import { UPLOAD_COLUMNS } from './batchConfig'

// 등록번호처럼 앞자리 0이 의미 있는 값은 엑셀이 "숫자"로 인식하는 순간 그 0을 날려버린다
// (예: "0000123456" → 123456). 셀 서식을 텍스트("@")로 미리 지정해두면 사서가 그 칸에
// 값을 입력해도 문자열로 유지된다 — 예시 행뿐 아니라 그 아래 여러 행까지 미리 서식을
// 걸어둬서, 사서가 예시 아래에 이어서 채워도 서식이 유지되게 한다.
const PRE_FORMATTED_ROWS = 30

function colLetter(colIndex0: number): string {
  return XLSX.utils.encode_col(colIndex0)
}

export function downloadUploadTemplate(): void {
  const headers = [UPLOAD_COLUMNS.regMark, UPLOAD_COLUMNS.regNo, UPLOAD_COLUMNS.isbn]
  const exampleRows = [
    ['EM', '0000123456', '9791190406260'],
    ['EM', '0000123457', '9788937462849'],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleRows])

  // 등록번호 열(B열, 0-based index 1) 서식을 텍스트로 고정 — 예시 2행 + 사서가 이어서
  // 쓸 것으로 예상되는 여분의 행까지.
  const regNoCol = colLetter(1)
  for (let row = 2; row <= PRE_FORMATTED_ROWS + 1; row++) {
    const ref = `${regNoCol}${row}`
    const existing = ws[ref]
    if (existing) {
      existing.z = '@'
      existing.t = 's'
    } else {
      ws[ref] = { t: 's', v: '', z: '@' }
    }
  }
  // 빈 서식 셀까지 포함하도록 시트 범위를 넓혀준다(안 하면 XLSX가 값 없는 셀은
  // range 밖으로 보고 아예 안 써버릴 수 있다).
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:C1')
  range.e.r = Math.max(range.e.r, PRE_FORMATTED_ROWS)
  ws['!ref'] = XLSX.utils.encode_range(range)
  ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 16 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '일괄업로드')

  // cellStyles:true를 안 주면 서식(z:'@')이 실제 xlsx 파일에 안 실린다(SheetJS
  // 기본값은 스타일을 안 씀) — 여기서 빠지면 등록번호 열 텍스트 서식이 통째로 무의미해짐.
  const bytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true }) as ArrayBuffer
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '엑셀 업로드 예시.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}
