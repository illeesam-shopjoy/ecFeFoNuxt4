import { beApi } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 진행중인 FLASH 이벤트의 타임딜 항목 목록. ecBeBo GET /api/fo/ec/pm/event/timedeal 프록시.
 * 2026-09 타임딜 기능 신설 — 로그인 불필요(공개 조회).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const list = await beApi.get("/fo/ec/pm/event/timedeal");

  logger.info("[api] ◀", method, url, "size=" + (Array.isArray(list) ? list.length : 0));
  return list;
});
