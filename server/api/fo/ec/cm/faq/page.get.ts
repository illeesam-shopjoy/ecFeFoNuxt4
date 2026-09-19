import { beApi, type BePage } from "~~/server/utils/beApi";
import { cdnCache } from "~~/server/utils/cdnCache";
import { logger } from "~~/server/utils/logger";

interface BeFaqItem {
  faqId: string;
  faqQuestion: string;
  faqAnswer?: string | null;
  viewCount?: number | null;
  pathId?: string | number | null;
  pathLabel?: string | null;
}

/**
 * 공개 FAQ 서버 페이징 조회. ecBeBo GET /api/fo/faq/page 프록시 (2026-09-19, ecFeBo Faq.js 이식).
 * 쿼리: pageNo, pageSize, pathId(분류 — 백엔드가 자손 포함 필터). 화면이 쓰는 필드명(q/a/…)으로 정규화해 내려준다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const beQuery: Record<string, unknown> = {
    pageNo: query.pageNo ?? 1,
    pageSize: query.pageSize ?? 10,
  };
  if (query.pathId) beQuery.pathId = query.pathId;

  const page = await beApi.get<BePage<BeFaqItem>>("/fo/faq/page", beQuery, undefined, 10000);
  const out = {
    items: (page.pageList ?? []).map((f) => ({
      faqId: f.faqId,
      q: f.faqQuestion,
      a: f.faqAnswer ?? "",
      viewCount: f.viewCount ?? 0,
      pathId: f.pathId != null ? String(f.pathId) : "",
      cate: f.pathLabel ?? "",
    })),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
  };

  logger.info("[api] ◀", method, url, "size=" + out.items.length + "/" + out.pageTotalCount);
  cdnCache(event, 60);
  return out;
});
