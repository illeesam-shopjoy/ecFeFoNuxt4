/**
 * myInquirySvc.ts — 마이페이지 1:1 문의 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/my/inquiry/list|page, FO_ONLY) + FoInquiryController(POST /api/fo/inquiry/create).
 */
import { authCfg, csrPost, myListApi } from "~/utils/svcHttp";
import { buildInquiryPayload } from "~/utils/mapMy";
import type { CmContactSubmitType } from "~/types/cm/cmContactSubmitType";
import type { SyContactType } from "~/types/sy/syContactType";

export const myInquirySvc = {
  /** GET /fo/my/inquiry/list · /fo/my/inquiry/page — 내 문의 목록(전체 / 페이징, 기본 1페이지 10건) */
  ...myListApi<SyContactType>("/fo/my/inquiry"),

  /** POST /fo/inquiry/create — 문의 등록 (이름/이메일/내용 필수). 비로그인도 가능. 검증·본문 조립은 utils/mapMy.ts */
  create: (body: CmContactSubmitType): Promise<unknown> => csrPost("/fo/inquiry/create", buildInquiryPayload(body), authCfg()),
};
