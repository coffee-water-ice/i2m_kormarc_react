/** ms를 "N분 M.M초"(60초 이상일 때만 분을 붙임) / "M.M초"로 표시.
 * 원래 pages/IsbnConvert.tsx에만 있던 것을 평가시스템 페이지와 공유하려고 여기로 옮겼다. */
export function formatElapsed(ms: number): string {
  const totalSec = ms / 1000
  if (totalSec < 60) return `${totalSec.toFixed(1)}초`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec - min * 60
  return `${min}분 ${sec.toFixed(1)}초`
}
