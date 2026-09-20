/**
 * syBrandSvc.ts — 브랜드 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoSyBrandController(/api/fo/ec/sy/brand, 공개, 2026-09-20 신설) 를 직접 부른다.
 */
import { csrList } from "~/utils/svcHttp";
import { mapBrands } from "~/utils/mapMaster";
import type { SyBrandType } from "~/types/sy/syBrandType";

export const syBrandSvc = {
  /** GET /fo/ec/sy/brand — 사용 중 브랜드 목록 */
  getBrands: (): Promise<SyBrandType[]> => csrList<SyBrandType>("/fo/ec/sy/brand").then(mapBrands),
};
