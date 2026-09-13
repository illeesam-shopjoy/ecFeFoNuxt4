import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeDpUi } from "./ui.get";

/** 전시패널관리(어드민) — UI 등록. ecBeBo POST /api/fo/ec/dp/admin/ui 프록시(FO_ONLY). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody(event);
  const created = await beApi.post<BeDpUi>("/fo/ec/dp/admin/ui", body, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "uiId=" + created?.uiId);
  return created;
});
