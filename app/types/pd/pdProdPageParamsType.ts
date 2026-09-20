/** 상품 목록 조회 조건(GET /fo/ec/pd/prod/page 로 변환되기 전의 화면 입력). */
export interface PdProdPageParamsType {
  pageNo: number;
  pageSize?: number;
  categoryIds?: string[]; // 전부 다중선택 배열
  brandIds?: string[];
  sizeCds?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: string; // ecBeBo buildOrder 허용 컬럼: "prodNm asc" | "regDate desc" | "prodId asc" | "salePrice asc/desc"
  keyword?: string; // 상품명 키워드 검색
}
