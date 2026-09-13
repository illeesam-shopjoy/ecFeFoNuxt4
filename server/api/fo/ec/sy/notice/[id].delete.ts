import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 공지 삭제(관리자). ecBeBo DELETE /api/fo/sy/notice/{id} 프록시 (경로 그대로 일치). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 공지 ID입니다." });

  await beApi.delete(`/fo/sy/notice/${id}`, authHeaderFrom(event));

  logger.info("[api] ◀", method, url);
  return { ok: true };
});
