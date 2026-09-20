import type { PdCategoryType } from "~/types/pd/pdCategoryType";

/**
 * 카테고리 트리 노드 (전시 위젯 JSON·사이드바용).
 * 컬럼명은 pd_category 그대로(PdCategoryType 상속: categoryNm/parentCategoryId/categoryDepth/sortOrd/imgUrl/categoryDesc …)이고,
 * 트리·화면용 파생값(children/parentTitle/value/img/id/smDesc)만 덧붙인다.
 */
export interface PdCategoryTreeType extends Partial<Omit<PdCategoryType, "categoryId">> {
  categoryId: string; // 카테고리ID (pd_category.category_id)
  children?: string[]; // 하위 카테고리ID 목록 (트리 파생값)
  // ── 화면/전시 위젯 호환 필드(테이블 컬럼 아님 — 기존 저장 JSON 과 템플릿이 쓰는 이름) ──
  id?: string; // categoryId 와 동일(기존 호환)
  img?: string; // 표시 이미지 (imgUrl 없으면 CDN 배너로 대체)
  parentTitle: string; // 표시명 (= categoryNm)
  value: string; // 값(코드) 대용 (= categoryId)
  smDesc?: string; // 짧은 설명 (= categoryDesc)
}

/** 카테고리 API(pdCategorySvc.getCategoryTree)가 조립하는 최상위 카테고리 노드 — 컬럼명은 pd_category 그대로 + 하위 {id,name} 목록. */
export interface PdCategoryTreeItemType extends Partial<Omit<PdCategoryType, "categoryId">> {
  categoryId: string;
  img: string; // 카테고리 배너 이미지
  parentTitle: string; // 표시명 (= categoryNm)
  value: string; // 카테고리 코드 대용(= categoryId)
  children: { id: string; name: string }[]; // 하위 카테고리
  smDesc?: string;
}

export interface PdCategoryTreeResType {
  categoryTree: PdCategoryTreeItemType[];
  categoryIdToName: Record<string, string>;
  /** 카테고리 id → 자기 자신 + 모든 하위 id. 백엔드 categoryIds 필터가 정확히 일치만 지원해 상위 선택 시 이 목록으로 확장해 조회한다. */
  categoryIdToDescendants: Record<string, string[]>;
}
