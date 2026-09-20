/** mapCategory.ts — 카테고리 평탄 목록 → 트리·하위 id 맵 조립 (svc 는 조회만). */
import type { PdCategoryType } from "~/types/pd/pdCategoryType";
import type { PdCategoryTreeItemType, PdCategoryTreeResType } from "~/types/pd/pdCategoryTreeType";

// 카테고리 마스터에 배너 이미지가 없을 때 쓰는 CDN 배너(실존 파일 banner-sm-1~5) — 앞 카테고리부터 순서대로 배정.
const BANNER_IMG_FILES = ["banner-sm-1.jpg", "banner-sm-2.jpg", "banner-sm-3.jpg", "banner-sm-4.jpg", "banner-sm-5.jpg"];

/** GET /fo/ec/pd/category 결과 → 최상위 카테고리 최대 6개 + 각 하위 카테고리 트리 */
export function buildCategoryTree(rows: PdCategoryType[], cdnBase: string): PdCategoryTreeResType {
  const nameById: Record<string, string> = Object.fromEntries(rows.map((c) => [c.categoryId, c.categoryNm]));
  const childrenByParent = new Map<string, { id: string; name: string }[]>();
  for (const c of rows) {
    if (!c.parentCategoryId) continue;
    const list = childrenByParent.get(c.parentCategoryId) ?? [];
    list.push({ id: c.categoryId, name: c.categoryNm });
    childrenByParent.set(c.parentCategoryId, list);
  }

  const categoryTree: PdCategoryTreeItemType[] = rows
    .filter((c) => !c.parentCategoryId)
    .slice(0, 6)
    .map((c, idx) => ({
      categoryId: c.categoryId,
      categoryNm: c.categoryNm,
      parentCategoryId: c.parentCategoryId ?? undefined,
      categoryDepth: c.categoryDepth ?? 1,
      sortOrd: c.sortOrd ?? undefined,
      imgUrl: c.imgUrl ?? undefined,
      categoryDesc: c.categoryDesc ?? undefined,
      parentTitle: c.categoryNm,
      value: c.categoryId,
      children: childrenByParent.get(c.categoryId) ?? [],
      img: c.imgUrl || (BANNER_IMG_FILES[idx] ? `${cdnBase}/cdn/prod/img/shop/banner/${BANNER_IMG_FILES[idx]}` : ""),
      smDesc: c.categoryDesc ?? undefined,
    }));

  // 자기 자신 + 모든 깊이의 하위 id (트리 깊이 제한 없음)
  const descendants = (id: string): string[] => [id, ...(childrenByParent.get(id) ?? []).flatMap((c) => descendants(c.id))];
  const categoryIdToDescendants = Object.fromEntries(rows.map((c) => [c.categoryId, descendants(c.categoryId)]));

  return { categoryTree, categoryIdToName: nameById, categoryIdToDescendants };
}
