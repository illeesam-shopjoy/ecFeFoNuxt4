/**
 * myOrderSvc.ts — 내 주문 API 호출 객체 (로그인 필요). ecFeBo foApiSvc.myOrder 이식 (2026-09-19).
 * 폴더 위치(svc/fo/my/)는 BFF 라우트(server/api/fo/my/order/*)를 그대로 따른다.
 *   getList → GET /api/fo/my/order/list  (ecBeBo /fo/my/order/list)
 *   getPage → GET /api/fo/my/order/page  (ecBeBo /fo/my/order/page — 서버 페이징)
 *   create  → POST /api/fo/ec/order/create (ecBeBo /fo/order/create — 주문 생성은 기존 checkout 이 쓰던 라우트를 그대로 사용)
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyPageResult, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myOrderSvc = {
  getList: (params: MyListParams = {}) => $fetch<MyRow[]>("/api/fo/my/order/list", { headers: useAuthHeaders(), query: clean(params) }),
  getPage: (params: MyListParams) => $fetch<MyPageResult<MyRow>>("/api/fo/my/order/page", { headers: useAuthHeaders(), query: clean(params) }),
  create: (body: Record<string, unknown>) => $fetch<unknown>("/api/fo/ec/order/create", { headers: useAuthHeaders(), method: "POST", body }),
};
