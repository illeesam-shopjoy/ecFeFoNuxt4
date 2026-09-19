/**
 * myCouponSvc.ts — 마이페이지 쿠폰 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyPageController(/api/fo/my/coupon/list|page, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyPageResult, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myCouponSvc = {
  /** GET /fo/my/coupon/list — 내 쿠폰 목록 */
  getList: async (params: MyListParams = {}): Promise<MyRow[]> => (await axiosCsr.get<MyRow[]>("/fo/my/coupon/list", { headers: useAuthHeaders(), params: clean(params) })).data,

  /** GET /fo/my/coupon/page — 내 쿠폰 목록(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams): Promise<MyPageResult<MyRow>> =>
    (await axiosCsr.get<MyPageResult<MyRow>>("/fo/my/coupon/page", { headers: useAuthHeaders(), params: { pageNo: 1, pageSize: 10, ...clean(params) } })).data,
};
