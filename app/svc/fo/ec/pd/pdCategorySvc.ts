/**
 * pdCategorySvc.ts — 카테고리 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdCategoryController(/api/fo/ec/pd/category, 공개, 2026-09-20 신설)의 평탄 목록을 받는다. 트리 조립은 utils/mapCategory.ts.
 */
import { csrList } from "~/utils/svcHttp";
import { beConfig } from "~/utils/beConfig";
import { buildCategoryTree } from "~/utils/mapCategory";
import type { PdCategoryTreeResType } from "~/types/pd/pdCategoryTreeType";
import type { PdCategoryType } from "~/types/pd/pdCategoryType";

export const pdCategorySvc = {
  /** GET /fo/ec/pd/category → 최상위 카테고리 최대 6개 + 각 하위 카테고리로 트리 조립 */
  getCategoryTree: (): Promise<PdCategoryTreeResType> => csrList<PdCategoryType>("/fo/ec/pd/category").then((list) => buildCategoryTree(list, beConfig.cdnBase)),
};
