/**
 * coContactSvc — 고객 문의(고객센터) 접수 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoInquiryController(POST /api/fo/inquiry/create) — 회원/비회원 모두 허용. 로그인 상태면 토큰을 함께 보낸다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { CmContactSubmitType } from "~/types/cm/cmContactSubmitType";

export const coContactSvc = {
  submit: async (body: CmContactSubmitType): Promise<void> => {
    await axiosCsr.post("/fo/inquiry/create", body, { headers: useAuthHeaders() });
  },
};
