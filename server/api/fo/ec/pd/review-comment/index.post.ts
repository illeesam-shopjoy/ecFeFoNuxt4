import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 리뷰 답글 등록. ecBeBo POST /api/fo/ec/pd/review-comment(FoPdReviewCommentController) 프록시 —
 *  2026-09-12: /api/base/**(내부 공용 레이어, 인증만 되면 아무나 접근) 대신 FO 전용 레이어로 교체,
 *  작성자 정보는 서버가 로그인 사용자로 채운다. */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{ reviewId?: string; content?: string }>(event).catch(() => ({}) as Record<string, never>);
  const reviewId = body?.reviewId;
  const reviewReplyContent = String(body?.content ?? "").trim();
  if (!reviewId) throw createError({ statusCode: 400, statusMessage: "리뷰 ID가 필요합니다." });
  if (!reviewReplyContent) throw createError({ statusCode: 400, statusMessage: "답글 내용을 입력해 주세요." });

  const created = await beApi.post<{ reviewCommentId: string }>("/fo/ec/pd/review-comment", { reviewId, reviewReplyContent }, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "id=" + created.reviewCommentId);
  return { success: true, message: "답글이 등록되었습니다.", id: created.reviewCommentId };
});
