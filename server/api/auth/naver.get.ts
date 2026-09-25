/** 네이버 로그인 시작: 네이버 인증 페이지로 리다이렉트 */
import { linkErrorUrl, markLinkMode } from "~~/server/utils/oauthLink";

export default defineEventHandler((event) => {
  const link = markLinkMode(event); // ?link=1 이면 프로필의 "연동" 흐름
  const config = useRuntimeConfig();
  const clientId = config.naverClientId as string;
  if (!clientId) {
    return sendRedirect(event, link ? linkErrorUrl("네이버 로그인이 설정되지 않았습니다.") : "/login?error=" + encodeURIComponent("네이버 로그인이 설정되지 않았습니다."), 302);
  }
  // 2026-09-14 버그수정 — google.get.ts와 동일 사유(config.apiBaseUrl은 ecBeBo 주소).
  const baseUrl = getRequestURL(event).origin;
  const redirectUri = `${baseUrl}/api/auth/naver/callback`;
  const state = Buffer.from(Date.now().toString(36) + Math.random().toString(36)).toString("base64url");
  const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}${link ? "&auth_type=reprompt" : ""}`; // 연동 흐름은 네이버 재로그인을 강제
  return sendRedirect(event, url, 302);
});
