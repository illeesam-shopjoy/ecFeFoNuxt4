import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeDpPanel } from "./panel.get";

/** 전시패널관리(어드민) — 패널 등록. ecBeBo POST /api/fo/ec/dp/admin/panel 프록시(FO_ONLY). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody(event);
  const created = await beApi.post<BeDpPanel>("/fo/ec/dp/admin/panel", body, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "panelId=" + created?.panelId);
  return created;
});
