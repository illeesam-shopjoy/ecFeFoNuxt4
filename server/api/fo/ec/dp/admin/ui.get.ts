import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

export interface BeDpUi {
  uiId: string;
  siteId: string;
  uiCd: string;
  uiNm: string;
  useYn?: string | null;
}

/** 전시패널관리(어드민) — UI 목록. ecBeBo GET /api/fo/ec/dp/admin/ui 프록시(FO_ONLY). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const list = await beApi.get<BeDpUi[]>("/fo/ec/dp/admin/ui", {}, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "list size=" + (list?.length ?? 0));
  return list ?? [];
});
