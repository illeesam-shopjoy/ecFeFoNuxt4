import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 내 채팅방 1건 — ecBeBo GET /api/fo/my/chat/{id} 프록시 (로그인 필요). 메시지는 [id]/messages.get.ts. */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 채팅방 ID입니다." });

  const room = await beApi.get<Record<string, unknown>>(`/fo/my/chat/${encodeURIComponent(id)}`, undefined, authHeaderFrom(event), 8000);
  logger.info("[api] ◀", method, url);
  return room;
});
