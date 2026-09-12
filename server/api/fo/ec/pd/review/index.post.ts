import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 리뷰 등록. ecBeBo POST /api/base/ec/pd/review 프록시 — 경로도 ecBeBo와 동일하게 맞춤
 * (2026-09, prodId는 URL이 아니라 요청 바디에 실어 보낸다 — 실 컨트롤러와 동일한 계약).
 *
 * ⚠️ 미해결 사항: 로그인 필요(미인증 시 401) — ecFeFoNuxt4 로그인이 아직 ecBeBo와
 * 브릿지되지 않아 항상 401. 파일첨부도 아직 미연동(리뷰 저장과 별개 플로우 필요).
 * 자세한 내용은 [[ecfefonuxt4-bff-migration-plan]] 참조.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{ prodId?: string; reviewTitle?: string; content?: string; rating?: number }>(event).catch(() => ({}) as Record<string, never>);
  const prodId = body?.prodId;
  const reviewContent = String(body?.content ?? "").trim();
  const rating = Number(body?.rating);
  if (!prodId) throw createError({ statusCode: 400, statusMessage: "상품 ID가 필요합니다." });
  if (!reviewContent) throw createError({ statusCode: 400, statusMessage: "리뷰 내용을 입력해 주세요." });
  if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) throw createError({ statusCode: 400, statusMessage: "별점을 선택해 주세요. (0.5 ~ 5)" });

  const created = await beApi.post<{ reviewId: string }>(
    "/base/ec/pd/review",
    { prodId, reviewTitle: body?.reviewTitle ?? "", reviewContent, rating },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url, "id=" + created.reviewId);
  return { success: true, message: "리뷰가 등록되었습니다.", id: created.reviewId };
});
