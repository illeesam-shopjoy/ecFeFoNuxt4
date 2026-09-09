import { beApi, type BePage } from "~~/server/utils/beApi";
import { mapBlog, type BeBlogItem } from "~~/server/utils/mapBlog";
import { logger } from "~~/server/utils/logger";

/** 블로그 목록. ecBeBo GET /api/fo/ec/cm/bltn/page 프록시 (BFF, 2026-09 전환). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const page = await beApi.get<BePage<BeBlogItem>>("/fo/ec/cm/bltn/page", { pageSize: 200, useYn: "Y" });
  const out = page.pageList.map(mapBlog);

  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
