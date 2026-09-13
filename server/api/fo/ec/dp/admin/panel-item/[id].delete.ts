import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 전시패널관리(어드민) — 패널항목 삭제. ecBeBo DELETE /api/fo/ec/dp/admin/panel-item/{id} 프록시(FO_ONLY). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id") ?? "";
  await beApi.delete<void>(`/fo/ec/dp/admin/panel-item/${encodeURIComponent(id)}`, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "deleted panelItemId=" + id);
  return { success: true };
});
