import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 비밀번호 변경 — ecBeBo POST /api/fo/ec/my/password 프록시 (2026-09-19). 로그인 필요.
 * body: { currentPassword, newPassword }. 현재 비밀번호가 틀리면 백엔드가 400 + 메시지를 돌려주며 그대로 전달된다.
 * 비밀번호 값은 로그에 남기지 않는다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = ((await readBody(event).catch(() => ({}))) ?? {}) as { currentPassword?: string; newPassword?: string };
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  if (!currentPassword) throw createError({ statusCode: 400, statusMessage: "현재 비밀번호를 입력해 주세요." });
  if (newPassword.length < 6) throw createError({ statusCode: 400, statusMessage: "새 비밀번호는 6자 이상이어야 합니다." });

  await beApi.post<unknown>("/fo/ec/my/password", { currentPassword, newPassword }, authHeaderFrom(event));
  logger.info("[api] ◀", method, url, "changed");
  return { ok: true };
});
