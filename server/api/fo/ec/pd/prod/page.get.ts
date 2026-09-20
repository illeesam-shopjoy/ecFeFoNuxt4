import { beApi, type BePage } from "~~/server/utils/beApi";
import { mapProduct } from "~~/app/utils/mapProduct";
import type { PdProdRawType } from "~~/app/types/pd/pdProdRawType";
import { PROD_CDN } from "~~/server/utils/cdn";
import { logger } from "~~/server/utils/logger";
import { cdnCache } from "~~/server/utils/cdnCache";

/**
 * 상품 목록(/shop) — **SEO 서버 렌더링(SSR) 전용 첫 페이지** (2026-09-20).
 *
 * /shop 의 첫 화면(필터 없는 1페이지)만 서버가 채워 검색엔진이 상품 링크·이름을 HTML 로 읽게 한다.
 * 이후 필터 변경·더보기는 브라우저가 ecBeBo 를 직접 호출한다(app/svc/fo/ec/pd/pdProductSvc.getPaged).
 * 그래서 파라미터는 pageNo/pageSize(+선택 필터)만 받고, 목록에 필요 없는 상세 본문(contentHtml)은 비워 응답을 가볍게 한다.
 * 배열 필터(categoryIds 등)는 콤마 문자열로 받는다(SSR 에서 axiosSsr 가 그렇게 보낸다).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const splitCsv = (v: unknown): string[] | undefined => (typeof v === "string" && v ? v.split(",").filter(Boolean) : undefined);

  const beQuery: Record<string, unknown> = { pageNo: query.pageNo ?? 1, pageSize: query.pageSize ?? 12, useYn: "Y" };
  const categoryIds = splitCsv(query.categoryIds);
  const brandIds = splitCsv(query.brandIds);
  const sizeCds = splitCsv(query.sizeCds);
  if (categoryIds) beQuery.categoryIds = categoryIds;
  if (brandIds) beQuery.brandIds = brandIds;
  const vendorIds = splitCsv(query.vendorIds);
  const mdUserIds = splitCsv(query.mdUserIds);
  if (vendorIds) beQuery.vendorIds = vendorIds;
  if (query.siteId) beQuery.siteId = query.siteId;
  if (query.ratingMin !== undefined) beQuery.ratingMin = query.ratingMin;
  if (query.ratingMax !== undefined) beQuery.ratingMax = query.ratingMax;
  if (mdUserIds) beQuery.mdUserIds = mdUserIds;
  if (sizeCds) beQuery.sizeInfoCds = sizeCds;
  if (query.priceMin !== undefined) beQuery.priceMin = query.priceMin;
  if (query.priceMax !== undefined) beQuery.priceMax = query.priceMax;
  if (query.sort) beQuery.sort = query.sort;
  if (query.keyword) {
    beQuery.searchType = "prodNm";
    beQuery.searchValue = query.keyword;
  }

  const page = await beApi.get<BePage<PdProdRawType>>("/fo/ec/pd/prod/page", beQuery);
  const out = {
    items: page.pageList.map((p) => Object.assign(mapProduct(p, PROD_CDN), { contentHtml: "" })),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };

  logger.info("[api] ◀", method, url, `size=${out.items.length}/${out.pageTotalCount}`);
  cdnCache(event, 60); // 공개 조회 — Netlify CDN 60초 캐시
  return out;
});
