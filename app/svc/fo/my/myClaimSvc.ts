/**
 * myClaimSvc.ts — 마이페이지 클레임(취소/반품/교환) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/my/claim/list|page) + FoOdClaimController(/api/fo/my/claim preview/create/{id}/withdraw), FO_ONLY — 로그인 토큰 필요(authCfg).
 * 2026-10-03 클레임-부분환불 계약(z0docs/정책서/ec/od/od.13.클레임-부분환불.impl-2026-10-03.md §2) — preview/create/getById/withdraw 추가.
 */
import { authCfg, csrGet, csrPost, idPath, myListApi } from "~/utils/svcHttp";
import type { OdClaimType } from "~/types/od/odClaimType";
import type { OdClaimReqType } from "~/types/od/odClaimReqType";

const BASE = "/fo/my/claim";

export const myClaimSvc = {
  /** GET /fo/my/claim/list · /fo/my/claim/page — 내 클레임 목록(전체 / 페이징, 기본 1페이지 10건). Item 에 claimItemCnt/claimQtySum 요약 포함 */
  ...myListApi<OdClaimType>(BASE),

  /** POST /fo/my/claim/preview — 금액 미리보기(저장 안 함). 응답 = 계산된 금액 필드 + claimItems */
  preview: (body: OdClaimReqType): Promise<OdClaimType> => csrPost<OdClaimType>(`${BASE}/preview`, body, authCfg()),

  /** POST /fo/my/claim — 클레임 신청(REQUESTED) → OdClaimDto.Item(+claimItems, 계산된 금액) 201 */
  create: (body: OdClaimReqType): Promise<OdClaimType> => csrPost<OdClaimType>(BASE, body, authCfg()),

  /** GET /fo/my/claim/{claimId} — 내 클레임 상세(+claimItems, refunds) */
  getById: (claimId: string): Promise<OdClaimType> => csrGet<OdClaimType>(idPath(BASE, claimId), authCfg()),

  /** POST /fo/my/claim/{claimId}/withdraw — 고객 철회 → CANCELLED (REQUESTED/APPROVED 에서만) */
  withdraw: (claimId: string): Promise<OdClaimType> => csrPost<OdClaimType>(idPath(BASE, claimId, "/withdraw"), undefined, authCfg()),
};
