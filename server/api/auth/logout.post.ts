/**
 * 로그아웃. ecBeBo FoAuthController(POST /api/co/fo-auth/logout) 프록시.
 * Authorization 헤더의 accessToken 하나만 무효화(멀티디바이스 정책 — 다른 기기 로그인은 유지).
 * 토큰이 없으면 어차피 서버에 무효화할 게 없으므로 조용히 성공 처리.
 */
import { beApi, authHeaderFrom } from "~~/server/utils/beApi";

export default defineEventHandler(async (event) => {
  const headers = authHeaderFrom(event);
  if (!headers.authorization) return { ok: true };
  await beApi.post("/co/fo-auth/logout", undefined, headers).catch(() => null); // 로그아웃 실패해도 클라이언트 토큰 정리는 진행돼야 하므로 무시
  return { ok: true };
});
