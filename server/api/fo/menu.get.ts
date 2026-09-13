import { logger } from "~~/server/utils/logger";
import type { SyMenuTreeType } from "~/types/syMenuTreeType";

/**
 * 상단 내비게이션 메뉴. ecBeBo에 이 화면 전용 동적 메뉴 API가 없다 — ecFeBo(FO 파일럿)도
 * 상단 메뉴는 lib/stores/fo/foMenuStore.js의 svTopMenu에 정적으로 박아두고 씀(2026-09 확인).
 * 그 패턴을 그대로 따라 여기서도 정적 목록으로 둔다 — DB/백엔드 조회 자체가 불필요.
 */
const STATIC_MENUS: SyMenuTreeType[] = [
  { menuTreeId: 1, link: "/", title: "홈" },
  { menuTreeId: 2, link: "/shop", title: "쇼핑" },
  {
    menuTreeId: 3,
    link: "/product-details",
    title: "상품",
    hasDropdown: true,
    dropdownItems: [
      { link: "/shop", title: "전체 상품" },
      { link: "/wishlist", title: "위시리스트" },
      { link: "/compare", title: "상품 비교" },
    ],
  },
  { menuTreeId: 4, link: "/blog", title: "블로그" },
  { menuTreeId: 5, link: "/contact", title: "고객센터" },
];

export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);
  logger.info("[api] ◀", method, url, "list size=" + STATIC_MENUS.length);
  return STATIC_MENUS;
});
