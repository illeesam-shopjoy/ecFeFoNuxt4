/**
 * coFaqSvc.ts — FAQ API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmFaqController(/api/fo/faq, 공개) + 경로 트리(/api/co/sy/path)를 직접 부른다. 트리 조립·목록 가공은 utils/mapFaq.ts.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { buildFaqTree, mapFaqPage } from "~/utils/mapFaq";
import type { CmFaqType } from "~/types/cm/cmFaqType";
import type { CmFaqTreeType } from "~/types/cm/cmFaqTreeType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { SyPathType } from "~/types/sy/syPathType";

export const coFaqSvc = {
  /** GET /co/sy/path/page(bizCd=cm_faq) + /fo/faq/list — 카테고리 경로 트리 + 경로별 FAQ 개수(하위 포함) */
  getTree: async (): Promise<CmFaqTreeType> => {
    const [pathPage, faqs] = await Promise.all([
      axiosCsr.get<CoBasePageType<SyPathType>>("/co/sy/path/page", { params: { bizCd: "cm_faq", pageNo: 1, pageSize: 500 } }).then((r) => r.data),
      axiosCsr.get<Pick<CmFaqType, "faqId" | "pathId">[]>("/fo/faq/list").then((r) => r.data),
    ]);
    return buildFaqTree(pathPage.pageList ?? [], faqs ?? []);
  },

  /** GET /fo/faq/page — FAQ 목록(페이징, 카테고리 경로 필터) */
  getPage: async (params: { pageNo: number; pageSize: number; pathId?: string | null }): Promise<CoPagedResultType<CmFaqType>> =>
    mapFaqPage((await axiosCsr.get<CoBasePageType<CmFaqType>>("/fo/faq/page", { params: { pageNo: params.pageNo, pageSize: params.pageSize, ...(params.pathId ? { pathId: params.pathId } : {}) } })).data),

  /** POST /fo/faq/{id}/view — 조회수 +1, 증가된 조회수 반환 */
  incrView: async (faqId: string): Promise<number> => (await axiosCsr.post<number>(`/fo/faq/${encodeURIComponent(faqId)}/view`, {})).data,
};
