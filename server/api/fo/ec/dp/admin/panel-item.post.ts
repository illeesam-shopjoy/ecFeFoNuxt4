import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeDpPanelItem } from "../area/[areaCd].get";

/** 전시패널관리(어드민) — 패널항목 등록. ecBeBo POST /api/fo/ec/dp/admin/panel-item 프록시(FO_ONLY). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody(event);
  const created = await beApi.post<BeDpPanelItem>("/fo/ec/dp/admin/panel-item", body, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "panelItemId=" + created?.panelItemId);
  return created;
});
