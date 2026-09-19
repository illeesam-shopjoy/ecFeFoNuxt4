import { beApi, type BePage } from "~~/server/utils/beApi";
import { cdnCache } from "~~/server/utils/cdnCache";
import { logger } from "~~/server/utils/logger";

interface BeEventItem {
  eventId: string;
  eventNm?: string | null;
  eventTitle?: string | null;
  eventTypeCd?: string | null;
  eventStatusCd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  imgUrl?: string | null;
}

/**
 * 이벤트 목록(서버 페이징). ecBeBo GET /api/fo/ec/pm/event/page 프록시 (2026-09-19, ecFeBo Event.js 이식) — 공개 조회.
 * 쿼리: pageNo, pageSize, eventStatusCd(PENDING/ACTIVE/ENDED), sort, searchValue, searchType.
 * 목록에 필요 없는 무거운 본문(eventContent 등)은 버리고 카드에 쓰는 필드만 내려준다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const beQuery: Record<string, unknown> = {
    pageNo: query.pageNo ?? 1,
    pageSize: query.pageSize ?? 20,
  };
  for (const k of ["eventStatusCd", "sort", "searchValue", "searchType"]) {
    if (query[k]) beQuery[k] = query[k];
  }

  const page = await beApi.get<BePage<BeEventItem>>("/fo/ec/pm/event/page", beQuery, undefined, 10000);
  const out = {
    items: (page.pageList ?? []).map((e) => ({
      eventId: e.eventId,
      title: e.eventTitle || e.eventNm || "",
      eventTypeCd: e.eventTypeCd ?? "",
      eventStatusCd: String(e.eventStatusCd ?? "").toUpperCase(),
      startDate: (e.startDate ?? "").toString().slice(0, 10),
      endDate: (e.endDate ?? "").toString().slice(0, 10),
      imgUrl: e.imgUrl ?? "",
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
