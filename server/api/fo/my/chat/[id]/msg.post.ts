import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeChattMsgItem } from "~~/server/utils/chatTypes";

/**
 * 채팅 메시지 전송. ecBeBo POST /api/fo/my/chat/{id}/msg 프록시 (CmChattMsgDto.SendRequest —
 * msgText만 보낸다. senderTypeCd는 서버가 인증 컨텍스트로 MEMBER 고정 처리하므로 클라이언트가
 * 보낼 필요/의미 없음 — ecFeBo가 보내던 senderCd는 이 DTO에 없는 필드라 무시되던 값이었다).
 * 2026-09-15 채팅 위젯 포팅.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "잘못된 채팅방 ID입니다." });
  }
  const body = await readBody<{ msgText?: string }>(event).catch(() => ({}) as Record<string, never>);
  if (!body?.msgText?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "메시지 내용이 필요합니다." });
  }

  const saved = await beApi.post<BeChattMsgItem>(`/fo/my/chat/${id}/msg`, { msgText: body.msgText }, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "chattMsgId=" + saved?.chattMsgId);
  return saved;
});
