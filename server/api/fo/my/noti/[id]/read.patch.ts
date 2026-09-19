import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 알림 1건 읽음/안읽음 처리 — ecBeBo PATCH /api/fo/my/noti/{id}/read 프록시. body: { readYn: "Y"|"N" } (기본 Y). 로그인 필요. */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 알림 ID입니다." });
  const body = (await readBody(event).catch(() => ({}))) as { readYn?: string };
  const readYn = body?.readYn === "N" ? "N" : "Y";

  const res = await beApi.patch<unknown>(`/fo/my/noti/${encodeURIComponent(id)}/read`, { readYn }, authHeaderFrom(event));
  logger.info("[api] ◀", method, url, "readYn=" + readYn);
  return res ?? true;
});
