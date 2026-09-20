/**
 * myCouponSvc.ts — 마이페이지 쿠폰 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/my/coupon/list|page, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { myListApi } from "~/utils/svcHttp";
import type { PmCouponType } from "~/types/pm/pmCouponType";

/** GET /fo/my/coupon/list · /fo/my/coupon/page — 내 쿠폰 목록(전체 / 페이징, 기본 1페이지 10건) */
export const myCouponSvc = myListApi<PmCouponType>("/fo/my/coupon");
