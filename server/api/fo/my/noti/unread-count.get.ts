import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 안 읽은 알림 수 — ecBeBo GET /api/fo/my/noti/unread-count 프록시 (로그인 필요). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const count = await beApi.get<number>("/fo/my/noti/unread-count", undefined, authHeaderFrom(event), 6000);
  logger.info("[api] ◀", method, url, "unread=" + count);
  return count ?? 0;
});
