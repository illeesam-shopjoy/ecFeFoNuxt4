/**
 * myChatSvc.ts (fo/my) — 마이페이지 1:1 채팅 화면(my/chatt)용 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmChattController(/api/fo/my/chat, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { myListApi } from "~/utils/svcHttp";
import type { CmChattType } from "~/types/cm/cmChattType";

/** GET /fo/my/chat/list · /fo/my/chat/page — 내 채팅방 목록(전체 / 페이징, 기본 1페이지 10건) */
export const myChatSvc = myListApi<CmChattType>("/fo/my/chat");
