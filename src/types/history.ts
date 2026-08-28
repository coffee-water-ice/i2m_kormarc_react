import type { ConvertMeta } from './api'
import type { MrkField } from './mrk'

/**
 * ISBN 변환 페이지의 변환 내역 한 건.
 *
 * 상태 자체는 전역 사이드바(App.tsx)가 들고 있다 — "ISBN 변환" 네비 항목의 토글
 * 드롭다운이 이 목록을 보여줘야 해서(요구사항: 오른쪽 편집 카드/분류 패널 폭을
 * 침범하지 않는 자리인 왼쪽 사이드바에 둔다), ISBN 변환 페이지(pages/IsbnConvert.tsx)는
 * react-router의 Outlet context(context/isbnHistory.ts)로 이를 읽고 쓴다.
 */
export interface HistoryRecord {
  uid: number
  isbn: string
  title: string
  meta: ConvertMeta
  fields: MrkField[]
  edited: boolean
  kdcSelected: string
  kdcDetail: string
}
