import type { PdCategoryTreeType } from "~/types/pd/pdCategoryTreeType";

/** 블로그 사이드바 카테고리 전시 위젯(BLOG_SIDEBAR_CATEGORY) 설정 */
export interface CmBlogSidebarCategoryType {
  categoryTreeData: PdCategoryTreeType[];
  catNameMap: Record<string, string>;
}
