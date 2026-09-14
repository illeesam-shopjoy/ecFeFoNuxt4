import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeChattMsgItem } from "~~/server/utils/chatTypes";

/**
 * 채팅 메시지 목록(폴링용, afterMsgId 이후분만). ecBeBo GET /api/fo/my/chat/{id}/messages 프록시.
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
  const query = getQuery(event);
  const afterMsgId = typeof query.afterMsgId === "string" ? query.afterMsgId : undefined;

  const list = await beApi.get<BeChattMsgItem[]>(`/fo/my/chat/${id}/messages`, afterMsgId ? { afterMsgId } : undefined, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "count=" + (list?.length ?? 0));
  return list ?? [];
});
