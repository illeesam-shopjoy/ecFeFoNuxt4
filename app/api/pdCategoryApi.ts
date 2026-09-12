/**
 * pdCategoryApi.ts — 상품 카테고리(트리) API 호출 객체.
 *
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘") —
 * CategoryArea.vue/CategoryAreaTwo.vue/ProductCategory.vue 세 곳이 각자
 * "/api/fo/ec/pd/category-tree" 문자열을 그대로 axiosSsr.get(...)에 박아 호출하고 타입도
 * 각자 복붙해서 미묘하게 어긋나 있던 걸(smDesc 유무 등) 한 곳으로 모았다 — 경로가 바뀌거나
 * 응답 타입이 바뀌면 여기 한 곳만 고치면 된다.
 */
import { axiosSsr } from "~/utils/axiosSsr";

export interface CategoryTreeItem {
  categoryId: string;
  img: string;
  parentTitle: string;
  value: string;
  children: string[];
  smDesc?: string;
}

export interface CategoryTreeResponse {
  categoryTree: CategoryTreeItem[];
  categoryIdToName: Record<string, string>;
}

export const pdCategoryApi = {
  /** GET /api/fo/ec/pd/category-tree — 카테고리 트리(상품목록에서 즉석 집계한 합성 데이터, 로그인 불필요) */
  getCategoryTree: () =>
    axiosSsr.get<CategoryTreeResponse>("/api/fo/ec/pd/category-tree").then((r) => r.data),
};
