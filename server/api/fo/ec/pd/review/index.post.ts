import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 리뷰 등록. ecBeBo POST /api/fo/ec/pd/review(FoPdReviewController) 프록시 —
 * (2026-09, prodId는 URL이 아니라 요청 바디에 실어 보낸다 — 실 컨트롤러와 동일한 계약).
 * 2026-09-12: 예전엔 /api/base/ec/pd/review(인증만 되면 아무나 접근 가능한 내부 공용 레이어)를
 * 직접 불렀는데, ecBeBo 쪽에 FO 전용 레이어(FoPdReviewService)를 새로 둬서 memberId를 서버가
 * 로그인 사용자로 강제로 채우도록 바꿨다 — 로그인 브릿지 완료([[ecfefonuxt4-bff-migration-plan]]),
 * 로그인 안 하면 401.
 *
 * 파일첨부는 아직 미연동(리뷰 저장과 별개 플로우 필요).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{ prodId?: string; reviewTitle?: string; content?: string; rating?: number }>(event).catch(() => ({}) as Record<string, never>);
  const prodId = body?.prodId;
  const reviewContent = String(body?.content ?? "").trim();
  const rating = Number(body?.rating);
  if (!prodId) throw createError({ statusCode: 400, statusMessage: "상품 ID가 필요합니다." });
  if (!reviewContent) throw createError({ statusCode: 400, statusMessage: "리뷰 내용을 입력해 주세요." });
  if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) throw createError({ statusCode: 400, statusMessage: "별점을 선택해 주세요. (0.5 ~ 5)" });

  const created = await beApi.post<{ reviewId: string }>(
    "/fo/ec/pd/review",
    { prodId, reviewTitle: body?.reviewTitle ?? "", reviewContent, rating },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url, "id=" + created.reviewId);
  return { success: true, message: "리뷰가 등록되었습니다.", id: created.reviewId };
});
