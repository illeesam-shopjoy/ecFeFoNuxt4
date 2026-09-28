/**
 * pdConst.ts — 상품(pd_prod) 관련 표시용 상수.
 * Nuxt/Vue 전용 import 를 섞지 말 것(순수 상수 파일).
 */

/** 상품유형 코드(PROD_TYPE_CD) → 표시명. ecBeBo PdProdDto: {SINGLE:단품, OPTION:옵션상품, GROUP:묶음상품, SET:세트상품, GIFT:사은품} */
export const PROD_TYPE_LABEL: Record<string, string> = {
  SINGLE: "단품",
  OPTION: "옵션상품",
  GROUP: "묶음상품",
  SET: "세트상품",
  GIFT: "사은품",
};

/** 상품유형 코드 → 표시명. 모르는 코드는 코드값 그대로.
 * 2026-09-29(요청사항: "상품유형이 없는게 600여개 인거 같아 default 기본 상품으로라도 해주면 좋겠어") —
 * 실 데이터 상 prodTypeCd가 비어 있는 상품이 대다수라 목록에서 유형 뱃지가 거의 안 보였다.
 * 코드가 없으면 빈 문자열 대신 "기본 상품"을 돌려줘 뱃지가 항상 표시되게 한다(호출부는 모두
 * v-if="prodTypeLabel(...)"로 뱃지 노출 여부를 판단하므로 이 변경만으로 전 화면에 적용됨). */
export function prodTypeLabel(code?: string | null): string {
  if (!code) return "기본 상품";
  return PROD_TYPE_LABEL[code] ?? code;
}
