import { proxyMyPage } from "~~/server/utils/myPage";

/** 내 알림 서버 페이징 — ecBeBo GET /api/fo/my/noti/page 프록시 (로그인 필요). 쿼리: pageNo, pageSize, readYn(Y|N), notiTypeCd. */
export default defineEventHandler((event) => proxyMyPage(event, "noti"));
