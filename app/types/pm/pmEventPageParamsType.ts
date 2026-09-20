/** 이벤트 목록 조회 조건(화면 → utils/mapEvent.buildEventPageQuery) */
export interface PmEventPageParamsType {
  pageNo: number;
  pageSize: number;
  eventStatusCd?: string;
  sort?: string;
  searchValue?: string;
}
