/**
 * syBrandSvc.ts — 브랜드 목록 API 호출 객체.
 * 2026-09-13(요청사항: "브랜드 상품아이디만 보이는데 브랜드명이 보여야해" 후속 —
 * "페이징 api 조회로 통일") — /shop 사이드바 브랜드 필터가 더 이상 store.products
 * 전체를 스캔하지 않고 이 전용 엔드포인트(server/api/fo/ec/sy/brand.get.ts, 10분 캐시)로
 * brandId+brandNm 쌍을 직접 받는다.
 */
import { axiosSsr } from "~/utils/axiosSsr";
import type { CoBrandType } from "~/types/coBrandType";

export const syBrandSvc = {
  /** GET /api/fo/ec/sy/brand — 브랜드 목록(brandId, brandNm) */
  getBrands: () => axiosSsr.get<CoBrandType[]>("/api/fo/ec/sy/brand").then((r) => r.data),
};
