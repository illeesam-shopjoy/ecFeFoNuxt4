/**
 * myInquirySvc.ts — 마이페이지 1:1 문의 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyPageController(/api/fo/my/inquiry/list|page, FO_ONLY) + FoInquiryController(POST /api/fo/inquiry/create).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { cleanParams } from "~/utils/svcInput";
import { buildInquiryPayload } from "~/utils/mapMy";
import type { MyInquirySubmit, MyListParams, MyPageResult, MyRow } from "~/types/fo/foMyType";


export const myInquirySvc = {
  /** GET /fo/my/inquiry/list — 내 문의 목록 */
  getList: async (params: MyListParams = {}): Promise<MyRow[]> => (await axiosCsr.get<MyRow[]>("/fo/my/inquiry/list", { headers: useAuthHeaders(), params: cleanParams(params) })).data,

  /** GET /fo/my/inquiry/page — 내 문의 목록(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams): Promise<MyPageResult<MyRow>> =>
    (await axiosCsr.get<MyPageResult<MyRow>>("/fo/my/inquiry/page", { headers: useAuthHeaders(), params: { pageNo: 1, pageSize: 10, ...cleanParams(params) } })).data,

  /** POST /fo/inquiry/create — 문의 등록 (이름/이메일/내용 필수). 비로그인도 가능. 검증·본문 조립은 utils/mapMy.ts */
  create: async (body: MyInquirySubmit): Promise<unknown> => (await axiosCsr.post("/fo/inquiry/create", buildInquiryPayload(body), { headers: useAuthHeaders() })).data,
};
