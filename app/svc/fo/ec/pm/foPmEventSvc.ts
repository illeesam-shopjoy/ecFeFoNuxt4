/**
 * foPmEventSvc.ts — FO 이벤트 API 호출 객체 (2026-09 타임딜 기능 신설로 추가).
 * 2026-09-19: 이벤트 목록/상세(ecFeBo Event.js/EventView.js 이식) 조회를 추가.
 */
import { axiosSsr } from "~/utils/axiosSsr";
import type { PmTimedealItemType } from "~/types/pmTimedealType";

export interface PmEventCardType {
  eventId: string;
  title: string;
  eventTypeCd: string;
  /** PENDING | ACTIVE | ENDED */
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

export const foPmEventSvc = {
  /** GET /api/fo/ec/pm/event/timedeal — 진행중인 FLASH 이벤트의 타임딜 항목 목록 */
  getTimedealList: () => axiosSsr.get<PmTimedealItemType[]>("/api/fo/ec/pm/event/timedeal").then((r) => r.data),

  /** GET /api/fo/ec/pm/event/page — 이벤트 목록(서버 페이징). eventStatusCd 로 진행중/종료 구분 */
  getPage: (params: { pageNo: number; pageSize: number; eventStatusCd?: string; sort?: string; searchValue?: string }) =>
    axiosSsr
      .get<PmEventPagedResult>("/api/fo/ec/pm/event/page", {
        params: {
          pageNo: params.pageNo,
          pageSize: params.pageSize,
          ...(params.eventStatusCd ? { eventStatusCd: params.eventStatusCd } : {}),
          ...(params.sort ? { sort: params.sort } : {}),
          ...(params.searchValue ? { searchValue: params.searchValue, searchType: "eventId,eventTitle" } : {}),
        },
      })
      .then((r) => r.data),

  /** GET /api/fo/ec/pm/event/{id} — 이벤트 상세(혜택/대상 포함) */
  getById: (id: string) => axiosSsr.get<PmEventDetailType>(`/api/fo/ec/pm/event/${encodeURIComponent(id)}`).then((r) => r.data),
};
