/**
 * myClaimSvc.ts — 마이페이지 클레임(취소/반품/교환) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyPageController(/api/fo/my/claim/list|page, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyPageResult, MyRow } from "~/types/fo/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myClaimSvc = {
  /** GET /fo/my/claim/list — 내 클레임 목록 */
  getList: async (params: MyListParams = {}): Promise<MyRow[]> => (await axiosCsr.get<MyRow[]>("/fo/my/claim/list", { headers: useAuthHeaders(), params: clean(params) })).data,

  /** GET /fo/my/claim/page — 내 클레임 목록(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams): Promise<MyPageResult<MyRow>> =>
    (await axiosCsr.get<MyPageResult<MyRow>>("/fo/my/claim/page", { headers: useAuthHeaders(), params: { pageNo: 1, pageSize: 10, ...clean(params) } })).data,
};
