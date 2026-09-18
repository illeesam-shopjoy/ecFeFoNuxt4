import { beApi, type BePage } from "~~/server/utils/beApi";
import { mapBlog, type BeBlogItem } from "~~/server/utils/mapBlog";
import { cachedCall } from "~~/server/utils/cache";
import { logger } from "~~/server/utils/logger";

/**
 * 블로그 목록. ecBeBo GET /api/fo/ec/cm/bltn/page 프록시 (BFF, 2026-09 전환).
 *
 * 2026-09-17(요청사항: "블로그 목록 20개씩 스크롤 내려가면 20개조회하는 방식으로") — prod/page.get.ts와
 * 동일한 2가지 모드: pageNo 쿼리 없으면 기존 "전체(최대 200건)" 모드 유지(useBlogs() 등 10여 곳이
 * 공유 캐시로 기대고 있어 그대로 둠), pageNo가 있으면 진짜 서버 페이징으로 위임.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const isPaged = query.pageNo !== undefined;

  if (!isPaged) {
    // 2026-09-13: 자택 NAS 백엔드 동시 부하 완화 — 캐시(재조정: 60초→5분, 15초 로딩 실측 대응).
    const page = await cachedCall("be:cm:bltn:page:all", 300_000, () => beApi.get<BePage<BeBlogItem>>("/fo/ec/cm/bltn/page", { pageSize: 200, useYn: "Y" }));
    const out = page.pageList.map(mapBlog);
    logger.info("[api] ◀", method, url, "list size=" + out.length + " (legacy full-list mode)");
    return out;
  }

  const page = await beApi.get<BePage<BeBlogItem>>("/fo/ec/cm/bltn/page", {
    pageNo: query.pageNo,
    pageSize: query.pageSize ?? 20,
    useYn: "Y",
  });
  const out = {
    items: page.pageList.map(mapBlog),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };
  logger.info("[api] ◀", method, url, "paged size=" + out.items.length + "/" + out.pageTotalCount);
  return out;
});
