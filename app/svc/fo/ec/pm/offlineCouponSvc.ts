/**
 * offlineCouponSvc.ts — 오프라인 쿠폰(무료등록쿠폰) 신규등록 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPmCouponOfflineController(/api/fo/ec/pm/coupon/offline) — 로그인 필요.
 */
import { csrGet, csrPost } from "~/utils/svcHttp";

export interface OfflineCouponItemType {
  couponId: string;
  couponCd: string;
  couponNm: string;
  couponTypeCd: string;
  couponTypeCdNm: string;
  applyScopeCd: string;
  discountRate: number | null;
  discountAmt: number | null;
  issueLimit: number | null;
  issueCnt: number | null;
  remaining: number; // 2147483647(Integer.MAX_VALUE)이면 무제한
  claimedByMe: boolean;
}

const BASE = "/fo/ec/pm/coupon/offline";

export const offlineCouponSvc = {
  /** GET .../available — 오프라인 쿠폰 전체 목록(등록/소진 상태 포함) */
  getAvailable: (): Promise<OfflineCouponItemType[]> => csrGet<OfflineCouponItemType[]>(`${BASE}/available`),

  /** POST .../claim — 코드로 등록. 실패 시 err.message 가 "이미 등록하신 쿠폰입니다." 등 사유 문구 */
  claim: (couponCd: string): Promise<OfflineCouponItemType> => csrPost<OfflineCouponItemType>(`${BASE}/claim`, { couponCd }),
};
