/**
 * pdProductSvc.ts — 상품 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘") —
 * shop.vue/useProductsStore.ts/prod-dtl/*.vue/adminEc/products/*.vue가 각자
 * "/api/fo/ec/pd/prod/..." 문자열을 그대로 axios/$fetch에 박아 호출하던 걸 한 곳으로 모음.
 * 폴더 위치(svc/fo/ec/pd/)는 실제 라우트 경로(server/api/fo/ec/pd/*)를 그대로 따른다.
 * SSR/CSR 어느 쪽에서 불러도 되도록 axiosSsr을 쓴다(SSR은 절대경로, CSR은 상대경로로
 * 자동 처리 — server/utils/axiosSsr.ts 참조).
 */
import { axiosSsr } from "~/utils/axiosSsr";
import { type PdProductType } from "~/types/pdProductType";

/** GET /api/fo/ec/pd/prod/page?pageNo=... 응답(페이징 모드) — server/api/fo/ec/pd/prod/page.get.ts 참조 */
export interface PdProductPagedResult {
  items: PdProductType[];
  pageNo: number;
  pageSize: number;
  pageTotalCount: number;
  pageTotalPage: number;
  hasMore: boolean;
}

export interface PdProductPageParams {
  pageNo: number;
  pageSize?: number;
  /** 2026-09-13(요청사항: "좌측 항목은 가급적 멀티 선택할 수 있도록") — 전부 다중선택 배열 */
  categoryIds?: string[];
  brandIds?: string[];
  sizeCds?: string[];
  priceMin?: number;
  priceMax?: number;
  /** ecBeBo buildOrder가 허용하는 컬럼만 유효: "prodNm asc" | "regDate desc" | "prodId asc" | "salePrice asc/desc" */
  sort?: string;
  /** 상품명 키워드 검색 */
  keyword?: string;
}

export const pdProductSvc = {
  /**
   * GET /api/fo/ec/pd/prod/page — 상품 전체 목록(캐시된 "거의 전체" 모드, 쿼리 없음).
   * useProductsStore(홈 화면 인기상품/베스트/장바구니 등)가 쓰는 기존 방식 — 그대로 유지.
   */
  getPage: () => axiosSsr.get<PdProductType[]>("/api/fo/ec/pd/prod/page").then((r) => r.data),

  /**
   * 2026-09-13(요청사항: "10000개가 될수도 있기에 페이징 api 조회") 추가 — 진짜 서버 페이징/필터
   * 모드(같은 라우트, pageNo 쿼리 유무로 서버가 분기). /shop 페이지 전용, useProductsStore와
   * 무관한 로컬 상태(useShopProducts.ts)에서만 사용 — 다른 화면(홈 등)에 영향 없음.
   * 배열은 콤마 조합 문자열로 보낸다(axios 배열 직렬화 방식이 서버 파싱과 안 맞을 위험 방지 —
   * server/api/fo/ec/pd/prod/page.get.ts에서 다시 split해 ecBeBo에 반복 파라미터로 전달).
   */
  getPaged: (params: PdProductPageParams) => {
    const q: Record<string, string | number> = { pageNo: params.pageNo, pageSize: params.pageSize ?? 12 };
    if (params.categoryIds?.length) q.categoryIds = params.categoryIds.join(",");
    if (params.brandIds?.length) q.brandIds = params.brandIds.join(",");
    if (params.sizeCds?.length) q.sizeCds = params.sizeCds.join(",");
    if (params.priceMin != null) q.priceMin = params.priceMin;
    if (params.priceMax != null) q.priceMax = params.priceMax;
    if (params.sort) q.sort = params.sort;
    if (params.keyword) q.keyword = params.keyword;
    return axiosSsr.get<PdProductPagedResult>("/api/fo/ec/pd/prod/page", { params: q }).then((r) => r.data);
  },

  /** GET /api/fo/ec/pd/prod/{id} — 상품 단건 */
  getById: (id: string) => axiosSsr.get<PdProductType>(`/api/fo/ec/pd/prod/${id}`).then((r) => r.data),
};
