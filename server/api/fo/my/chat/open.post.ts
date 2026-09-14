import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeChattItem } from "~~/server/utils/chatTypes";

/**
 * 채팅방 열기(기존 열린 방 반환 또는 신규 생성). ecBeBo POST /api/fo/my/chat/open 프록시.
 * [[ecfefonuxt4-bff-migration-plan]] / 2026-09-15 채팅 위젯 포팅.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{ subject?: string; siteId?: string }>(event).catch(() => ({}) as Record<string, never>);

  const room = await beApi.post<BeChattItem>(
    "/fo/my/chat/open",
    { subject: body?.subject ?? "고객 문의", siteId: body?.siteId },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url, "chattId=" + room?.chattId);
  return room;
});
