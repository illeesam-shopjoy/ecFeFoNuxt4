/**
 * coFaqSvc.ts — FAQ API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmFaqController(/api/fo/faq, 공개) + 경로 트리(/api/co/sy/path)를 직접 부른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";

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

interface BePage<T> {
  pageList: T[];
  pageTotalCount: number;
  pageTotalPage: number;
  pageNo: number;
  pageSize: number;
}
interface BePathRow {
  pathId: string | number;
  parentPathId: string | number | null;
  pathLabel: string;
  sortOrd?: number | null;
}
interface BeFaqRow {
  faqId: string;
  pathId: string | number | null;
}
interface BeFaqItem {
  faqId: string;
  faqQuestion: string;
  faqAnswer?: string | null;
  viewCount?: number | null;
  pathId?: string | number | null;
  pathLabel?: string | null;
}

export const coFaqSvc = {
  /** GET /co/sy/path/page(bizCd=cm_faq) + /fo/faq/list — 카테고리 경로 트리 + 경로별 FAQ 개수(하위 포함) */
  getTree: async (): Promise<FaqTreeType> => {
    const [pathPage, faqs] = await Promise.all([
      axiosCsr.get<BePage<BePathRow>>("/co/sy/path/page", { params: { bizCd: "cm_faq", pageNo: 1, pageSize: 500 } }).then((r) => r.data),
      axiosCsr.get<BeFaqRow[]>("/fo/faq/list").then((r) => r.data),
    ]);
    const rows = (pathPage.pageList ?? []).map((r) => ({
      id: String(r.pathId),
      parentId: r.parentPathId != null ? String(r.parentPathId) : null,
      label: r.pathLabel,
      sortOrd: r.sortOrd ?? 0,
    }));
    const faqPathIds = (faqs ?? []).map((f) => (f.pathId != null ? String(f.pathId) : ""));

    const byParent = new Map<string, typeof rows>();
    rows.forEach((r) => {
      const k = r.parentId ?? "__root__";
      byParent.set(k, [...(byParent.get(k) ?? []), r]);
    });
    const sortFn = (a: (typeof rows)[number], b: (typeof rows)[number]) => a.sortOrd - b.sortOrd || a.label.localeCompare(b.label, "ko");

    // 자기 자신 + 모든 하위 경로 id
    const descendantIds = (id: string): Set<string> => {
      const ids = new Set<string>([id]);
      let added = true;
      while (added) {
        added = false;
        rows.forEach((r) => {
          if (r.parentId && ids.has(r.parentId) && !ids.has(r.id)) {
            ids.add(r.id);
            added = true;
          }
        });
      }
      return ids;
    };
    const countFor = (id: string) => {
      const ids = descendantIds(id);
      return faqPathIds.filter((p) => ids.has(p)).length;
    };

    const tree: FaqTreeNodeType[] = (byParent.get("__root__") ?? [])
      .slice()
      .sort(sortFn)
      .map((root) => ({
        id: root.id,
        label: root.label,
        count: countFor(root.id),
        children: (byParent.get(root.id) ?? [])
          .slice()
          .sort(sortFn)
          .map((ch) => ({ id: ch.id, label: ch.label, count: countFor(ch.id) })),
      }));
    return { total: faqPathIds.length, tree };
  },

  /** GET /fo/faq/page — FAQ 목록(페이징, 카테고리 경로 필터) */
  getPage: async (params: { pageNo: number; pageSize: number; pathId?: string | null }): Promise<FaqPagedResult> => {
    const q: Record<string, unknown> = { pageNo: params.pageNo, pageSize: params.pageSize };
    if (params.pathId) q.pathId = params.pathId;
    const page = (await axiosCsr.get<BePage<BeFaqItem>>("/fo/faq/page", { params: q })).data;
    return {
      items: (page.pageList ?? []).map((f) => ({
        faqId: f.faqId,
        q: f.faqQuestion,
        a: f.faqAnswer ?? "",
        viewCount: f.viewCount ?? 0,
        pathId: f.pathId != null ? String(f.pathId) : "",
        cate: f.pathLabel ?? "",
      })),
      pageNo: page.pageNo,
      pageSize: page.pageSize,
      pageTotalCount: page.pageTotalCount,
      pageTotalPage: page.pageTotalPage,
    };
  },

  /** POST /fo/faq/{id}/view — 조회수 +1, 증가된 조회수 반환 */
  incrView: async (faqId: string): Promise<number> => (await axiosCsr.post<number>(`/fo/faq/${encodeURIComponent(faqId)}/view`, {})).data,
};
