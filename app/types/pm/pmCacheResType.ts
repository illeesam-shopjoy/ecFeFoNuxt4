import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { PmCacheType } from "~/types/pm/pmCacheType";

/** GET /fo/my/cash/page — 잔액 + 이력(서버 페이징) */
export interface PmCachePageResType {
  balance: number;
  history: CoBasePageType<PmCacheType>;
}

/** GET /fo/my/cash/info — 잔액 + 최근 이력 */
export interface PmCacheInfoResType {
  balance: number;
  history: PmCacheType[];
}
