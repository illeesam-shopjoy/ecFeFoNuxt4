/**
 * 주문/결제 화면에서 적용하는 쿠폰 — 내 쿠폰(PmCouponType, ecBeBo /fo/my/coupon)을 utils/mapCoupon.toApplyCoupon 으로 변환한 값.
 * 쿠폰은 종류별(주문/상품/배송비)로 최대 1개씩 적용한다.
 */
export type CouponCategory = "order" | "product" | "shipping";

export type CouponDiscountType = "amount" | "percent" | "free-shipping";

export interface PmCouponApplyType {
  couponId: string;
  category: CouponCategory;
  name: string; // "5,000원 할인 쿠폰"
  desc?: string; // "5만원 이상 구매 시"
  discountType: CouponDiscountType;
  discountValue: number; // amount=원, percent=%, free-shipping=미사용(0)
  minOrderAmt?: number; // 최소 주문금액(상품합계 기준) — 미달이면 선택 불가
  maxDiscountAmt?: number; // 최대 할인한도(정률 쿠폰)
  validFrom?: string; // 유효기간 시작 (yyyy-mm-dd)
  validTo?: string; // 유효기간 종료 (yyyy-mm-dd) — 종료가 빠른 쿠폰을 우선 적용
}

/** category별로 적용된(또는 미적용=null) 쿠폰 */
export type AppliedCoupons = Record<CouponCategory, PmCouponApplyType | null>;
