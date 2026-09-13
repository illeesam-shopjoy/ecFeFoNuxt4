import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 리뷰 답글 삭제. ecBeBo DELETE /api/fo/ec/pd/review-comment/{id}(FoPdReviewCommentController) 프록시 —
 *  본인 답글이 아니면 400(CmBizException 기본 상태코드)이 온다(FoPdReviewCommentService.delete() 소유자 검증). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const reviewCommentId = getRouterParam(event, "reviewCommentId");
  if (!reviewCommentId) throw createError({ statusCode: 400, statusMessage: "잘못된 답글 ID입니다." });

  await beApi.delete(`/fo/ec/pd/review-comment/${reviewCommentId}`, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "deleted=" + reviewCommentId);
  return { success: true, message: "답글이 삭제되었습니다." };
});
