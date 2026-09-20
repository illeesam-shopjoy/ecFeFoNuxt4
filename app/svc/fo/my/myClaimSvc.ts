/**
 * myClaimSvc.ts — 마이페이지 클레임(취소/반품/교환) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/my/claim/list|page, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { myListApi } from "~/utils/svcHttp";
import type { OdClaimType } from "~/types/od/odClaimType";

/** GET /fo/my/claim/list · /fo/my/claim/page — 내 클레임 목록(전체 / 페이징, 기본 1페이지 10건) */
export const myClaimSvc = myListApi<OdClaimType>("/fo/my/claim");
