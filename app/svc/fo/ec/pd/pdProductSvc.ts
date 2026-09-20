/**
 * pdProductSvc.ts — 상품 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 *
 * 2026-09-20: BFF(server/api) 경유를 없애고 ecBeBo FoPdProdController(/api/fo/ec/pd/prod)를 직접 부른다.
 * 예전 server/api/fo/ec/pd/prod/{page,[id]}.get.ts 가 하던 가공(쿼리 매핑, mapProduct, 리뷰 병합)을 여기서 한다.
 * SEO 단위화면(/shop, /prod-dtl/[id])의 **서버 렌더링**만 server/api 를 거친다 — 그쪽은 화면 코드에서 axiosSsr 로 부른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { mapProduct, mapReview, type BeProdItem, type BeReviewItem } from "~/utils/mapProduct";
import { beConfig } from "~/utils/beConfig";
import { type PdProductType } from "~/types/pdProductType";

/** 목록 응답(페이징) — SSR 라우트(server/api/fo/ec/pd/prod/page.get.ts)와 같은 모양 */
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

interface BePage<T> {
  pageList: T[];
  pageTotalCount: number;
  pageTotalPage: number;
  pageNo: number;
  pageSize: number;
}

/** 상품 Q&A 1건 (ecBeBo PdProdQnaDto.Item 중 화면에 쓰는 필드) */
export interface PdQnaItem {
  prodQnaId: string;
  memberId?: string | null;
  prodQnaTitle?: string | null;
  prodQnaContent?: string | null;
  scrtYn?: string | null; // 비밀글 Y/N
  answYn?: string | null; // 답변여부 Y/N
  answContent?: string | null;
  regDate?: string | null;
}

interface BeReviewsResponse {
  summary: { avgRating?: number; reviewCount?: number };
  reviewPage: { pageList: BeReviewItem[]; pageTotalCount: number };
}

export const pdProductSvc = {
  /** GET /fo/ec/pd/prod/page — 서버 페이징/멀티선택 필터 상품 목록 */
  getPaged: async (params: PdProductPageParams): Promise<PdProductPagedResult> => {
    const q: Record<string, unknown> = { pageNo: params.pageNo, pageSize: params.pageSize ?? 12, useYn: "Y" };
    if (params.categoryIds?.length) q.categoryIds = params.categoryIds;
    if (params.brandIds?.length) q.brandIds = params.brandIds;
    if (params.sizeCds?.length) q.sizeInfoCds = params.sizeCds;
    if (params.priceMin != null) q.priceMin = params.priceMin;
    if (params.priceMax != null) q.priceMax = params.priceMax;
    if (params.sort) q.sort = params.sort;
    if (params.keyword) {
      q.searchType = "prodNm";
      q.searchValue = params.keyword;
    }
    const page = (await axiosCsr.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", { params: q })).data;
    const base = beConfig.cdnBase;
    return {
      items: page.pageList.map((p) => mapProduct(p, base) as unknown as PdProductType),
      pageNo: page.pageNo,
      pageSize: page.pageSize,
      pageTotalCount: page.pageTotalCount,
      pageTotalPage: page.pageTotalPage,
      hasMore: page.pageNo < page.pageTotalPage,
    };
  },

  /** GET /fo/ec/pd/prod/{id}/qna — 상품 Q&A 목록(조회 전용, 공개). 응답은 { qnaPage: { pageList } } */
  getQna: async (id: string, pageSize = 20): Promise<PdQnaItem[]> => {
    const r = (await axiosCsr.get<{ qnaPage?: { pageList?: PdQnaItem[] } }>(`/fo/ec/pd/prod/${encodeURIComponent(id)}/qna`, { params: { pageNo: 1, pageSize } })).data;
    return r?.qnaPage?.pageList ?? [];
  },

  /** GET /fo/ec/pd/prod/{id} + /{id}/reviews — 상품 단건(리뷰·평점 병합). 리뷰 조회 실패는 빈 리뷰로 대체 */
  getById: async (id: string): Promise<PdProductType> => {
    const [detail, reviewsRes] = await Promise.all([
      axiosCsr.get<BeProdItem>(`/fo/ec/pd/prod/${encodeURIComponent(id)}`).then((r) => r.data),
      axiosCsr
        .get<BeReviewsResponse>(`/fo/ec/pd/prod/${encodeURIComponent(id)}/reviews`, { params: { pageSize: 50 } })
        .then((r) => r.data)
        .catch(() => ({ summary: {}, reviewPage: { pageList: [], pageTotalCount: 0 } }) as BeReviewsResponse),
    ]);
    const out = mapProduct(detail, beConfig.cdnBase);
    out.reviews = reviewsRes.reviewPage.pageList.map(mapReview);
    if (typeof reviewsRes.summary?.avgRating === "number") out.rating = reviewsRes.summary.avgRating;
    return out as unknown as PdProductType;
  },
};
