/**
 * prodCouponSvc.ts — 상품쿠폰(상품 교환권) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPmProdCouponController(/api/fo/ec/pm/prod-coupon). preview 만 공개, 나머지는 로그인 토큰 필요(authCfg).
 */
import { authCfg, csrGet, csrPost } from "~/utils/svcHttp";
import type { PmProdCouponGiftOrderType, PmProdCouponGiftReqType, PmProdCouponRedeemReqType, PmProdCouponType } from "~/types/pm/pmProdCouponType";

const BASE = "/fo/ec/pm/prod-coupon";
const enc = encodeURIComponent;

export const prodCouponSvc = {
  /** GET /preview/{code} — 코드로 쿠폰 확인(공개, 선물 링크 화면) */
  preview: (code: string): Promise<PmProdCouponType> => csrGet<PmProdCouponType>(`${BASE}/preview/${enc(code)}`),

  /** POST /gift-order — 선물 결제 대기 주문 생성(금액은 서버 계산). 응답의 orderId 로 결제창을 연다 */
  giftOrder: (body: PmProdCouponGiftReqType): Promise<PmProdCouponGiftOrderType> => csrPost<PmProdCouponGiftOrderType>(`${BASE}/gift-order`, body, authCfg()),

  /** POST /claim/{code} — 내 쿠폰으로 받기 */
  claim: (code: string): Promise<PmProdCouponType> => csrPost<PmProdCouponType>(`${BASE}/claim/${enc(code)}`, {}, authCfg()),

  /** GET /mine — 내 상품쿠폰(받은/보낸) */
  mine: (): Promise<{ received: PmProdCouponType[]; sent: PmProdCouponType[] }> => csrGet<{ received: PmProdCouponType[]; sent: PmProdCouponType[] }>(`${BASE}/mine`, authCfg()),

  /** GET /usable-count — 지금 쓸 수 있는 쿠폰 수 */
  usableCount: (): Promise<number> => csrGet<{ count?: number }>(`${BASE}/usable-count`, authCfg()).then((r) => r?.count ?? 0),

  /** POST /redeem — 쿠폰으로 0원 주문(재고 차감) */
  redeem: (body: PmProdCouponRedeemReqType): Promise<{ orderId: string; prodCoupon: PmProdCouponType }> => csrPost<{ orderId: string; prodCoupon: PmProdCouponType }>(`${BASE}/redeem`, body, authCfg()),
};
