/** ecBeBo 페이징 응답 공통 형태(BasePage) — svc 마다 로컬로 정의하던 BePage<T>/MyPageResult<T> 를 하나로 합쳤다. */
export interface CoBasePageType<T> {
  pageList: T[]; // 현재 페이지 목록
  pageTotalCount: number; // 전체 건수
  pageTotalPage: number; // 전체 페이지 수
  pageNo: number; // 현재 페이지(1부터)
  pageSize: number; // 페이지 크기
}
