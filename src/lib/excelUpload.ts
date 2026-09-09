/**
 * "일괄 업로드" 엑셀 파일(엑셀 업로드 예시.xlsx 형식) 파싱 + 행별 검증.
 * BatchUploadModal이 파일을 받으면 이 모듈로 넘겨서 표(미리보기)에 그대로 뿌릴
 * {rows, issues}를 얻는다 — 실제로 건너뛸지 말지는 여기서 결정하지 않고(표시만
 * 담당), useBatchUpload.start()에 넘기기 직전에 모달이 유효한 행만 걸러낸다.
 */
import * as XLSX from 'xlsx'
import { UPLOAD_COLUMNS, MAX_BATCH_SIZE } from './batchConfig'

export interface UploadRow {
  no: number // 엑셀 상의 실제 행 번호(헤더가 1행이므로 데이터는 2행부터) — 오류 위치 안내용
  regMark: string
  regNo: string
  isbn: string // 정제된 ISBN(숫자/X만, 10·13자리 검사 통과분은 그대로, 실패해도 정제는 해서 보여줌)
  isbnRaw: string // 정제 전 원본 — 형식 오류 메시지에 원본을 보여주기 위해 별도 보관
}

export interface RowIssue {
  no: number
  reason: string
}

export interface ParseUploadResult {
  rows: UploadRow[]
  issues: RowIssue[]
}

function cleanIsbn(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^0-9X]/g, '')
}

function findColumnIndex(headerRow: string[], name: string): number {
  return headerRow.findIndex((h) => h.trim() === name)
}

/** File(브라우저 File 객체) → 파싱 결과. 셀의 원시값(raw:false 안 쓰면 숫자로 잘못
 * 해석될 수 있는 값)이 아니라 표시 문자열을 우선 쓴다(raw:false) — 엑셀이 등록번호를
 * 숫자로 인식해버린 파일이 업로드되더라도, 서식이 텍스트("@")로 걸려있었다면 표시
 * 문자열 자체가 원본 그대로다. 서식까지 깨져서 순수 숫자로 저장된 파일(엑셀에서 직접
 * 만들어 앞자리 0을 이미 잃어버린 경우)까지는 복구할 수 없다 — 그건 예시 파일을
 * 그대로 써야 하는 이유를 안내 문구에서 설명한다. */
export async function parseUploadFile(file: File): Promise<ParseUploadResult> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return { rows: [], issues: [{ no: 0, reason: '시트를 찾을 수 없습니다.' }] }

  const grid = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' })
  if (grid.length === 0) return { rows: [], issues: [{ no: 0, reason: '빈 파일입니다.' }] }

  const headerRow = (grid[0] ?? []).map((h) => String(h ?? ''))
  const idxRegMark = findColumnIndex(headerRow, UPLOAD_COLUMNS.regMark)
  const idxRegNo = findColumnIndex(headerRow, UPLOAD_COLUMNS.regNo)
  const idxIsbn = findColumnIndex(headerRow, UPLOAD_COLUMNS.isbn)
  if (idxRegMark === -1 || idxRegNo === -1 || idxIsbn === -1) {
    return {
      rows: [],
      issues: [
        {
          no: 1,
          reason: `헤더가 "${UPLOAD_COLUMNS.regMark}", "${UPLOAD_COLUMNS.regNo}", "${UPLOAD_COLUMNS.isbn}"인지 확인해주세요 — "예시 파일 다운로드"로 받은 형식과 같아야 해요.`,
        },
      ],
    }
  }

  const rows: UploadRow[] = []
  for (let i = 1; i < grid.length; i++) {
    const line = grid[i] ?? []
    const regMark = String(line[idxRegMark] ?? '').trim()
    const regNo = String(line[idxRegNo] ?? '').trim()
    const isbnRaw = String(line[idxIsbn] ?? '').trim()
    if (!regMark && !regNo && !isbnRaw) continue // 완전히 빈 행은 조용히 건너뜀(꼬리 빈 행 등)
    rows.push({ no: i + 1, regMark, regNo, isbn: cleanIsbn(isbnRaw), isbnRaw })
  }

  const issues: RowIssue[] = []
  const seenIsbn = new Map<string, number>() // isbn -> 처음 등장한 행 번호
  rows.forEach((row, idx) => {
    if (!row.regMark) issues.push({ no: row.no, reason: '등록구분이 비어 있어요.' })
    if (!row.regNo) issues.push({ no: row.no, reason: '등록번호가 비어 있어요.' })
    if (!row.isbnRaw) {
      issues.push({ no: row.no, reason: 'ISBN이 비어 있어요.' })
    } else if (row.isbn.length !== 10 && row.isbn.length !== 13) {
      issues.push({ no: row.no, reason: `ISBN 형식이 올바르지 않아요: "${row.isbnRaw}"(10자리 또는 13자리여야 함)` })
    } else {
      const firstNo = seenIsbn.get(row.isbn)
      if (firstNo !== undefined) {
        issues.push({ no: row.no, reason: `${firstNo}행과 ISBN이 중복돼요: ${row.isbn}` })
      } else {
        seenIsbn.set(row.isbn, row.no)
      }
    }
    if (idx >= MAX_BATCH_SIZE) {
      issues.push({ no: row.no, reason: `한 번에 최대 ${MAX_BATCH_SIZE}건까지만 처리할 수 있어요 — 이 행은 제외됩니다.` })
    }
  })

  return { rows, issues }
}

/** issues 목록에서 특정 행이 문제 있는 행인지 판단(표 렌더링용 헬퍼). */
export function rowHasIssue(issues: RowIssue[], no: number): boolean {
  return issues.some((i) => i.no === no)
}

/** 실제로 실행에 넘길 "유효한" 행만 골라낸다 — issues에 하나도 안 걸린 행만. */
export function validRowsOnly(rows: UploadRow[], issues: RowIssue[]): UploadRow[] {
  const badNos = new Set(issues.map((i) => i.no))
  return rows.filter((r) => !badNos.has(r.no))
}
