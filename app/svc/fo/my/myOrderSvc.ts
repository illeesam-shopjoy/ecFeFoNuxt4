/**
 * myOrderSvc.ts — 마이페이지 주문 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyPageController(/api/fo/my/order/list|page, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 * 주문 "생성"은 foOrderSvc.createOrder.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { cleanParams } from "~/utils/svcInput";
import type { MyListParams, MyPageResult, MyRow } from "~/types/fo/foMyType";


export const myOrderSvc = {
  /** GET /fo/my/order/list — 내 주문 목록 */
  getList: async (params: MyListParams = {}): Promise<MyRow[]> => (await axiosCsr.get<MyRow[]>("/fo/my/order/list", { headers: useAuthHeaders(), params: cleanParams(params) })).data,

  /** GET /fo/my/order/page — 내 주문 목록(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams): Promise<MyPageResult<MyRow>> =>
    (await axiosCsr.get<MyPageResult<MyRow>>("/fo/my/order/page", { headers: useAuthHeaders(), params: { pageNo: 1, pageSize: 10, ...cleanParams(params) } })).data,
};
