import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 리뷰 삭제. ecBeBo DELETE /api/base/ec/pd/review/{id} 프록시 (경로 그대로 일치). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const reviewId = getRouterParam(event, "reviewId");
  if (!reviewId) throw createError({ statusCode: 400, statusMessage: "잘못된 리뷰 ID입니다." });

  await beApi.delete(`/base/ec/pd/review/${reviewId}`, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "deleted reviewId=" + reviewId);
  return { success: true, message: "리뷰가 삭제되었습니다." };
});
