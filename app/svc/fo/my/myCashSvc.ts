/**
 * myCashSvc.ts — 마이페이지 캐시(적립금) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/my/cash/info|page, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { authCfg, csrGet } from "~/utils/svcHttp";
import { cleanParams } from "~/utils/svcInput";
import type { MyListParams } from "~/types/fo/foMyType";
import type { PmCacheInfoResType, PmCachePageResType } from "~/types/pm/pmCacheResType";

export const myCashSvc = {
  /** GET /fo/my/cash/info — 잔액 + 최근 이력 */
  getInfo: (params: MyListParams = {}): Promise<PmCacheInfoResType> => csrGet<PmCacheInfoResType>("/fo/my/cash/info", authCfg({ params: cleanParams(params) })),

  /** GET /fo/my/cash/page — 캐시 이력(페이징, 기본 1페이지 10건) */
  getPage: (params: MyListParams): Promise<PmCachePageResType> =>
    csrGet<PmCachePageResType>("/fo/my/cash/page", authCfg({ params: { pageNo: 1, pageSize: 10, ...cleanParams(params) } })),
};
