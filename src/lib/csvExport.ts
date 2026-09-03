/**
 * 헤더/행 데이터를 CSV 문자열로 만들고 파일로 내려받는다 — 이 프로젝트의 다른 CSV
 * 관련 코드는 없었으므로 새로 작성. 스트림릿 쪽(_to_csv_bytes)이 utf-8-sig(BOM)로
 * 인코딩하는 것과 같은 효과를 내려고 다운로드 시 BOM을 앞에 붙인다(엑셀에서 한글이
 * 깨지지 않게).
 */

/** 값 하나를 CSV 셀로 이스케이프한다(콤마/따옴표/줄바꿈이 있으면 따옴표로 감싸고
 * 내부 따옴표는 두 번 반복). */
function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function buildCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.map(escapeCell).join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h] ?? '')).join(','))
  }
  return lines.join('\r\n')
}

/** IsbnConvert.tsx의 .mrk 다운로드와 같은 Blob/createObjectURL/앵커클릭 패턴.
 * 앞에 BOM(U+FEFF)을 붙여 엑셀에서 열었을 때 한글이 깨지지 않게 한다 — 리터럴 대신
 * 이스케이프로 써서 에디터/린터가 "이상한 공백"으로 오인하지 않게 한다. */
export function downloadCsv(filename: string, csvBody: string): void {
  const BOM = String.fromCharCode(0xfeff)
  const blob = new Blob([BOM + csvBody], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
