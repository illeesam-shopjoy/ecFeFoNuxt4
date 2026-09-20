/**
 * foPmPlanSvc.ts — 기획전(pm_plan) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPmPlanController(/api/fo/ec/pm/plan, 공개) 를 직접 부른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import type { PmTimedealItemType } from "~/types/pm/pmTimedealType";

export const foPmPlanSvc = {
  /** GET /fo/ec/pm/plan/timedeal — 타임딜 기획전 목록 */
  getTimedealList: async (): Promise<PmTimedealItemType[]> => (await axiosCsr.get<PmTimedealItemType[]>("/fo/ec/pm/plan/timedeal")).data,
};
