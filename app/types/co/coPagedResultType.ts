/** 화면용 페이징 결과 공통 형태 — ecBeBo 페이징 응답(CoBasePageType)을 items/hasMore 로 가공한 값. 상품·블로그·FAQ·이벤트 목록이 함께 쓴다. */
export interface CoPagedResultType<T> {
  items: T[]; // 현재 페이지 항목
  pageNo: number; // 현재 페이지(1부터)
  pageSize: number; // 페이지 크기
  pageTotalCount: number; // 전체 건수
  pageTotalPage: number; // 전체 페이지 수
  hasMore: boolean; // 다음 페이지 존재 여부(더보기 스크롤용)
}
