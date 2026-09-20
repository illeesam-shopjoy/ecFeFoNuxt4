/**
 * foPmEventSvc.ts — 이벤트(pm_event) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPmEventController(/api/fo/ec/pm/event, 공개) 를 직접 부른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import type { PmTimedealItemType } from "~/types/pm/pmTimedealType";

/** 이벤트 목록 카드 1건 */
export interface PmEventCardType {
  eventId: string;
  title: string;
  eventTypeCd: string;
  eventStatusCd: string;
  startDate: string;
  endDate: string;
  imgUrl: string;
}

export interface PmEventPagedResult {
  items: PmEventCardType[];
  pageNo: number;
  pageSize: number;
  pageTotalCount: number;
  pageTotalPage: number;
}

/** 이벤트 상세 */
export interface PmEventDetailType {
  eventId: string;
  title: string;
  eventTypeCd: string;
  eventStatusCd: string;
  desc: string;
  content: string;
  startDate: string;
  endDate: string;
  benefits: { label: string; value: string; desc: string }[];
  eventItems: { id: string; targetType: string; targetId: string }[];
}

interface BePage<T> {
  pageList: T[];
  pageTotalCount: number;
  pageTotalPage: number;
  pageNo: number;
  pageSize: number;
}
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
  benefits?: { benefitNm?: string | null; benefitTypeCd?: string | null; benefitValue?: string | null; conditionDesc?: string | null }[] | null;
  eventItems?: { eventItemId: string; targetTypeCd?: string | null; targetId?: string | null }[] | null;
}

const ymd = (v: string | null | undefined) => (v ?? "").toString().slice(0, 10);

export const foPmEventSvc = {
  /** GET /fo/ec/pm/event/timedeal — 타임딜 이벤트 목록 */
  getTimedealList: async (): Promise<PmTimedealItemType[]> => (await axiosCsr.get<PmTimedealItemType[]>("/fo/ec/pm/event/timedeal")).data,

  /** GET /fo/ec/pm/event/page — 이벤트 목록(페이징) */
  getPage: async (params: { pageNo: number; pageSize: number; eventStatusCd?: string; sort?: string; searchValue?: string }): Promise<PmEventPagedResult> => {
    const q: Record<string, unknown> = { pageNo: params.pageNo, pageSize: params.pageSize };
    if (params.eventStatusCd) q.eventStatusCd = params.eventStatusCd;
    if (params.sort) q.sort = params.sort;
    if (params.searchValue) {
      q.searchValue = params.searchValue;
      q.searchType = "eventId,eventTitle";
    }
    const page = (await axiosCsr.get<BePage<BeEventItem>>("/fo/ec/pm/event/page", { params: q })).data;
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
    };
  },

  /** GET /fo/ec/pm/event/{id} — 이벤트 상세 */
  getById: async (id: string): Promise<PmEventDetailType> => {
    const d = (await axiosCsr.get<BeEventDetail>(`/fo/ec/pm/event/${encodeURIComponent(id)}`)).data;
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
  },
};
