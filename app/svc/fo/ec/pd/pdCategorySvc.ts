/**
 * pdCategorySvc.ts — 상품 카테고리(트리) API 호출 객체.
 *
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "Api.ts 가 아니고 Svc.ts 여야 될거 같은데 + svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로
 * 정리해줘") — CategoryArea.vue/CategoryAreaTwo.vue/ProductCategory.vue 세 곳이 각자
 * "/api/fo/ec/pd/category-tree" 문자열을 그대로 axiosSsr.get(...)에 박아 호출하고 타입도
 * 각자 복붙해서 미묘하게 어긋나 있던 걸(smDesc 유무 등) 한 곳으로 모았다. 폴더 위치
 * (svc/fo/ec/pd/)는 실제 라우트 경로(server/api/fo/ec/pd/*)를 그대로 따른다 — server/api와
 * app/svc를 같은 이름(api)으로 두면 헷갈린다는 지적에 따라 app 쪽은 svc로 구분.
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

export const pdCategorySvc = {
  /** GET /api/fo/ec/pd/category-tree — 카테고리 트리(상품목록에서 즉석 집계한 합성 데이터, 로그인 불필요) */
  getCategoryTree: () =>
    axiosSsr.get<CategoryTreeResponse>("/api/fo/ec/pd/category-tree").then((r) => r.data),
};
