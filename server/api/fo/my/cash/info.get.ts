import { proxyMyGet } from "~~/server/utils/myPage";

/**
 * 내 캐쉬 잔액 + 전체 이력(페이징 없음) — ecBeBo GET /api/fo/my/cash/info 프록시 (로그인 필요).
 * 페이징 이력은 GET /api/fo/my/cash/page([kind]/page.get.ts 가 처리).
 */
export default defineEventHandler((event) => proxyMyGet(event, "/fo/my/cash/info"));
