import { proxyMyList } from "~~/server/utils/myPage";

/**
 * 마이페이지 전체 목록(페이징 없음) 프록시 — GET /api/fo/my/{order|claim|coupon|inquiry}/list (로그인 필요).
 * ecBeBo FoMyController 의 /fo/my/{kind}/list 를 그대로 프록시한다. 페이징이 필요하면 같은 폴더의 page.get.ts.
 */
export default defineEventHandler((event) => proxyMyList(event, String(getRouterParam(event, "kind") ?? "")));
