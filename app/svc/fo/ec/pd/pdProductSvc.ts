/**
 * pdProductSvc.ts — 상품 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 *
 * 2026-09-20: BFF(server/api) 경유를 없애고 ecBeBo FoPdProdController(/api/fo/ec/pd/prod)를 직접 부른다.
 * 조회 조건 변환·응답 가공(mapProduct/리뷰 병합)은 utils/mapProduct.ts — 여기서는 호출만 한다.
 * SEO 단위화면(/shop, /prod-dtl/[id])의 **서버 렌더링**만 server/api 를 거친다 — 그쪽은 화면 코드에서 axiosSsr 로 부른다.
 */
import { csrGet, idPath } from "~/utils/svcHttp";
import { beConfig } from "~/utils/beConfig";
import { EMPTY_REVIEWS, buildProdPageQuery, mapProdDetail, mapProdPage, mapQnaList } from "~/utils/mapProduct";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { PdProdPageParamsType } from "~/types/pd/pdProdPageParamsType";
import type { PdProdQnaListRawType } from "~/types/pd/pdProdQnaListRawType";
import type { PdProdQnaType } from "~/types/pd/pdProdQnaType";
import type { PdProdRawType } from "~/types/pd/pdProdRawType";
import type { PdProdType } from "~/types/pd/pdProdType";
import type { PdReviewsRawType } from "~/types/pd/pdReviewRawType";

const PROD = "/fo/ec/pd/prod";

export const pdProductSvc = {
  /** GET /fo/ec/pd/prod/page — 서버 페이징/멀티선택 필터 상품 목록 */
  getPaged: (params: PdProdPageParamsType): Promise<CoPagedResultType<PdProdType>> =>
    csrGet<CoBasePageType<PdProdRawType>>(`${PROD}/page`, { params: buildProdPageQuery(params) }).then((page) => mapProdPage(page, beConfig.cdnBase)),

  /** GET /fo/ec/pd/prod/{id}/qna — 상품 Q&A 목록(조회 전용, 공개) */
  getQna: (id: string, pageSize = 20): Promise<PdProdQnaType[]> =>
    csrGet<PdProdQnaListRawType>(idPath(PROD, id, "/qna"), { params: { pageNo: 1, pageSize } }).then((r) => mapQnaList(r?.qnaPage?.pageList ?? [], beConfig.cdnBase)),

  /** GET /fo/ec/pd/prod/{id} + /{id}/reviews — 상품 단건(리뷰·평점 병합). 리뷰 조회 실패는 빈 리뷰로 대체 */
  getById: (id: string): Promise<PdProdType> =>
    Promise.all([
      csrGet<PdProdRawType>(idPath(PROD, id)),
      csrGet<PdReviewsRawType>(idPath(PROD, id, "/reviews"), { params: { pageSize: 50 } }).catch(() => EMPTY_REVIEWS),
    ]).then(([detail, reviews]) => mapProdDetail(detail, reviews, beConfig.cdnBase)),
};
