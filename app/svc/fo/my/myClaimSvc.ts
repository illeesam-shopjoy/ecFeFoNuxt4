/**
 * myClaimSvc.ts — 내 클레임(취소/반품/교환) API 호출 객체 (로그인 필요). ecFeBo foApiSvc.myClaim 이식 (2026-09-19).
 *   getList → GET /api/fo/my/claim/list   (ecBeBo /fo/my/claim/list)
 *   getPage → GET /api/fo/my/claim/page   (ecBeBo /fo/my/claim/page — 서버 페이징, claimTypeCd: CANCEL|RETURN|EXCHANGE)
 * 클레임 신청/취소 API 는 ecBeBo FO 쪽에 없다(ecFeBo 도 화면 상태만 바꿈).
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyPageResult, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myClaimSvc = {
  getList: (params: MyListParams = {}) => $fetch<MyRow[]>("/api/fo/my/claim/list", { headers: useAuthHeaders(), query: clean(params) }),
  getPage: (params: MyListParams) => $fetch<MyPageResult<MyRow>>("/api/fo/my/claim/page", { headers: useAuthHeaders(), query: clean(params) }),
};
