/**
 * 쿠폰 타입 — 2026-09-14(요청사항: "주문할인쿠폰 상품할인쿠폰 배송비할인쿠폰 선택하여
 * 적용할 수 있게 모달연결해주고"). ecBeBo에 쿠폰 API/테이블이 아직 없어(브랜드/카테고리 등과
 * 달리 DB 조회 근거가 없음) CouponModal.vue 안에 하드코딩된 목록을 그대로 쓰는 클라이언트
 * 전용 목업 — 실 쿠폰 API가 생기면 이 타입/목록을 서버 응답으로 교체하면 됨.
 */
export type CouponCategory = "order" | "product" | "shipping";

export type CouponDiscountType = "amount" | "percent" | "free-shipping";

export interface PmCouponType {
  couponId: string;
  category: CouponCategory;
  name: string; // "5,000원 할인 쿠폰"
  desc?: string; // "5만원 이상 구매 시"
  discountType: CouponDiscountType;
  discountValue: number; // amount=원, percent=%, free-shipping=미사용(0)
}

/** category별로 적용된(또는 미적용=null) 쿠폰 */
export type AppliedCoupons = Record<CouponCategory, PmCouponType | null>;
