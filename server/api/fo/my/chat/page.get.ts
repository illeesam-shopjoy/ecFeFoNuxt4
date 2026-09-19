import { proxyMyPage } from "~~/server/utils/myPage";

/** 내 채팅방 목록(서버 페이징) — GET /api/fo/my/chat/page (로그인 필요). server/utils/myPage.ts 참조. */
export default defineEventHandler((event) => proxyMyPage(event, "chat"));
