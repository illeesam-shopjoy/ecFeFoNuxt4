import type { PdProdType } from "~/types/pd/pdProdType";

/** 장바구니에 담긴 상품 한 줄 (상품 + 주문 수량) */
export interface OdCartItemType extends PdProdType {
  cartItemId?: number; // 장바구니품목ID
  orderQuantity: number; // 주문 수량
  // 2026-09 추가 — 옵션상품(SKU) 지원: 선택한 옵션조합의 SKU. 무옵션 상품이면 undefined
  // (백엔드가 prodSkuId 없는 주문은 재고차감을 건너뜀).
  selectedProdSkuId?: string;
}
