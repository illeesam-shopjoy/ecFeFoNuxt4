import { getAllProdPage } from "~~/server/utils/beProducts";
import { logger } from "~~/server/utils/logger";

interface CategoryTreeItem {
  categoryId: string;
  parentTitle: string;
  value: string;
  children: string[];
  img?: string;
  smDesc?: string;
}

/**
 * 홈 화면 "카테고리 둘러보기" 위젯용 트리. categories.get.ts와 같은 이유로 상품 목록에서
 * distinct 재구성(공개 API만 사용) — 실 스키마엔 이 위젯 전용 co_category_tree 개념이 없어서,
 * 최상위 카테고리를 parentTitle로, 그 하위 카테고리명들을 children[]으로 묶어 최대한 비슷하게 흉내낸다.
 * categoryIdToName은 예전 Prisma 스키마의 별도 테이블이었는데 실 스키마엔 대응이 없어 빈 객체로 둔다
 * (카테고리명은 이미 각 항목의 parentTitle/children에 다 들어있어 프론트에서 추가 조회 불필요).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  // 2026-09-13: prod/page.get.ts와 캐시 공유(beProducts.ts) — 같은 무거운 쿼리 중복 호출 방지.
  const page = await getAllProdPage();
  const nameById = new Map<string, string>();
  const parentOf = new Map<string, string | undefined>();
  for (const p of page.pageList) {
    if (!p.categoryId) continue;
    if (!nameById.has(p.categoryId)) nameById.set(p.categoryId, p.cateNm ?? p.categoryId);
    parentOf.set(p.categoryId, p.parentCategoryId ?? undefined);
  }

  const childrenByParent = new Map<string, string[]>();
  for (const [id, parentId] of parentOf) {
    if (!parentId) continue;
    if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
    childrenByParent.get(parentId)!.push(nameById.get(id) ?? id);
  }

  const topLevelIds = [...nameById.keys()].filter((id) => !parentOf.get(id));
  const categoryTree: CategoryTreeItem[] = topLevelIds.slice(0, 6).map((id) => ({
    categoryId: id,
    parentTitle: nameById.get(id) ?? id,
    value: id,
    children: childrenByParent.get(id) ?? [],
  }));

  const out = { categoryTree, categoryIdToName: {} as Record<string, string> };
  const s = JSON.stringify(out);
  logger.info("[api] ◀", method, url, s.length > 200 ? s.slice(0, 200) + "..." : s);
  return out;
});
