import { beApi } from "~~/server/utils/beApi";
import { mapBlog, type BeBlogItem } from "~~/app/utils/mapBlog";
import { PROD_CDN } from "~~/server/utils/cdn";
import { logger } from "~~/server/utils/logger";
import { cdnCache } from "~~/server/utils/cdnCache";

/**
 * 블로그 상세 — **SEO 서버 렌더링(SSR) 전용 최소 정보** (2026-09-20).
 *
 * 메타 태그·첫 화면(제목/작성자/날짜/대표이미지/요약)에 필요한 것만 내려주고 본문(blogContent)은 비운다 —
 * 본문은 화면이 뜬 뒤 브라우저가 ecBeBo 에서 직접 전체 조회한다(app/svc/fo/ec/cm/coBlogSvc.getById).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 블로그 ID입니다." });

  const row = await beApi.get<BeBlogItem>(`/fo/ec/cm/bltn/${id}`).catch((e: unknown) => {
    const err = e as { statusCode?: number };
    // ecBeBo 는 없는 게시물에 400("존재하지 않는 게시물입니다")을 내려주기도 한다
    if (err?.statusCode === 404 || err?.statusCode === 400) throw createError({ statusCode: 404, statusMessage: "블로그를 찾을 수 없습니다." });
    throw e;
  });

  const out = { ...mapBlog(row, PROD_CDN), blogContent: "" };
  logger.info("[api] ◀", method, url, `blogId=${out.blogId}`);
  cdnCache(event, 300); // 변하지 않는 SEO 정보 — Netlify CDN 5분 캐시(+swr)
  return out;
});
