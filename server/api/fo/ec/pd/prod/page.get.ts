import { beApi, type BePage } from "~~/server/utils/beApi";
import { mapProduct, type BeProdItem } from "~~/server/utils/mapProduct";
import { getAllProdPage } from "~~/server/utils/beProducts";
import { cachedCall } from "~~/server/utils/cache";
import { logger } from "~~/server/utils/logger";

/**
 * 상품 목록. ecBeBo GET /api/fo/ec/pd/prod/page 프록시 (BFF, 2026-09 전환 — DB 직접조회 없음).
 *
 * 2026-09-13(요청사항: "상품이 10000개가 될수도 있기에 페이징 api 조회 해야해" +
 * "좌측 항목은 가급적 멀티 선택할 수 있도록") — 두 가지 모드로 동작한다:
 *
 *  1) 쿼리스트링 없이 호출(예전 그대로) → useProductsStore가 쓰는 "거의 전체 목록 한 번에"
 *     모드 유지(getAllProdPage 캐시 공유). 홈 화면 인기상품/베스트/장바구니 등 여러 화면이
 *     이 store 하나에 기대고 있어 건드리지 않는다.
 *  2) pageNo 쿼리가 있으면 → 진짜 서버 페이징/멀티선택 필터 모드. ecBeBo(2026-09-13 확장,
 *     PdProdDto.Request의 categoryIds/brandIds/sizeInfoCds(List)+priceMin/priceMax)에
 *     그대로 위임 — categoryIds/brandIds/sizeCds는 프론트에서 콤마 조합 문자열로 보내고
 *     여기서 다시 배열로 쪼개 beApi에 반복 파라미터로 넘긴다(Spring @ModelAttribute List<String>
 *     바인딩은 동일 이름 반복 파라미터 형식을 기대함).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const isPaged = query.pageNo !== undefined;

  if (!isPaged) {
    // 기존 모드: 전체 목록(캐시 공유) — useProductsStore 등 기존 소비자 그대로 유지.
    const page = await getAllProdPage();
    const out = page.pageList.map((p) => mapProduct(p));
    logger.info("[api] ◀", method, url, "list size=" + out.length + " (legacy full-list mode)");
    return out;
  }

  const splitCsv = (v: unknown): string[] | undefined => {
    if (typeof v !== "string" || !v) return undefined;
    return v.split(",").filter(Boolean);
  };

  // 진짜 페이징 모드: ecBeBo에 그대로 위임. 동일 조합 요청이 짧은 시간 내 반복될 수 있어
  // (스크롤 다시 위로 올렸다 내리는 등) 10초 짧은 캐시로 자택 NAS 부하만 살짝 눌러준다.
  const beQuery: Record<string, unknown> = {
    pageNo: query.pageNo,
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
    items: page.pageList.map((p) => mapProduct(p)),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };
  logger.info("[api] ◀", method, url, "paged size=" + out.items.length + "/" + out.pageTotalCount);
  return out;
});
