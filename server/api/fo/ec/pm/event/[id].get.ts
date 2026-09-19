import { beApi } from "~~/server/utils/beApi";
import { cdnCache } from "~~/server/utils/cdnCache";
import { logger } from "~~/server/utils/logger";

interface BeBenefit {
  benefitNm?: string | null;
  benefitTypeCd?: string | null;
  benefitValue?: string | null;
  conditionDesc?: string | null;
}
interface BeEventItemRow {
  eventItemId: string;
  targetTypeCd?: string | null;
  targetId?: string | null;
}
interface BeEventDetail {
  eventId: string;
  eventNm?: string | null;
  eventTitle?: string | null;
  eventTypeCd?: string | null;
  eventDesc?: string | null;
  eventContent?: string | null;
  eventStatusCd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  benefits?: BeBenefit[] | null;
  eventItems?: BeEventItemRow[] | null;
}

/**
 * 이벤트 상세. ecBeBo GET /api/fo/ec/pm/event/{eventId} 프록시 (2026-09-19, ecFeBo EventView.js 이식) — 공개 조회.
 * benefits(혜택)/eventItems(대상)는 백엔드가 연관정보로 함께 내려준다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 이벤트 ID입니다." });

  const d = await beApi.get<BeEventDetail>(`/fo/ec/pm/event/${encodeURIComponent(id)}`, undefined, undefined, 10000).catch((e: unknown) => {
    if ((e as { statusCode?: number })?.statusCode === 404) throw createError({ statusCode: 404, statusMessage: "이벤트를 찾을 수 없습니다." });
    throw e;
  });

  const out = {
    eventId: d.eventId,
    title: d.eventTitle || d.eventNm || "",
    eventTypeCd: d.eventTypeCd ?? "",
    eventStatusCd: String(d.eventStatusCd ?? "").toUpperCase(),
    desc: d.eventDesc ?? "",
    content: d.eventContent ?? "",
    startDate: (d.startDate ?? "").toString().slice(0, 10),
    endDate: (d.endDate ?? "").toString().slice(0, 10),
    benefits: (d.benefits ?? []).map((b) => ({
      label: b.benefitNm || b.benefitTypeCd || "혜택",
      value: b.benefitValue ?? "",
      desc: b.conditionDesc ?? "",
    })),
    eventItems: (d.eventItems ?? []).map((it) => ({
      id: it.eventItemId,
      targetType: it.targetTypeCd ?? "",
      targetId: it.targetId ?? "",
    })),
  };

  logger.info("[api] ◀", method, url, "benefits=" + out.benefits.length + " items=" + out.eventItems.length);
  cdnCache(event, 60);
  return out;
});
