/** 주문/결제 금액 계산 결과 (utils/mapCoupon.calcCheckout) */
export interface PmCheckoutCalcType {
  productDiscount: number; // 상품할인쿠폰 할인액
  orderDiscount: number; // 주문할인쿠폰 할인액
  shipDiscount: number; // 배송비할인쿠폰 할인액
  couponTotal: number; // 쿠폰 할인 합계
  cashUse: number; // 사용하는 캐시(보유 캐시 최대 사용 시)
  total: number; // 최종 결제 금액
}
