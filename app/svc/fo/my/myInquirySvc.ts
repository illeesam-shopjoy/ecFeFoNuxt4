/**
 * myInquirySvc.ts — 마이페이지 1:1 문의 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyPageController(/api/fo/my/inquiry/list|page, FO_ONLY) + FoInquiryController(POST /api/fo/inquiry/create).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyInquirySubmit, MyListParams, MyPageResult, MyRow } from "~/types/fo/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myInquirySvc = {
  /** GET /fo/my/inquiry/list — 내 문의 목록 */
  getList: async (params: MyListParams = {}): Promise<MyRow[]> => (await axiosCsr.get<MyRow[]>("/fo/my/inquiry/list", { headers: useAuthHeaders(), params: clean(params) })).data,

  /** GET /fo/my/inquiry/page — 내 문의 목록(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams): Promise<MyPageResult<MyRow>> =>
    (await axiosCsr.get<MyPageResult<MyRow>>("/fo/my/inquiry/page", { headers: useAuthHeaders(), params: { pageNo: 1, pageSize: 10, ...clean(params) } })).data,

  /** POST /fo/inquiry/create — 문의 등록 (이름/이메일/내용 필수). 비로그인도 가능 */
  create: async (body: MyInquirySubmit): Promise<unknown> => {
    const b = body as unknown as Record<string, unknown>;
    const name = String(b.name ?? "").trim();
    const email = String(b.email ?? "").trim();
    const message = String(b.message ?? "").trim();
    if (!name || !email || !message) {
      const msg = "이름, 이메일, 문의 내용을 모두 입력해 주세요.";
      throw Object.assign(new Error(msg), { statusCode: 400, statusMessage: msg, data: { message: msg, statusMessage: msg } });
    }
    const payload = {
      inquiryType: String(b.inquiryType ?? "").trim(),
      name,
      email,
      tel: String(b.tel ?? "").trim(),
      orderNo: String(b.orderNo ?? "").trim(),
      message,
    };
    return (await axiosCsr.post("/fo/inquiry/create", payload, { headers: useAuthHeaders() })).data;
  },
};
