import { beApi } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import { cdnCache } from "~~/server/utils/cdnCache";

interface BeEventDetail {
  eventId: string;
  eventNm?: string | null;
  eventTitle?: string | null;
  eventTypeCd?: string | null;
  eventDesc?: string | null;
  eventStatusCd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const ymd = (v: string | null | undefined) => (v ?? "").toString().slice(0, 10);

/**
 * 이벤트 상세 — **SEO 서버 렌더링(SSR) 전용 최소 정보** (2026-09-20).
 *
 * 메타 태그·첫 화면(제목/설명/기간/상태)에 필요한 것만 내려주고 본문(content)·혜택·대상은 비운다 —
 * 그것들은 화면이 뜬 뒤 브라우저가 ecBeBo 에서 직접 전체 조회한다(app/svc/fo/ec/pm/foPmEventSvc.getById).
 * 응답은 PmEventDetailType 모양을 유지한다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 이벤트 ID입니다." });

  const d = await beApi.get<BeEventDetail>(`/fo/ec/pm/event/${encodeURIComponent(id)}`).catch((e: unknown) => {
    const err = e as { statusCode?: number };
    if (err?.statusCode === 404 || err?.statusCode === 400) throw createError({ statusCode: 404, statusMessage: "이벤트를 찾을 수 없습니다." });
    throw e;
  });

  const out = {
    eventId: d.eventId,
    title: d.eventTitle || d.eventNm || "",
    eventTypeCd: d.eventTypeCd ?? "",
    eventStatusCd: String(d.eventStatusCd ?? "").toUpperCase(),
    desc: d.eventDesc ?? "",
    content: "",
    startDate: ymd(d.startDate),
    endDate: ymd(d.endDate),
    benefits: [],
    eventItems: [],
  };
  logger.info("[api] ◀", method, url, `eventId=${out.eventId}`);
  cdnCache(event, 300); // 변하지 않는 SEO 정보 — Netlify CDN 5분 캐시(+swr)
  return out;
});
