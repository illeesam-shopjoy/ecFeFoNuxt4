import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 알림 전체 읽음 — ecBeBo POST /api/fo/my/noti/read-all 프록시 (로그인 필요). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const res = await beApi.post<number>("/fo/my/noti/read-all", {}, authHeaderFrom(event));
  logger.info("[api] ◀", method, url, "updated=" + res);
  return res ?? 0;
});
