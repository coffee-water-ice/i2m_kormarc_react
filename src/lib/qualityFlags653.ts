/**
 * 653(비통제 주제어) 생성 품질 경고 메타데이터 — core/fields/marc_653.py의
 * _finalize_653이 만드는 flags 원본 코드마다 "화면 문구"·"설명"을 한 곳에 모아둔다.
 * 예전엔 IsbnConvert.tsx 안에 라벨 매핑 하나만 있었는데(사서편집 화면 배너용), 이제
 * Home.tsx(전체 안내표)·IsbnConvert.tsx(⚠️ 아이콘 툴팁·검토 항목 표) 세 군데가 전부
 * 같은 문구를 공유해야 해서 단일 출처로 뽑아냈다(2026-09-10 요청 — "카테고리fallback사용"
 * 문구가 다른 항목과 톤이 안 맞는다는 지적을 계기로, 아예 코드/문구/설명을 한 번에
 * 정리했다).
 *
 * label은 사서편집 화면에 실제로 노출되는 짧은 문구, description은 검토 항목 표·홈
 * 안내표에만 들어가는 좀 더 자세한 설명이다.
 */
export interface Field653FlagMeta {
  code: string
  label: string
  description: string
}

export const FIELD_653_FLAGS: Field653FlagMeta[] = [
  {
    code: 'AI생성부족',
    label: 'AI가 생성한 키워드 자체가 적음',
    description:
      'GPT가 1차로 뽑아낸 원본 키워드 수가 3개 미만일 때 — 필터링 이전 단계부터 이미 재료가 부족했다는 뜻.',
  },
  {
    code: '과다차단',
    label: '금지어·저효용어 필터링으로 절반 넘게 걸러짐',
    description:
      '원본 키워드 중 금지어·저효용어 필터에 걸려 제거된 비율이 50%를 넘었을 때 — AI가 낸 결과의 절반 이상이 못 쓸 키워드였다는 뜻.',
  },
  {
    code: '텍스트fallback사용',
    label: 'AI 키워드가 전부 걸러져 책소개/목차 텍스트에서 대체 추출',
    description:
      'AI 키워드만으로는 부족해서, 책소개·목차 원문 텍스트에서 키워드를 추가로 뽑아 보충하는 백업 로직이 실제로 작동했을 때.',
  },
  {
    code: '카테고리fallback사용',
    label: '텍스트 대체로도 부족해 카테고리 기반 키워드로 추가 보충',
    description:
      '텍스트 대체까지 동원해도 여전히 부족해서, 도서 카테고리(분류) 기반의 정해진 키워드 세트로 마지막 보충이 작동했을 때 — 보충 단계 중 가장 마지막에 해당.',
  },
  {
    code: '키워드부족',
    label: '최종 키워드 수가 기준(5개, 문학/에세이는 3개)에 못 미침',
    description:
      '위 보충 단계를 다 거치고도 최종 키워드 수가 기준치(일반 5개·문학/에세이 3개)에 못 미쳤을 때 — 다른 항목이 "원인"이라면 이건 "그래서 결과가 실제로 부족하다"는 결론.',
  },
]

/** code → label 빠른 조회용. 매핑에 없는 새 flag가 추가돼도 원본 문자열 그대로
 * 보여줄 수 있도록 호출부에서 FIELD_653_FLAG_LABELS[code] ?? code로 폴백한다. */
export const FIELD_653_FLAG_LABELS: Record<string, string> = Object.fromEntries(
  FIELD_653_FLAGS.map((f) => [f.code, f.label]),
)
