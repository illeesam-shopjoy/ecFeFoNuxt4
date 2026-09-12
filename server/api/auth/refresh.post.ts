/**
 * 액세스 토큰 갱신. ecBeBo FoAuthController(POST /api/co/fo-auth/token-refresh) 프록시.
 * 2026-09-12 BFF 전환: 클라이언트가 refreshToken을 들고 있지 않는다(ecBeBo가 서버 DB
 * mbh_member_token_log에서만 관리) — 만료된 accessToken을 Authorization 헤더로 그대로
 * 전달하면 ecBeBo가 그 토큰에 연결된 refreshToken을 서버에서 찾아 새 토큰쌍을 발급한다.
 */
import { beApi, authHeaderFrom } from "~~/server/utils/beApi";

interface BeTokenPair {
  accessToken: string;
  refreshToken: string | null;
  accessExpiresIn: number; // 분(minute) 단위 — ecBeBo JwtProvider 기준
}

export default defineEventHandler(async (event) => {
  const result = await beApi.post<BeTokenPair>("/co/fo-auth/token-refresh", undefined, authHeaderFrom(event));
  return { token: result.accessToken };
});
