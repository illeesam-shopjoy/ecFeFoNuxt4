/** mapFaq.ts — FAQ 분류 트리 조립·목록 가공 (svc 는 조회만). */
import type { CmFaqPageParamsType } from "~/types/cm/cmFaqPageParamsType";
import type { CmFaqType } from "~/types/cm/cmFaqType";
import type { CmFaqTreeNodeType, CmFaqTreeType } from "~/types/cm/cmFaqTreeType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { SyPathType } from "~/types/sy/syPathType";

/** 분류 경로(sy_path, biz_cd=cm_faq) + FAQ 목록 → 분류 트리(대/중분류)와 하위 포함 건수 */
export function buildFaqTree(pathRows: SyPathType[], faqRows: Pick<CmFaqType, "faqId" | "pathId">[]): CmFaqTreeType {
  const rows = pathRows.map((r) => ({
    id: String(r.pathId),
    parentId: r.parentPathId != null ? String(r.parentPathId) : null,
    label: r.pathLabel ?? "",
    sortOrd: r.sortOrd ?? 0,
  }));
  const faqPathIds = faqRows.map((f) => (f.pathId != null ? String(f.pathId) : ""));

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

  const tree: CmFaqTreeNodeType[] = (byParent.get("__root__") ?? [])
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
}

/** FAQ 페이징 응답 → 화면용(조회수·분류 기본값 보정) */
export function mapFaqPage(page: CoBasePageType<CmFaqType>): CoPagedResultType<CmFaqType> {
  return {
    items: (page.pageList ?? []).map((f) => ({ ...f, viewCount: f.viewCount ?? 0, pathId: f.pathId != null ? String(f.pathId) : "", pathLabel: f.pathLabel ?? "" })),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };
}

/** 화면 조회 조건 → GET /fo/faq/page 쿼리 (경로 필터는 값이 있을 때만) */
export const buildFaqPageQuery = (params: CmFaqPageParamsType): Record<string, unknown> => ({
  pageNo: params.pageNo,
  pageSize: params.pageSize,
  ...(params.pathId ? { pathId: params.pathId } : {}),
});
