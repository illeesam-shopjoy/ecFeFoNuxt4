/**
 * coMbMemberSvc.ts — 회원 공용(공개) API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-10-02.
 * ecBeBo CoEcMbMemberController(/api/co/ec/mb/member/page, permitAll) — 로그인 전 "테스트 회원 선택" 모달이 쓴다.
 * 연락처/이메일은 서버가 민감정보 마스킹 규칙으로 가려서 내려준다. tenantModule 은 회원 소속 사이트의 FO 모듈(sy_site.tenant_module).
 */
import { csrGet } from "~/utils/svcHttp";
import { cleanParams } from "~/utils/svcInput";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { MbMemberType } from "~/types/mb/mbMemberType";

/** 회원 페이지 조회 조건 — 서버 MbMemberDto.Request + BaseRequest 필드명 그대로 */
export interface CoMbMemberPageParams {
  pageNo?: number;
  pageSize?: number;
  siteId?: string;
  tenantModule?: string;
  memberStatusCd?: string;
  simulYn?: "Y" | "N";
  dateRangeType?: "reg_date" | "join_date" | "upd_date";
  dateRangeStart?: string;
  dateRangeEnd?: string;
  searchType?: string;
  searchValue?: string;
}

export const coMbMemberSvc = {
  /** GET /co/ec/mb/member/page — 회원 페이지(공개, 마스킹) */
  getMemberPage: (params: CoMbMemberPageParams): Promise<CoBasePageType<MbMemberType>> =>
    csrGet<CoBasePageType<MbMemberType>>("/co/ec/mb/member/page", { params: cleanParams({ pageNo: 1, pageSize: 10, ...params }) }),
};
