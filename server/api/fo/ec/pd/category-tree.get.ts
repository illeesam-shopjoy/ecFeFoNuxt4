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
// 2026-09-13(요청사항: "3개 못찾은 이미지 ... 이경로로 맞춰줘") — 카테고리 배너 이미지는
// 실 스키마에 카테고리별 이미지 컬럼이 없어(위 클래스 주석 참조) 예전 Prisma 시절
// co_category_tree.sql 시드에 있던 "/cdn/img/shop/banner/banner-sm-N.jpg"(프론트 로컬
// 데모 정적경로) 값이 그대로 쓰였는데, 실제 그 파일은 로컬 데모 assets가 아니라 CDN
// 서버(ecBeCdn, prod/img/shop/banner/)에 올라가 있어 항상 404였다. 실존 파일(banner-sm-1~5)
// 순서대로 앞의 카테고리들에 배정 — CategoryArea.vue(.slice(0,3))·home-7.vue(.slice(3,6))가
// 이 순서대로 소비한다.
const BANNER_IMG_FILES = ["banner-sm-1.jpg", "banner-sm-2.jpg", "banner-sm-3.jpg", "banner-sm-4.jpg", "banner-sm-5.jpg"];

export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const { public: { prodCdnBase } } = useRuntimeConfig();

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
  const categoryTree: CategoryTreeItem[] = topLevelIds.slice(0, 6).map((id, idx) => ({
    categoryId: id,
    parentTitle: nameById.get(id) ?? id,
    value: id,
    children: childrenByParent.get(id) ?? [],
    img: BANNER_IMG_FILES[idx] ? `${prodCdnBase}/prod/img/shop/banner/${BANNER_IMG_FILES[idx]}` : undefined,
  }));

  const out = { categoryTree, categoryIdToName: {} as Record<string, string> };
  const s = JSON.stringify(out);
  logger.info("[api] ◀", method, url, s.length > 200 ? s.slice(0, 200) + "..." : s);
  return out;
});
