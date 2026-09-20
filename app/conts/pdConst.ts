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

/** 상품유형 코드 → 표시명. 모르는 코드는 코드값 그대로, 없으면 빈 문자열. */
export function prodTypeLabel(code?: string | null): string {
  if (!code) return "";
  return PROD_TYPE_LABEL[code] ?? code;
}
