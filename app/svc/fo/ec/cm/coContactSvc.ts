/**
 * coContactSvc — 고객 문의(고객센터) 접수 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoInquiryController(POST /api/fo/inquiry/create) — 회원/비회원 모두 허용. 로그인 상태면 토큰을 함께 보낸다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";

export interface ContactSubmitBody {
  inquiryType?: string;
  name: string;
  email: string;
  tel?: string;
  orderNo?: string;
  /** 문의 내용(HTML) — 서버 최대 4000자 */
  message: string;
  blogAuthor?: string;
  /** 첨부 변경 목록: 이번에 올린 파일은 { attachId, rowStatus: 'I' } */
  attachFiles?: { attachId: string; rowStatus: "I" | "D" }[];
}

export const coContactSvc = {
  submit: async (body: ContactSubmitBody): Promise<void> => {
    await axiosCsr.post("/fo/inquiry/create", body, { headers: useAuthHeaders() });
  },
};
