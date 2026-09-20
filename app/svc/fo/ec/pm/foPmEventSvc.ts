/**
 * foPmEventSvc.ts — 이벤트(pm_event) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPmEventController(/api/fo/ec/pm/event, 공개) 를 직접 부른다. 조회 조건 변환·응답 가공은 utils/mapEvent.ts.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { buildEventPageQuery, mapEventDetail, mapEventPage, type PmEventPageParams } from "~/utils/mapEvent";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { PmEventType } from "~/types/pm/pmEventType";
import type { PmEventCardType, PmEventDetailType } from "~/types/pm/pmEventViewType";
import type { PmTimedealItemType } from "~/types/pm/pmTimedealType";

export const foPmEventSvc = {
  /** GET /fo/ec/pm/event/timedeal — 타임딜 이벤트 목록 */
  getTimedealList: async (): Promise<PmTimedealItemType[]> => (await axiosCsr.get<PmTimedealItemType[]>("/fo/ec/pm/event/timedeal")).data,

  /** GET /fo/ec/pm/event/page — 이벤트 목록(페이징) */
  getPage: async (params: PmEventPageParams): Promise<CoPagedResultType<PmEventCardType>> =>
    mapEventPage((await axiosCsr.get<CoBasePageType<PmEventType>>("/fo/ec/pm/event/page", { params: buildEventPageQuery(params) })).data),

  /** GET /fo/ec/pm/event/{id} — 이벤트 상세 */
  getById: async (id: string): Promise<PmEventDetailType> => mapEventDetail((await axiosCsr.get<PmEventType>(`/fo/ec/pm/event/${encodeURIComponent(id)}`)).data),
};
