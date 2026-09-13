import { beApi, type BePage } from "~~/server/utils/beApi";
import { mapBlog, type BeBlogItem } from "~~/server/utils/mapBlog";
import { cachedCall } from "~~/server/utils/cache";
import { logger } from "~~/server/utils/logger";

/** 블로그 목록. ecBeBo GET /api/fo/ec/cm/bltn/page 프록시 (BFF, 2026-09 전환). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  // 2026-09-13: 자택 NAS 백엔드 동시 부하 완화 — 캐시(재조정: 60초→5분, 15초 로딩 실측 대응).
  const page = await cachedCall("be:cm:bltn:page:all", 300_000, () => beApi.get<BePage<BeBlogItem>>("/fo/ec/cm/bltn/page", { pageSize: 200, useYn: "Y" }));
  const out = page.pageList.map(mapBlog);

  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
