import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 리뷰 삭제. ecBeBo DELETE /api/fo/ec/pd/review/{id}(FoPdReviewController) 프록시 —
 *  본인 리뷰가 아니면 ecBeBo가 400(CmBizException 기본 상태코드)을 던진다(FoPdReviewService.delete()의
 *  소유자 검증 — 이 프로젝트는 권한 위반도 403이 아니라 CmBizException 기본값인 400으로 통일됨). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const reviewId = getRouterParam(event, "reviewId");
  if (!reviewId) throw createError({ statusCode: 400, statusMessage: "잘못된 리뷰 ID입니다." });

  await beApi.delete(`/fo/ec/pd/review/${reviewId}`, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "deleted reviewId=" + reviewId);
  return { success: true, message: "리뷰가 삭제되었습니다." };
});
