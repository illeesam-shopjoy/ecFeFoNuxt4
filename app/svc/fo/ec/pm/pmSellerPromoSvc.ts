/**
 * pmSellerPromoSvc.ts — 판매자 프로모션(할인·적립금·상품권·쿠폰) API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-10-02 (셀러 Phase 2 · 2C).
 * ecBeBo FoPmSellerPromoController(/api/fo/ec/pm/seller-promo/{discnt|save|voucher|coupon}, FO_ONLY) — 로그인 토큰 필요(authCfg).
 * 승인된(ACTIVE) 판매자의 본인 정책만 다룬다. DELETE 는 물리 삭제가 아니라 종료(비활성) 처리.
 */
import { authCfg, csrDelete, csrGet, csrList, csrPost, csrPut, idPath } from "~/utils/svcHttp";
import type { PmSellerBuyerCouponType, PmSellerPromoKindType, PmSellerPromoSaveType, PmSellerPromoType } from "~/types/pm/pmSellerPromoType";

const BASE = "/fo/ec/pm/seller-promo";

export const pmSellerPromoSvc = {
  /** GET /{kind} — 내 프로모션 목록 */
  list: (kind: PmSellerPromoKindType): Promise<PmSellerPromoType[]> => csrList<PmSellerPromoType>(`${BASE}/${kind}`, authCfg()),

  /** GET /{kind}/{id} — 상세(할인·적립금은 대상 상품 prodIds 포함) */
  get: (kind: PmSellerPromoKindType, id: string): Promise<PmSellerPromoType> => csrGet<PmSellerPromoType>(idPath(`${BASE}/${kind}`, id), authCfg()),

  /** POST /{kind} — 등록 */
  create: (kind: PmSellerPromoKindType, body: PmSellerPromoSaveType): Promise<PmSellerPromoType> => csrPost<PmSellerPromoType>(`${BASE}/${kind}`, body, authCfg()),

  /** PUT /{kind}/{id} — 수정 */
  update: (kind: PmSellerPromoKindType, id: string, body: PmSellerPromoSaveType): Promise<PmSellerPromoType> => csrPut<PmSellerPromoType>(idPath(`${BASE}/${kind}`, id), body, authCfg()),

  /** DELETE /{kind}/{id} — 종료(비활성) 처리 */
  end: (kind: PmSellerPromoKindType, id: string): Promise<void> => csrDelete(idPath(`${BASE}/${kind}`, id), authCfg()),

  // ── 구매자 쪽: 상품 상세의 "쿠폰 받기" ──
  /** GET /fo/ec/pd/prod/{id}/seller-coupons — 이 상품에 쓸 수 있고 지금 받을 수 있는 판매자 쿠폰(공개). 로그인 상태면 내가 받았는지도 온다 */
  getProdCoupons: (prodId: string, loggedIn: boolean): Promise<PmSellerBuyerCouponType[]> => csrList<PmSellerBuyerCouponType>(idPath("/fo/ec/pd/prod", prodId, "/seller-coupons"), loggedIn ? authCfg() : undefined),
  /** POST /fo/ec/pm/coupon/seller/{couponId}/claim — 판매자 쿠폰 받기(로그인 필요, 회원당 1장) */
  claimCoupon: (couponId: string): Promise<void> => csrPost(idPath("/fo/ec/pm/coupon/seller", couponId, "/claim"), undefined, authCfg()),
};
