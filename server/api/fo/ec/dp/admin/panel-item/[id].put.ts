import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeDpPanelItem } from "../../area/[areaCd].get";

/** 전시패널관리(어드민) — 패널항목 수정. ecBeBo PUT /api/fo/ec/dp/admin/panel-item/{id} 프록시(FO_ONLY). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id") ?? "";
  const body = await readBody(event);
  const updated = await beApi.put<BeDpPanelItem>(`/fo/ec/dp/admin/panel-item/${encodeURIComponent(id)}`, body, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "panelItemId=" + updated?.panelItemId);
  return updated;
});
