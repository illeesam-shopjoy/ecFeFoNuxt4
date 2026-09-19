/**
 * myCashSvc.ts — 마이페이지 캐시(적립금) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyPageController(/api/fo/my/cash/info|page, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyCashResult, MyListParams, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myCashSvc = {
  /** GET /fo/my/cash/info — 잔액 + 최근 이력 */
  getInfo: async (params: MyListParams = {}): Promise<{ balance: number; history: MyRow[] }> =>
    (await axiosCsr.get<{ balance: number; history: MyRow[] }>("/fo/my/cash/info", { headers: useAuthHeaders(), params: clean(params) })).data,

  /** GET /fo/my/cash/page — 캐시 이력(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams): Promise<MyCashResult> =>
    (await axiosCsr.get<MyCashResult>("/fo/my/cash/page", { headers: useAuthHeaders(), params: { pageNo: 1, pageSize: 10, ...clean(params) } })).data,
};
