import { beApi } from "~~/server/utils/beApi";
import { mapProduct, mapReview, type BeProdItem, type BeReviewItem } from "~~/server/utils/mapProduct";
import { logger } from "~~/server/utils/logger";

interface BeReviewsResponse {
  summary: { avgRating?: number; reviewCount?: number };
  reviewPage: { pageList: BeReviewItem[]; pageTotalCount: number };
}

/**
 * 상품 상세. ecBeBo의 3계층 설계(정책서 pd.10) 중 Tier1(GET /{id})과 Tier2 리뷰(GET /{id}/reviews)를
 * BFF에서 한 번에 합쳐서 내려준다 — 기존 화면(ProductDetailsReview.vue 등)이 product.reviews를
 * props로 그대로 읽는 구조라 이 계층을 프론트까지 들고 가지 않기 위함(“Nuxt4 기본구조는 그대로” 방침).
 * QnA/연관상품/프로모션(Tier2/3 나머지)은 필요해지면 별도 라우트로 추가할 것.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "잘못된 상품 ID입니다." });
  }

  const [detail, reviewsRes] = await Promise.all([
    beApi.get<BeProdItem>(`/fo/ec/pd/prod/${id}`).catch((e: unknown) => {
      const err = e as { statusCode?: number };
      if (err?.statusCode === 404) throw createError({ statusCode: 404, statusMessage: "상품을 찾을 수 없습니다." });
      throw e;
    }),
    beApi.get<BeReviewsResponse>(`/fo/ec/pd/prod/${id}/reviews`, { pageSize: 50 }).catch((e: unknown) => {
      logger.warn("[api]", url, "리뷰 조회 실패(상품 상세는 계속 진행):", (e as Error)?.message);
      return { summary: {}, reviewPage: { pageList: [], pageTotalCount: 0 } } as BeReviewsResponse;
    }),
  ]);

  const out = mapProduct(detail);
  out.reviews = reviewsRes.reviewPage.pageList.map(mapReview);
  if (typeof reviewsRes.summary?.avgRating === "number") {
    out.rating = reviewsRes.summary.avgRating;
  }

  const s = JSON.stringify(out);
  logger.info("[api] ◀", method, url, s.length > 200 ? s.slice(0, 200) + "..." : s);
  return out;
});
