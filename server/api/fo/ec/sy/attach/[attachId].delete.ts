import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 첨부파일 삭제. ecBeBo DELETE /api/fo/sy/attach/{id} 프록시 (경로 그대로 일치). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const attachId = getRouterParam(event, "attachId");
  if (!attachId) throw createError({ statusCode: 400, statusMessage: "잘못된 첨부파일 ID입니다." });

  await beApi.delete(`/fo/sy/attach/${attachId}`, authHeaderFrom(event));

  logger.info("[api] ◀", method, url);
  return { ok: true };
});
