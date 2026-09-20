/**
 * foPmEventSvc.ts — 이벤트(pm_event) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPmEventController(/api/fo/ec/pm/event, 공개) 를 직접 부른다. 조회 조건 변환·응답 가공은 utils/mapEvent.ts.
 */
import { csrGet, idPath } from "~/utils/svcHttp";
import { buildEventPageQuery, mapEventDetail, mapEventPage } from "~/utils/mapEvent";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { PmEventPageParamsType } from "~/types/pm/pmEventPageParamsType";
import type { PmEventType } from "~/types/pm/pmEventType";
import type { PmEventCardType, PmEventDetailType } from "~/types/pm/pmEventViewType";
import type { PmTimedealItemType } from "~/types/pm/pmTimedealType";

const EVENT = "/fo/ec/pm/event";

export const foPmEventSvc = {
  /** GET /fo/ec/pm/event/timedeal — 타임딜 이벤트 목록 */
  getTimedealList: (): Promise<PmTimedealItemType[]> => csrGet<PmTimedealItemType[]>(`${EVENT}/timedeal`),

  /** GET /fo/ec/pm/event/page — 이벤트 목록(페이징) */
  getPage: (params: PmEventPageParamsType): Promise<CoPagedResultType<PmEventCardType>> =>
    csrGet<CoBasePageType<PmEventType>>(`${EVENT}/page`, { params: buildEventPageQuery(params) }).then(mapEventPage),

  /** GET /fo/ec/pm/event/{id} — 이벤트 상세 */
  getById: (id: string): Promise<PmEventDetailType> => csrGet<PmEventType>(idPath(EVENT, id)).then(mapEventDetail),
};
