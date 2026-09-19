/**
 * coFaqSvc.ts — FAQ API 호출 객체 (2026-09-19, ecFeBo Faq.js 이식).
 * 폴더 위치(svc/fo/ec/cm/)는 실제 라우트 경로(server/api/fo/ec/cm/faq/*)를 그대로 따른다.
 */
import { axiosSsr } from "~/utils/axiosSsr";

export interface FaqTreeNodeType {
  id: string;
  label: string;
  count: number;
  children: { id: string; label: string; count: number }[];
}
export interface FaqTreeType {
  total: number;
  tree: FaqTreeNodeType[];
}
export interface FaqItemType {
  faqId: string;
  q: string;
  a: string;
  viewCount: number;
  pathId: string;
  cate: string;
}
export interface FaqPagedResult {
  items: FaqItemType[];
  pageNo: number;
  pageSize: number;
  pageTotalCount: number;
  pageTotalPage: number;
}

export const coFaqSvc = {
  /** GET /api/fo/ec/cm/faq/tree — 분류 트리(+건수) */
  getTree: () => axiosSsr.get<FaqTreeType>("/api/fo/ec/cm/faq/tree").then((r) => r.data),

  /** GET /api/fo/ec/cm/faq/page — 분류(pathId, 자손 포함) 필터 서버 페이징 */
  getPage: (params: { pageNo: number; pageSize: number; pathId?: string | null }) =>
    axiosSsr
      .get<FaqPagedResult>("/api/fo/ec/cm/faq/page", { params: { pageNo: params.pageNo, pageSize: params.pageSize, ...(params.pathId ? { pathId: params.pathId } : {}) } })
      .then((r) => r.data),

  /** POST /api/fo/ec/cm/faq/{id}/view — 조회수 +1, 갱신된 조회수를 돌려준다 */
  incrView: (faqId: string) => axiosSsr.post<number>(`/api/fo/ec/cm/faq/${encodeURIComponent(faqId)}/view`, {}).then((r) => r.data),
};
