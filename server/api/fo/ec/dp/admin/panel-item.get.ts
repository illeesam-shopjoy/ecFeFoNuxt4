import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeDpPanelItem } from "../area/[areaCd].get";

/**
 * 전시패널관리(어드민) — 패널항목 목록. ecBeBo GET /api/fo/ec/dp/admin/panel-item 프록시(FO_ONLY).
 * query.panelId 로 특정 패널의 항목만 조회.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const list = await beApi.get<BeDpPanelItem[]>(
    "/fo/ec/dp/admin/panel-item",
    { panelId: query.panelId || undefined },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url, "list size=" + (list?.length ?? 0));
  return list ?? [];
});
