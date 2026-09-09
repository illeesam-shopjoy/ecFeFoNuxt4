import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 리뷰 답글 삭제. ecBeBo DELETE /api/base/ec/pd/review-comment/{id} 프록시 (경로 그대로 일치). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const reviewCommentId = getRouterParam(event, "reviewCommentId");
  if (!reviewCommentId) throw createError({ statusCode: 400, statusMessage: "잘못된 답글 ID입니다." });

  await beApi.delete(`/base/ec/pd/review-comment/${reviewCommentId}`, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "deleted=" + reviewCommentId);
  return { success: true, message: "답글이 삭제되었습니다." };
});
