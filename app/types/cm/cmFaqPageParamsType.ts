/** FAQ 목록 조회 조건 (utils/mapFaq.buildFaqPageQuery) */
export interface CmFaqPageParamsType {
  pageNo: number;
  pageSize: number;
  pathId?: string | null;
}
