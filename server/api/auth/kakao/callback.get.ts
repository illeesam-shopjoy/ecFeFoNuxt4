/**
 * 카카오 OAuth 2.0 콜백: code로 액세스 토큰 교환 후 사용자 정보 조회, 앱 토큰 발급.
 */
import { createOAuthToken } from "~~/server/utils/oauthToken";
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

  const tokenRes = await $fetch<{ access_token?: string }>("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  }).catch(() => null);

  if (!tokenRes?.access_token) {
    return fail("token_exchange");
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
  const email = userRes?.kakao_account?.email || "";
  const name = userRes?.properties?.nickname || email || "User";

  if (link) return sendRedirect(event, linkSuccessUrl("kakao", tokenRes.access_token), 302);
  const token = createOAuthToken({ provider: "kakao", id, email, name });
  return sendRedirect(event, `/login/oauth-success?token=${encodeURIComponent(token)}`, 302);
});
