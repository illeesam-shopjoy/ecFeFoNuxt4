/**
 * myCashSvc.ts — 내 캐쉬(적립금) API 호출 객체 (로그인 필요). ecFeBo foApiSvc.myCash 이식 (2026-09-19).
 *   getInfo → GET /api/fo/my/cash/info  (ecBeBo /fo/my/cash/info — 잔액 + 전체 이력)
 *   getPage → GET /api/fo/my/cash/page  (ecBeBo /fo/my/cash/page — 잔액 + 이력 서버 페이징)
 * 캐쉬 충전 API 는 ecBeBo FO 쪽에 없다(ecFeBo 화면도 입력칸만 있음).
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyCashResult, MyListParams, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myCashSvc = {
  getInfo: (params: MyListParams = {}) => $fetch<{ balance: number; history: MyRow[] }>("/api/fo/my/cash/info", { headers: useAuthHeaders(), query: clean(params) }),
  getPage: (params: MyListParams) => $fetch<MyCashResult>("/api/fo/my/cash/page", { headers: useAuthHeaders(), query: clean(params) }),
};
