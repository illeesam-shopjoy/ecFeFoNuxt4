/** 주문 한 줄 (상품 + 수량 + 소계) */
export interface OrOrderItemType {
  orderItemId: number; // 주문품목ID
  productId: string; // 상품ID (ecBeBo prodId)
  title: string; // 상품명
  price: number; // 단가
  orderQuantity: number; // 주문 수량
  subtotal: number; // 소계
}
