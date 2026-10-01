/**
 * 판매자 프로모션(할인·적립금·상품권) — ecBeBo FoPmSellerPromoController(/api/fo/ec/pm/seller-promo) 계약. 2026-10-02 (셀러 Phase 2 · 2C).
 * 세 종류가 같은 모양을 쓴다. 판매자(sellerId)·사이트·분담율은 서버가 정한다.
 */
export type PmSellerPromoKindType = "discnt" | "save" | "voucher";

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
  prodIds?: string[]; // 할인·적립금 대상 상품(내 상품만)
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
}
