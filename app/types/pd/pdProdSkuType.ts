/** 옵션조합 SKU (2026-09 추가) — 장바구니/주문 시 재고차감 대상을 정확히 지정하기 위해
 * 상품상세 응답의 prodSkus[]를 그대로 통과시킨다. prodOpt1List/prodOpt2List 의 prodOptTypeLevel과
 * prodOpt1Id/prodOpt2Id를 매칭해 사용자가 고른 옵션 조합에 해당하는 SKU를 찾는다. */
export interface PdProdSkuType {
  prodSkuId: string;
  prodOpt1Id?: string | null;
  prodOpt2Id?: string | null;
  skuCode?: string | null;
  addPrice?: number | null;
  stockQty?: number | null;
}
