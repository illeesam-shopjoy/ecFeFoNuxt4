/**
 * myInquirySvc.ts — 내 문의 API 호출 객체. ecFeBo foApiSvc.myInquiry 이식 (2026-09-19).
 *   getList → GET  /api/fo/my/inquiry/list   (ecBeBo /fo/my/inquiry/list, 로그인 필요)
 *   getPage → GET  /api/fo/my/inquiry/page   (ecBeBo /fo/my/inquiry/page — 서버 페이징, 로그인 필요)
 *   create  → POST /api/fo/inquiry/create    (ecBeBo /fo/inquiry/create — 문의 등록, 비로그인도 가능)
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyInquirySubmit, MyListParams, MyPageResult, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myInquirySvc = {
  getList: (params: MyListParams = {}) => $fetch<MyRow[]>("/api/fo/my/inquiry/list", { headers: useAuthHeaders(), query: clean(params) }),
  getPage: (params: MyListParams) => $fetch<MyPageResult<MyRow>>("/api/fo/my/inquiry/page", { headers: useAuthHeaders(), query: clean(params) }),
  create: (body: MyInquirySubmit) => $fetch<unknown>("/api/fo/inquiry/create", { headers: useAuthHeaders(), method: "POST", body }),
};
