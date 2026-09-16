/**
 * foPmEventSvc.ts — FO 이벤트 API 호출 객체 (2026-09 타임딜 기능 신설로 추가).
 */
import { axiosSsr } from "~/utils/axiosSsr";
import type { PmTimedealItemType } from "~/types/pmTimedealType";

export const foPmEventSvc = {
  /** GET /api/fo/ec/pm/event/timedeal — 진행중인 FLASH 이벤트의 타임딜 항목 목록 */
  getTimedealList: () => axiosSsr.get<PmTimedealItemType[]>("/api/fo/ec/pm/event/timedeal").then((r) => r.data),
};
