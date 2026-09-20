/**
 * coFaqSvc.ts — FAQ API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmFaqController(/api/fo/faq, 공개) + 경로 트리(/api/co/sy/path)를 직접 부른다. 트리 조립·목록 가공은 utils/mapFaq.ts.
 */
import { csrGet, csrList, csrPost, idPath } from "~/utils/svcHttp";
import { buildFaqPageQuery, buildFaqTree, mapFaqPage } from "~/utils/mapFaq";
import type { CmFaqPageParamsType } from "~/types/cm/cmFaqPageParamsType";
import type { CmFaqTreeType } from "~/types/cm/cmFaqTreeType";
import type { CmFaqType } from "~/types/cm/cmFaqType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { SyPathType } from "~/types/sy/syPathType";

export const coFaqSvc = {
  /** GET /co/sy/path/page(bizCd=cm_faq) + /fo/faq/list — 카테고리 경로 트리 + 경로별 FAQ 개수(하위 포함) */
  getTree: (): Promise<CmFaqTreeType> =>
    Promise.all([
      csrGet<CoBasePageType<SyPathType>>("/co/sy/path/page", { params: { bizCd: "cm_faq", pageNo: 1, pageSize: 500 } }),
      csrList<Pick<CmFaqType, "faqId" | "pathId">>("/fo/faq/list"),
    ]).then(([paths, faqs]) => buildFaqTree(paths.pageList ?? [], faqs)),

  /** GET /fo/faq/page — FAQ 목록(페이징, 카테고리 경로 필터) */
  getPage: (params: CmFaqPageParamsType): Promise<CoPagedResultType<CmFaqType>> => csrGet<CoBasePageType<CmFaqType>>("/fo/faq/page", { params: buildFaqPageQuery(params) }).then(mapFaqPage),

  /** POST /fo/faq/{id}/view — 조회수 +1, 증가된 조회수 반환 */
  incrView: (faqId: string): Promise<number> => csrPost<number>(idPath("/fo/faq", faqId, "/view"), {}),
};
