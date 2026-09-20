/** mapEvent.ts — 이벤트 조회 조건 변환·응답 가공 (svc 는 조회만). */
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { PmEventType } from "~/types/pm/pmEventType";
import type { PmEventCardType, PmEventDetailType } from "~/types/pm/pmEventViewType";

const ymd = (v: string | null | undefined) => (v ?? "").toString().slice(0, 10);

export interface PmEventPageParams {
  pageNo: number;
  pageSize: number;
  eventStatusCd?: string;
  sort?: string;
  searchValue?: string;
}

/** 화면 조회 조건 → GET /fo/ec/pm/event/page 쿼리 */
export function buildEventPageQuery(params: PmEventPageParams): Record<string, unknown> {
  const q: Record<string, unknown> = { pageNo: params.pageNo, pageSize: params.pageSize };
  if (params.eventStatusCd) q.eventStatusCd = params.eventStatusCd;
  if (params.sort) q.sort = params.sort;
  if (params.searchValue) {
    q.searchValue = params.searchValue;
    q.searchType = "eventId,eventTitle";
  }
  return q;
}

export function mapEventPage(page: CoBasePageType<PmEventType>): CoPagedResultType<PmEventCardType> {
  return {
    items: (page.pageList ?? []).map((e) => ({
      eventId: e.eventId,
      title: e.eventTitle || e.eventNm || "",
      eventTypeCd: e.eventTypeCd ?? "",
      eventStatusCd: String(e.eventStatusCd ?? "").toUpperCase(),
      startDate: ymd(e.startDate),
      endDate: ymd(e.endDate),
      imgUrl: e.imgUrl ?? "",
    })),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };
}

export function mapEventDetail(d: PmEventType): PmEventDetailType {
  return {
    eventId: d.eventId,
    title: d.eventTitle || d.eventNm || "",
    eventTypeCd: d.eventTypeCd ?? "",
    eventStatusCd: String(d.eventStatusCd ?? "").toUpperCase(),
    desc: d.eventDesc ?? "",
    content: d.eventContent ?? "",
    startDate: ymd(d.startDate),
    endDate: ymd(d.endDate),
    benefits: (d.benefits ?? []).map((b) => ({ label: b.benefitNm || b.benefitTypeCd || "혜택", value: b.benefitValue ?? "", desc: b.conditionDesc ?? "" })),
    eventItems: (d.eventItems ?? []).map((it) => ({ id: it.eventItemId, targetType: it.targetTypeCd ?? "", targetId: it.targetId ?? "" })),
  };
}
