import { beApi } from "~~/server/utils/beApi";
import { mapBlog, type BeBlogItem } from "~~/server/utils/mapBlog";
import { logger } from "~~/server/utils/logger";

/** 블로그 상세. ecBeBo GET /api/fo/ec/cm/bltn/{id} 프록시 (BFF, 2026-09 전환). */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 블로그 ID입니다." });

  const row = await beApi.get<BeBlogItem>(`/fo/ec/cm/bltn/${id}`).catch((e: unknown) => {
    const err = e as { statusCode?: number };
    if (err?.statusCode === 404) throw createError({ statusCode: 404, statusMessage: "블로그를 찾을 수 없습니다." });
    throw e;
  });
  const out = mapBlog(row);

  const s = JSON.stringify(out);
  logger.info("[api] ◀", method, url, s.length > 200 ? s.slice(0, 200) + "..." : s);
  return out;
});
