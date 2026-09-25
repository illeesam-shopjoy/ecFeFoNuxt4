/**
 * 네이버 OAuth 2.0 콜백: code로 액세스 토큰 교환 후 회원정보 조회, 앱 토큰 발급.
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
  const clientId = config.naverClientId as string;
  const clientSecret = config.naverClientSecret as string;
  if (!clientId || !clientSecret) {
    return fail("config");
  }
  // 2026-09-14 버그수정 — google/callback.get.ts와 동일 사유.
  const baseUrl = getRequestURL(event).origin;
  const redirectUri = `${baseUrl}/api/auth/naver/callback`;

  const tokenRes = await $fetch<{ access_token?: string }>("https://nid.naver.com/oauth2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state: (query.state as string) || "",
    }).toString(),
  }).catch(() => null);

  if (!tokenRes?.access_token) {
    return fail("token_exchange");
  }

  const userRes = await $fetch<{ response?: { id: string; email?: string; name?: string } }>(
    "https://openapi.naver.com/v1/nid/me",
    { headers: { Authorization: `Bearer ${tokenRes.access_token}` } }
  ).catch(() => null);

  const profile = userRes?.response;
  if (!profile?.id) {
    return fail("user_info");
  }

  if (link) return sendRedirect(event, linkSuccessUrl("naver", tokenRes.access_token), 302);
  // naver accessToken 을 URL 해시로 넘기면 브라우저가 ecBeBo /co/fo-auth/social-login 으로 교환해 자체 세션을 만든다.
  return sendRedirect(event, `/login/oauth-success#provider=naver&accessToken=${encodeURIComponent(tokenRes.access_token)}`, 302);
});
