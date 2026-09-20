/**
 * pdProductSvc.ts — 상품 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 *
 * 2026-09-20: BFF(server/api) 경유를 없애고 ecBeBo FoPdProdController(/api/fo/ec/pd/prod)를 직접 부른다.
 * 조회 조건 변환·응답 가공(mapProduct/리뷰 병합)은 utils/mapProduct.ts — 여기서는 호출만 한다.
 * SEO 단위화면(/shop, /prod-dtl/[id])의 **서버 렌더링**만 server/api 를 거친다 — 그쪽은 화면 코드에서 axiosSsr 로 부른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { beConfig } from "~/utils/beConfig";
import { buildProdPageQuery, mapProdDetail, mapProdPage, mapQnaList, type BeProdItem, type BeReviewsResponse } from "~/utils/mapProduct";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { PdProdPageParamsType } from "~/types/pd/pdProdPageParamsType";
import type { PdProdQnaRawType, PdProdQnaType } from "~/types/pd/pdProdQnaType";
import type { PdProdType } from "~/types/pd/pdProdType";

const EMPTY_REVIEWS: BeReviewsResponse = { summary: {}, reviewPage: { pageList: [], pageTotalCount: 0 } };
const prodUrl = (id: string) => `/fo/ec/pd/prod/${encodeURIComponent(id)}`;

export const pdProductSvc = {
  /** GET /fo/ec/pd/prod/page — 서버 페이징/멀티선택 필터 상품 목록 */
  getPaged: async (params: PdProdPageParamsType): Promise<CoPagedResultType<PdProdType>> =>
    mapProdPage((await axiosCsr.get<CoBasePageType<BeProdItem>>("/fo/ec/pd/prod/page", { params: buildProdPageQuery(params) })).data, beConfig.cdnBase),

  /** GET /fo/ec/pd/prod/{id}/qna — 상품 Q&A 목록(조회 전용, 공개). 응답은 { qnaPage: { pageList } } */
  getQna: async (id: string, pageSize = 20): Promise<PdProdQnaType[]> => {
    const r = (await axiosCsr.get<{ qnaPage?: { pageList?: PdProdQnaRawType[] } }>(`${prodUrl(id)}/qna`, { params: { pageNo: 1, pageSize } })).data;
    return mapQnaList(r?.qnaPage?.pageList ?? [], beConfig.cdnBase);
  },

  /** GET /fo/ec/pd/prod/{id} + /{id}/reviews — 상품 단건(리뷰·평점 병합). 리뷰 조회 실패는 빈 리뷰로 대체 */
  getById: async (id: string): Promise<PdProdType> => {
    const [detail, reviews] = await Promise.all([
      axiosCsr.get<BeProdItem>(prodUrl(id)).then((r) => r.data),
      axiosCsr
        .get<BeReviewsResponse>(`${prodUrl(id)}/reviews`, { params: { pageSize: 50 } })
        .then((r) => r.data)
        .catch(() => EMPTY_REVIEWS),
    ]);
    return mapProdDetail(detail, reviews, beConfig.cdnBase);
  },
};
