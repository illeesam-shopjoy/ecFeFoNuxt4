import { beApi, type BePage } from "~~/server/utils/beApi";
import { cachedCall } from "~~/server/utils/cache";
import { cdnCache } from "~~/server/utils/cdnCache";
import { logger } from "~~/server/utils/logger";

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

export interface FaqTreeNode {
  id: string;
  label: string;
  count: number;
  children: { id: string; label: string; count: number }[];
}

/**
 * FAQ 분류 트리(+건수 배지). ecBeBo 의 sy_path(biz_cd=cm_faq) 분류와 공개 FAQ 목록에서 만든다.
 * 2026-09-19 — ecFeBo(Faq.js) 의 cfTree/fnCountFor 를 그대로 서버에서 계산해 내려준다:
 *   대분류 → 중분류 2계층, 각 노드의 건수는 그 노드의 모든 자손을 포함한 FAQ 수, total 은 전체 FAQ 수.
 * /fo/faq/list 는 답변 본문(이미지 base64 포함)까지 담긴 무거운 응답이라 faqId/pathId 만 남기고 버린다 — 5분 캐시.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const out = await cachedCall("be:faq:tree", 300_000, async () => {
    const [pathPage, faqs] = await Promise.all([
      beApi.get<BePage<BePathRow>>("/co/sy/path/page", { bizCd: "cm_faq", pageNo: 1, pageSize: 500 }, undefined, 8000),
      beApi.get<BeFaqRow[]>("/fo/faq/list", undefined, undefined, 15000),
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

    // 노드 + 모든 자손 pathId
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

    const tree: FaqTreeNode[] = (byParent.get("__root__") ?? [])
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
  });

  logger.info("[api] ◀", method, url, "roots=" + out.tree.length + " total=" + out.total);
  cdnCache(event, 300);
  return out;
});
