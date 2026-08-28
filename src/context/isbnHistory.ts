import { useOutletContext } from 'react-router-dom'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { HistoryRecord } from '../types/history'

export interface IsbnHistoryContextValue {
  history: HistoryRecord[]
  setHistory: Dispatch<SetStateAction<HistoryRecord[]>>
  currentUid: number | null
  setCurrentUid: Dispatch<SetStateAction<number | null>>
  /**
   * ISBN 변환 페이지가 "사서 편집" 초안에 저장 안 한 변경사항이 있는지 여기 채워 넣는다
   * — App.tsx의 사이드바가 다른 변환 내역으로 전환하기 직전에 확인창을 띄울지 판단하는
   * 용도. ref라서 값을 갱신해도 그 자체로는 리렌더를 유발하지 않는다(App.tsx는 클릭
   * 시점에만 한 번 읽는다).
   */
  dirtyRef: MutableRefObject<boolean>
}

/**
 * ISBN 변환 페이지(pages/IsbnConvert.tsx)가 App.tsx(전역 사이드바)와 변환 내역
 * 상태를 공유하기 위한 훅. 사이드바의 "ISBN 변환" 항목에 붙은 토글 드롭다운이
 * 같은 상태를 보여줘야 해서 App.tsx가 상태를 소유하고, <Outlet context={...}/>로
 * 내려준 값을 이 훅으로 읽고 쓴다.
 */
export function useIsbnHistory() {
  return useOutletContext<IsbnHistoryContextValue>()
}
