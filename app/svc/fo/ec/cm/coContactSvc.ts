/**
 * coContactSvc — 고객 문의(고객센터) 접수 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoInquiryController(POST /api/fo/inquiry/create) — 회원/비회원 모두 허용. 로그인 상태면 토큰을 함께 보낸다.
 */
import { authCfg, csrPost } from "~/utils/svcHttp";
import type { CmContactSubmitType } from "~/types/cm/cmContactSubmitType";
import type { SyContactType } from "~/types/sy/syContactType";

export const coContactSvc = {
  submit: (body: CmContactSubmitType): Promise<void> => csrPost("/fo/inquiry/create", body, authCfg()),
  /**
   * 접수하고 저장된 문의(sy_contact)를 돌려받는다 — 접수번호(contactId)를 화면에 보여줄 때 (2026-10-03, homepg1 문의·주문).
   * ecBeBo FoCmContactController(POST /api/fo/ec/cm/contact). 같은 접수 서비스라 저장·알림은 submit 과 같고, 응답만 감싸지 않은 문의 한 건이다.
   */
  submitReceipt: (body: CmContactSubmitType): Promise<SyContactType> => csrPost<SyContactType>("/fo/ec/cm/contact", body, authCfg()),
};
