import { beApi, type BePage } from "~~/server/utils/beApi";
import { mapProduct, type BeProdItem } from "~~/app/utils/mapProduct";
import { PROD_CDN } from "~~/server/utils/cdn";
import { cachedCall } from "~~/server/utils/cache";
import { logger } from "~~/server/utils/logger";
import { cdnCache } from "~~/server/utils/cdnCache";

/**
 * 상품 목록(서버 페이징/멀티선택 필터). ecBeBo GET /api/fo/ec/pd/prod/page 프록시 (BFF, 2026-09 전환).
 *
 * 2026-09-20: 쿼리 없이 호출하면 전체 카탈로그(최대 1000건, 실측 15초+)를 내려주던 "전체 목록 모드"는
 * 제거했다 — 전역 useProductsStore 가 사라지고 모든 화면이 필요한 만큼만 페이징으로 조회한다.
 * pageNo 가 없으면 1페이지로 처리한다.
 *
 * ecBeBo(2026-09-13 확장, PdProdDto.Request의 categoryIds/brandIds/sizeInfoCds(List)+priceMin/priceMax)에
 * 그대로 위임 — categoryIds/brandIds/sizeCds는 프론트에서 콤마 조합 문자열로 보내고
 * 여기서 다시 배열로 쪼개 beApi에 반복 파라미터로 넘긴다(Spring @ModelAttribute List<String>
 * 바인딩은 동일 이름 반복 파라미터 형식을 기대함).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);

  const splitCsv = (v: unknown): string[] | undefined => {
    if (typeof v !== "string" || !v) return undefined;
    return v.split(",").filter(Boolean);
  };

  // ecBeBo에 그대로 위임. 동일 조합 요청이 짧은 시간 내 반복될 수 있어
  // (스크롤 다시 위로 올렸다 내리는 등) 10초 짧은 캐시로 자택 NAS 부하만 살짝 눌러준다.
  const beQuery: Record<string, unknown> = {
    pageNo: query.pageNo ?? 1,
    pageSize: query.pageSize ?? 12,
    useYn: "Y",
  };
  const categoryIds = splitCsv(query.categoryIds);
  const brandIds = splitCsv(query.brandIds);
  const sizeCds = splitCsv(query.sizeCds);
  if (categoryIds) beQuery.categoryIds = categoryIds;
  if (brandIds) beQuery.brandIds = brandIds;
  if (sizeCds) beQuery.sizeInfoCds = sizeCds;
  if (query.priceMin !== undefined) beQuery.priceMin = query.priceMin;
  if (query.priceMax !== undefined) beQuery.priceMax = query.priceMax;
  if (query.sort) beQuery.sort = query.sort;
  if (query.keyword) {
    beQuery.searchType = "prodNm";
    beQuery.searchValue = query.keyword;
  }

  const cacheKey = "be:prod:paged:" + JSON.stringify(beQuery);
  const page = await cachedCall(cacheKey, 10_000, () => beApi.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", beQuery));
  const out = {
    items: page.pageList.map((p) => mapProduct(p, PROD_CDN)),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };
  logger.info("[api] ◀", method, url, "paged size=" + out.items.length + "/" + out.pageTotalCount);
  cdnCache(event, 30); // 공개 조회 — Netlify CDN 30초 캐시
  return out;
});
