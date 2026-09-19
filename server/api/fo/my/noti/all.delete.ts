import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 내 알림 전체 삭제 — ecBeBo DELETE /api/fo/my/noti/all 프록시 (로그인 필요). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const res = await beApi.delete<unknown>("/fo/my/noti/all", authHeaderFrom(event));
  logger.info("[api] ◀", method, url);
  return res ?? true;
});
