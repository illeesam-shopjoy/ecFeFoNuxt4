import { proxyMyPage } from "~~/server/utils/myPage";

/**
 * 마이페이지 목록 조회 프록시 — GET /api/fo/my/{order|claim|coupon|inquiry|cash}/page (로그인 필요).
 * 채팅은 같은 규칙의 정적 라우트(chat/page.get.ts)가 따로 처리한다. 상세는 server/utils/myPage.ts 참조.
 */
export default defineEventHandler((event) => proxyMyPage(event, String(getRouterParam(event, "kind") ?? "")));
