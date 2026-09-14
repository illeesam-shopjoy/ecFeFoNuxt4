import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeChattItem } from "~~/server/utils/chatTypes";

/**
 * 2026-09-15(요청사항: "채팅 outstock 에도 추가해줘") — ecFeBo 채팅상담 플로팅 위젯을
 * Outstock(ecFeFoNuxt4)에도 포팅. ecBeBo FoCmChattController.myList()를 그대로 프록시
 * (경로 그대로 일치: GET /api/fo/my/chat, 쿼리 없음 — ecFeBo의 foApiSvc.myChat.getList()가
 * 쓰던 "/fo/my/chat/list"는 컨트롤러에 없는 경로라 실제로는 GET /{id}(id="list")로 잘못
 * 라우팅되는 버그였다. 여기선 로그인 회원의 채팅방 목록을 정확한 실제 경로로 호출한다).
 * 로그인 필요(FO_ONLY) — Authorization 헤더 그대로 전달.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const list = await beApi.get<BeChattItem[]>("/fo/my/chat", undefined, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "count=" + (list?.length ?? 0));
  return list ?? [];
});
