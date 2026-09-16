/**
 * foPmPlanSvc.ts — FO 기획전 API 호출 객체 (2026-09 신설, 이전엔 FO 공개 API 자체가 없었음).
 */
import { axiosSsr } from "~/utils/axiosSsr";
import type { PmTimedealItemType } from "~/types/pmTimedealType";

export const foPmPlanSvc = {
  /** GET /api/fo/ec/pm/plan/timedeal — 진행중인 기획전의 타임딜 항목 목록 */
  getTimedealList: () => axiosSsr.get<PmTimedealItemType[]>("/api/fo/ec/pm/plan/timedeal").then((r) => r.data),
};
