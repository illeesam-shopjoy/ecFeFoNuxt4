/**
 * Google OAuth 2.0 콜백: code를 액세스 토큰으로 교환 후 사용자 정보 조회, 앱 토큰 발급하여 리다이렉트.
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
  const clientId = config.googleClientId as string;
  const clientSecret = config.googleClientSecret as string;
  if (!clientId || !clientSecret) {
    return fail("config");
  }
  // 2026-09-14 버그수정 — google.get.ts와 동일 사유(config.apiBaseUrl은 ecBeBo 주소).
  // 여기서 만든 redirectUri는 위 authorize 요청 때 보낸 값과 토큰 교환 시 반드시 일치해야
  // 하므로(OAuth2 스펙), 두 곳 다 같은 방식(getRequestURL(event).origin)으로 통일.
  const baseUrl = getRequestURL(event).origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const tokenRes = await $fetch<{ access_token?: string }>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  }).catch(() => null);

  if (!tokenRes?.access_token) {
    return fail("token_exchange");
  }

  const userRes = await $fetch<{ id?: string; email?: string; name?: string; picture?: string }>(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokenRes.access_token}` } }
  ).catch(() => null);

  if (!userRes?.id) {
    return fail("user_info");
  }

  if (link) return sendRedirect(event, linkSuccessUrl("google", tokenRes.access_token), 302);
  // google accessToken 을 URL 해시로 넘기면 브라우저가 ecBeBo /co/fo-auth/social-login 으로 교환해 자체 세션을 만든다.
  return sendRedirect(event, `/login/oauth-success#provider=google&accessToken=${encodeURIComponent(tokenRes.access_token)}`, 302);
});
