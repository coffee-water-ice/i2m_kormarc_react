/**
 * ConvertResult(/api/convert 응답) → HistoryRecord 조립 — IsbnConvert.tsx의
 * handleConvert(단건 수동 변환)와 useBatchUpload.ts(일괄 업로드)가 똑같은 로직을
 * 쓰도록 공용화했다. 원래 handleConvert 안에 있던 코드를 그대로 뽑아낸 것이라
 * 동작은 전혀 안 바뀐다 — 049(소장사항/등록번호)만 옵션으로 추가할 수 있게 했다
 * (수동 변환은 안 넘기면 그대로 없음, 일괄 업로드는 엑셀의 등록구분+등록번호를 넘김).
 */
import type { ConvertResult } from '../types/api'
import type { HistoryRecord } from '../types/history'
import { parseMrkText, applyKdcToFields, applyHoldingsRegToFields, extractTitle, nextUid } from './mrk'

export function buildHistoryRecord(result: ConvertResult, holdingsReg?: string): HistoryRecord {
  const fields = parseMrkText(result.mrk_text ?? '')
  const meta = result.meta ?? {}
  const candidates = meta.kdc_candidates ?? []
  const kdcSelected = candidates[0]?.kdc ?? ''
  // 모델은 강(2자리)까지만 판단한다 — 세목은 빈 칸으로 시작하되(사서가 직접 입력하기
  // 전엔 빈 칸이 자연스럽다는 요청), 실제로 적용되는 056 $a 값은 세목이 비어 있어도
  // '0'을 기본으로 계산한다(pushKdcToFields와 동일한 규칙). 후보가 없으면 그대로 둔다.
  const kdcDetail = ''
  let initialFields = kdcSelected ? applyKdcToFields(fields, `${kdcSelected}${kdcDetail.trim() || '0'}`) : fields
  if (holdingsReg && holdingsReg.trim()) {
    initialFields = applyHoldingsRegToFields(initialFields, holdingsReg)
  }
  return {
    uid: nextUid(),
    isbn: result.isbn,
    title: extractTitle(fields),
    meta,
    fields: initialFields,
    edited: false,
    kdcSelected,
    kdcDetail,
  }
}
