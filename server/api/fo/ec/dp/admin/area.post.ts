import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeDpArea } from "./area.get";

/** 전시패널관리(어드민) — 영역 등록. ecBeBo POST /api/fo/ec/dp/admin/area 프록시(FO_ONLY). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody(event);
  const created = await beApi.post<BeDpArea>("/fo/ec/dp/admin/area", body, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "areaId=" + created?.areaId);
  return created;
});
