/**
 * syBrandSvc.ts — 브랜드 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoSyBrandController(/api/fo/ec/sy/brand, 공개, 2026-09-20 신설) 를 직접 부른다.
 * 예전에는 상품 1000건을 받아 브랜드를 즉석 집계했다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import type { SyBrandType } from "~/types/sy/syBrandType";

export const syBrandSvc = {
  /** GET /fo/ec/sy/brand — 사용 중 브랜드 목록. 상품 필터(brandIds)가 brandId 를 받으므로 brandCode 에도 brandId 를 담는다(기존 동작 유지) */
  getBrands: async (): Promise<SyBrandType[]> => {
    const rows = (await axiosCsr.get<SyBrandType[]>("/fo/ec/sy/brand")).data ?? [];
    return rows.map((b) => ({ brandId: b.brandId, brandCode: b.brandId, brandNm: b.brandNm }));
  },
};
