/**
 * 판매자 프로모션(할인·적립금·상품권·쿠폰) — ecBeBo FoPmSellerPromoController(/api/fo/ec/pm/seller-promo) 계약. 2026-10-02 (셀러 Phase 2 · 2C).
 * 세 종류가 같은 모양을 쓴다. 판매자(sellerId)·사이트·분담율은 서버가 정한다.
 */
export type PmSellerPromoKindType = "discnt" | "save" | "voucher" | "coupon";

/** 응답 한 건 — 상세 조회에서만 prodIds 가 채워진다 */
export interface PmSellerPromoType {
  id: string;
  nm: string;
  valTypeCd?: string; // 할인: RATE/AMOUNT, 적립금: % / KRW(단위), 상품권: AMOUNT/RATE
  value?: number;
  minOrderAmt?: number;
  maxDiscntAmt?: number;
  startDate?: string; // yyyy-MM-dd (할인·적립금)
  endDate?: string;
  expireMonth?: number; // 상품권 유효기간(개월)
  statusCd?: string; // ACTIVE / INACTIVE
  desc?: string;
  prodIds?: string[]; // 할인·적립금·쿠폰 대상 상품(내 상품만)
  issueLimit?: number | null; // 쿠폰: 총 발급 수량(없으면 제한 없음)
  issueCnt?: number; // 쿠폰: 지금까지 받아 간 수
}

/** 구매자에게 보여 주는 판매자 쿠폰 — 상품 상세의 "쿠폰 받기" (GET /fo/ec/pd/prod/{id}/seller-coupons) */
export interface PmSellerBuyerCouponType {
  couponId: string;
  couponNm: string;
  valTypeCd: "RATE" | "AMOUNT";
  value: number;
  minOrderAmt?: number | null;
  maxDiscntAmt?: number | null;
  endDate?: string | null; // 이 날까지 받고 쓸 수 있다
  remaining?: number | null; // 남은 수량(없으면 제한 없음)
  claimedByMe: boolean;
}

/** POST/PUT 본문 */
export interface PmSellerPromoSaveType {
  nm: string;
  valTypeCd: string;
  value: number;
  minOrderAmt?: number;
  maxDiscntAmt?: number;
  startDate?: string;
  endDate?: string;
  expireMonth?: number;
  statusCd?: "ACTIVE" | "INACTIVE";
  desc?: string;
  prodIds?: string[];
  issueLimit?: number; // 쿠폰: 총 발급 수량(생략하면 제한 없음)
}
