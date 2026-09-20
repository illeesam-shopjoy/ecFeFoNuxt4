/**
 * pdCategorySvc.ts — 카테고리 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdCategoryController(/api/fo/ec/pd/category, 공개, 2026-09-20 신설)의 평탄 목록을 받아 트리를 조립한다.
 * 예전에는 상품 1000건을 받아 카테고리를 즉석 집계했다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { beConfig } from "~/utils/beConfig";

export interface CategoryTreeItem {
  categoryId: string;
  /** 카테고리 배너 이미지 */
  img: string;
  parentTitle: string;
  /** 카테고리 코드 대용(= categoryId) */
  value: string;
  /** 하위 카테고리 {id, name} */
  children: { id: string; name: string }[];
  smDesc?: string;
}

export interface CategoryTreeResponse {
  categoryTree: CategoryTreeItem[];
  categoryIdToName: Record<string, string>;
  /**
   * 카테고리 id → 자기 자신 + 모든 하위 카테고리 id.
   * 상품은 보통 최하위(3단계) 카테고리에 속하는데 백엔드 categoryIds 필터는 정확히 일치만 지원하므로,
   * 사이드바에서 상위/중간 카테고리를 고르면 이 목록으로 확장해서 조회한다(pages/shop.vue).
   */
  categoryIdToDescendants: Record<string, string[]>;
}

interface BeCategory {
  categoryId: string;
  parentCategoryId?: string | null;
  categoryNm: string;
  categoryDepth?: number | null;
  sortOrd?: number | null;
  imgUrl?: string | null;
  categoryDesc?: string | null;
}

// 카테고리 마스터에 배너 이미지가 없을 때 쓰는 CDN 배너(실존 파일 banner-sm-1~5) — 앞 카테고리부터 순서대로 배정.
const BANNER_IMG_FILES = ["banner-sm-1.jpg", "banner-sm-2.jpg", "banner-sm-3.jpg", "banner-sm-4.jpg", "banner-sm-5.jpg"];

export const pdCategorySvc = {
  /** GET /fo/ec/pd/category → 최상위 카테고리 최대 6개 + 각 하위 카테고리로 트리 조립 */
  getCategoryTree: async (): Promise<CategoryTreeResponse> => {
    const rows = (await axiosCsr.get<BeCategory[]>("/fo/ec/pd/category")).data ?? [];

    const nameById: Record<string, string> = Object.fromEntries(rows.map((c) => [c.categoryId, c.categoryNm]));
    const childrenByParent = new Map<string, { id: string; name: string }[]>();
    for (const c of rows) {
      if (!c.parentCategoryId) continue;
      const list = childrenByParent.get(c.parentCategoryId) ?? [];
      list.push({ id: c.categoryId, name: c.categoryNm });
      childrenByParent.set(c.parentCategoryId, list);
    }

    const categoryTree: CategoryTreeItem[] = rows
      .filter((c) => !c.parentCategoryId)
      .slice(0, 6)
      .map((c, idx) => ({
        categoryId: c.categoryId,
        parentTitle: c.categoryNm,
        value: c.categoryId,
        children: childrenByParent.get(c.categoryId) ?? [],
        img: c.imgUrl || (BANNER_IMG_FILES[idx] ? `${beConfig.cdnBase}/cdn/prod/img/shop/banner/${BANNER_IMG_FILES[idx]}` : ""),
        smDesc: c.categoryDesc ?? undefined,
      }));

    // 자기 자신 + 모든 깊이의 하위 id (트리 깊이 제한 없음)
    const descendants = (id: string): string[] => [id, ...(childrenByParent.get(id) ?? []).flatMap((c) => descendants(c.id))];
    const categoryIdToDescendants = Object.fromEntries(rows.map((c) => [c.categoryId, descendants(c.categoryId)]));

    return { categoryTree, categoryIdToName: nameById, categoryIdToDescendants };
  },
};
