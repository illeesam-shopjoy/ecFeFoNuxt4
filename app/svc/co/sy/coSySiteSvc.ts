/**
 * coSySiteSvc.ts — 사이트 공용(공개) API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-10-02.
 * ecBeBo CoSySiteController(/api/co/sy/site, permitAll). 멀티테넌트: 각 사이트의 FO 모듈(tenantModule, sy_site.tenant_module)도 함께 온다.
 */
import { csrList } from "~/utils/svcHttp";
import type { SySiteType } from "~/types/sy/sySiteType";

export const coSySiteSvc = {
  /** GET /co/sy/site?status=ACTIVE — 사용 중 사이트 전체 */
  getActiveSites: (): Promise<SySiteType[]> => csrList<SySiteType>("/co/sy/site", { params: { status: "ACTIVE" } }),
};
