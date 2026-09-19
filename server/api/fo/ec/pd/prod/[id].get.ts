import { beApi } from "~~/server/utils/beApi";
import { mapProduct, type BeProdItem } from "~~/app/utils/mapProduct";
import { PROD_CDN } from "~~/server/utils/cdn";
import { logger } from "~~/server/utils/logger";
import { cdnCache } from "~~/server/utils/cdnCache";

/**
 * 상품 상세 — **SEO 서버 렌더링(SSR) 전용 최소 정보** (2026-09-20).
 *
 * 메타 태그·JSON-LD·첫 화면(이름/이미지/가격/짧은 설명)에 필요한 것만 내려준다. 리뷰·옵션·SKU·상세 본문(contentHtml)은
 * 뺀다 — 그것들은 화면이 뜬 뒤 브라우저가 ecBeBo 에서 직접 전체 조회한다(app/svc/fo/ec/pd/pdProductSvc.getById).
 * 변하는 데이터(리뷰·재고 등)가 없어 Netlify CDN 에 길게 캐시해도 리뷰가 안 보이는 문제가 생기지 않는다.
 * 응답은 PdProductType 모양을 유지하되 무거운 필드만 비운다(화면이 배열 필드를 그대로 읽으므로 undefined 로 두지 않는다).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "잘못된 상품 ID입니다." });
  }

  const detail = await beApi.get<BeProdItem>(`/fo/ec/pd/prod/${id}`).catch((e: unknown) => {
    const err = e as { statusCode?: number };
    if (err?.statusCode === 404) throw createError({ statusCode: 404, statusMessage: "상품을 찾을 수 없습니다." });
    throw e;
  });

  const out = mapProduct(detail, PROD_CDN);
  Object.assign(out, { contentHtml: "", relatedImages: [], optionSizes: [], optionColors: [], prodSkus: [], reviews: [] });

  logger.info("[api] ◀", method, url, `prodId=${out.prodId}`);
  cdnCache(event, 300); // 변하지 않는 SEO 정보 — Netlify CDN 5분 캐시(+swr)
  return out;
});
