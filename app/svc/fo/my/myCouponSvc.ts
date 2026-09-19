/**
 * myCouponSvc.ts — 내 쿠폰 API 호출 객체 (로그인 필요). ecFeBo foApiSvc.myCoupon 이식 (2026-09-19).
 *   getList → GET /api/fo/my/coupon/list  (ecBeBo /fo/my/coupon/list)
 *   getPage → GET /api/fo/my/coupon/page  (ecBeBo /fo/my/coupon/page — 서버 페이징)
 * 쿠폰 코드 등록 API 는 ecBeBo FO 쪽에 없다(ecFeBo 화면도 입력칸만 있음).
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyPageResult, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myCouponSvc = {
  getList: (params: MyListParams = {}) => $fetch<MyRow[]>("/api/fo/my/coupon/list", { headers: useAuthHeaders(), query: clean(params) }),
  getPage: (params: MyListParams) => $fetch<MyPageResult<MyRow>>("/api/fo/my/coupon/page", { headers: useAuthHeaders(), query: clean(params) }),
};
