import { logger } from "~~/server/utils/logger";
import type { SyMenuTreeType } from "~/types/syMenuTreeType";

/**
 * 상단 내비게이션 메뉴. ecBeBo에 이 화면 전용 동적 메뉴 API가 없다 — ecFeBo(FO 파일럿)도
 * 상단 메뉴는 lib/stores/fo/foMenuStore.js의 svTopMenu에 정적으로 박아두고 씀(2026-09 확인).
 * 그 패턴을 그대로 따라 여기서도 정적 목록으로 둔다 — DB/백엔드 조회 자체가 불필요.
 */
/**
 * 2026-09-14(요청사항: "최상단메뉴 홈, 쇼핑, 상품, 블로그, 고객센터 등 부분 우측화면처럼
 * 페이지가 많은데 확인하여개선해줘") — 데모(우측 화면)처럼 각 메뉴에 실제 이 프로젝트에
 * 존재하는 하위 페이지들을 드롭다운/메가메뉴로 채웠다. 데모의 Portfolio/About us/F.A.Q's
 * 처럼 이 프로젝트엔 없는 페이지는 없는 링크를 만들지 않기 위해 제외했다. 이전엔 "상품"
 * 메뉴 링크가 존재하지 않는 /product-details를 가리켜 클릭하면 404가 떴는데(우연히 이번
 * 세션 초반 스크린샷에서 발견된 바로 그 404) 그것도 /shop으로 바로잡음.
 */
const STATIC_MENUS: SyMenuTreeType[] = [
  {
    menuTreeId: 1,
    link: "/",
    title: "홈",
    hasDropdown: true,
    dropdownItems: [
      { link: "/", title: "홈 스타일 1" },
      { link: "/home-2", title: "홈 스타일 2" },
      { link: "/home-3", title: "홈 스타일 3" },
      { link: "/home-4", title: "홈 스타일 4" },
      { link: "/home-5", title: "홈 스타일 5" },
      { link: "/home-6", title: "홈 스타일 6" },
      { link: "/home-7", title: "홈 스타일 7" },
    ],
  },
  {
    menuTreeId: 2,
    link: "/shop",
    title: "쇼핑",
    hasDropdown: true,
    megamenu: true,
    dropdownItems: [
      {
        link: "/shop",
        title: "쇼핑 레이아웃",
        dropdownMenu: [
          { link: "/shop", title: "기본 쇼핑" },
          { link: "/shop-right", title: "쇼핑 (우측 사이드바)" },
          { link: "/shop-4-col", title: "쇼핑 4단" },
          { link: "/shop-3-col", title: "쇼핑 3단" },
        ],
      },
      {
        link: "/cart",
        title: "상품 · 주문",
        dropdownMenu: [
          { link: "/wishlist", title: "위시리스트" },
          { link: "/cart", title: "장바구니" },
          { link: "/checkout", title: "주문/결제" },
          { link: "/compare", title: "상품 비교" },
        ],
      },
    ],
  },
  {
    menuTreeId: 3,
    link: "/shop",
    title: "상품",
    hasDropdown: true,
    dropdownItems: [
      { link: "/shop", title: "전체 상품" },
      { link: "/wishlist", title: "위시리스트" },
      { link: "/compare", title: "상품 비교" },
    ],
  },
  {
    menuTreeId: 4,
    link: "/blog",
    title: "블로그",
    hasDropdown: true,
    megamenu: true,
    dropdownItems: [
      {
        link: "/blog",
        title: "블로그 레이아웃",
        dropdownMenu: [
          { link: "/blog", title: "기본 블로그" },
          { link: "/blog-left-sidebar", title: "블로그 (좌측 사이드바)" },
          { link: "/blog-no-sidebar", title: "블로그 (사이드바 없음)" },
        ],
      },
      {
        link: "/blog-2-col",
        title: "블로그 그리드",
        dropdownMenu: [
          { link: "/blog-2-col", title: "블로그 2단" },
          { link: "/blog-3-col", title: "블로그 3단" },
          { link: "/blog-2-col-mas", title: "블로그 2단 메이슨리" },
        ],
      },
    ],
  },
  {
    menuTreeId: 5,
    link: "/contact",
    title: "고객센터",
    hasDropdown: true,
    dropdownItems: [
      { link: "/contact", title: "문의하기" },
      { link: "/register", title: "회원가입" },
      { link: "/login", title: "로그인" },
      { link: "/account", title: "마이페이지" },
    ],
  },
];

export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);
  logger.info("[api] ◀", method, url, "list size=" + STATIC_MENUS.length);
  return STATIC_MENUS;
});
