import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 알림 1건 삭제 — ecBeBo DELETE /api/fo/my/noti/{id} 프록시 (로그인 필요). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 알림 ID입니다." });

  const res = await beApi.delete<unknown>(`/fo/my/noti/${encodeURIComponent(id)}`, authHeaderFrom(event));
  logger.info("[api] ◀", method, url);
  return res ?? true;
});
