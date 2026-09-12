import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 리뷰 답글 등록. ecBeBo POST /api/base/ec/pd/review-comment 프록시 (경로 그대로 일치). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{ reviewId?: string; content?: string }>(event).catch(() => ({}) as Record<string, never>);
  const reviewId = body?.reviewId;
  const reviewReplyContent = String(body?.content ?? "").trim();
  if (!reviewId) throw createError({ statusCode: 400, statusMessage: "리뷰 ID가 필요합니다." });
  if (!reviewReplyContent) throw createError({ statusCode: 400, statusMessage: "답글 내용을 입력해 주세요." });

  const created = await beApi.post<{ reviewCommentId: string }>("/base/ec/pd/review-comment", { reviewId, reviewReplyContent }, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "id=" + created.reviewCommentId);
  return { success: true, message: "답글이 등록되었습니다.", id: created.reviewCommentId };
});
