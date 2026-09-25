/**
 * 카카오 OAuth 2.0 콜백: code로 액세스 토큰 교환 후 사용자 정보 조회, 앱 토큰 발급.
 */
import { consumeLinkMode, linkErrorUrl, linkSuccessUrl } from "~~/server/utils/oauthLink";

export default defineEventHandler(async (event) => {
  const link = consumeLinkMode(event); // 내 계정에 연동하려는 흐름인지(프로필 수정 화면)
  const fail = (code: string) => sendRedirect(event, link ? linkErrorUrl(code) : `/login?error=${encodeURIComponent(code)}`, 302);
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const code = query.code as string;
  const error = query.error as string;
  if (error) {
    return fail(error);
  }
  if (!code) {
    return fail("no_code");
  }
  const clientId = config.kakaoClientId as string;
  const clientSecret = config.kakaoClientSecret as string;
  if (!clientId) {
    return fail("config");
  }
  // 2026-09-14 버그수정 — google/callback.get.ts와 동일 사유.
  const baseUrl = getRequestURL(event).origin;
  const redirectUri = `${baseUrl}/api/auth/kakao/callback`;

  const body: Record<string, string> = {
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
  };
  if (clientSecret) body.client_secret = clientSecret;

  // 실패 원인(KOE010=클라이언트 시크릿 불일치/누락, KOE320=코드 만료·재사용, KOE303=redirect_uri 불일치 등)을 로그/화면에 남긴다.
  let kakaoErrorCode = "";
  const tokenRes = await $fetch<{ access_token?: string }>("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  }).catch((e) => {
    kakaoErrorCode = e?.data?.error_code ?? e?.data?.error ?? "";
    console.error("[kakao/callback] token 교환 실패", kakaoErrorCode, e?.data?.error_description ?? e?.message);
    return null;
  });

  if (!tokenRes?.access_token) {
    return fail(kakaoErrorCode ? `token_exchange_${kakaoErrorCode}` : "token_exchange");
  }

  const userRes = await $fetch<{
    id?: number;
    kakao_account?: { email?: string };
    properties?: { nickname?: string };
  }>("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${tokenRes.access_token}` },
  }).catch(() => null);

  const id = userRes?.id?.toString();
  if (!id) {
    return fail("user_info");
  }

  if (link) return sendRedirect(event, linkSuccessUrl("kakao", tokenRes.access_token), 302);
  // 카카오 accessToken 을 URL 해시(#, 서버 로그·Referer 에 안 남음)로 넘기면 브라우저가 ecBeBo /co/fo-auth/social-login 으로 교환해 자체 세션을 만든다.
  return sendRedirect(event, `/login/oauth-success#provider=kakao&accessToken=${encodeURIComponent(tokenRes.access_token)}`, 302);
});
