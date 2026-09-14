/**
 * Google OAuth 2.0 로그인 시작: 사용자를 Google 인증 페이지로 리다이렉트합니다.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const clientId = config.googleClientId as string;
  if (!clientId) {
    return sendRedirect(event, "/login?error=" + encodeURIComponent("Google 로그인이 설정되지 않았습니다."), 302);
  }
  // 2026-09-14 버그수정(요청사항: "sy_prop 정보 확인하여 ... 적용해줘"로 소셜로그인 값을
  // 채우다 발견 — config.apiBaseUrl은 ecBeBo(백엔드 API) 주소라, 이 redirect_uri(=이 Nuxt
  // 앱 자신의 콜백 라우트)를 ecBeBo 주소로 잘못 만들고 있었다(항상 truthy라 우측
  // getRequestURL 폴백은 죽은 코드였음). ecBeBo엔 이 콜백 경로 자체가 없어 소셜 로그인이
  // 항상 실패했다 — 이 앱 자신의 origin을 쓰도록 수정.
  const baseUrl = getRequestURL(event).origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const scope = "openid email profile";
  const state = Buffer.from(Date.now().toString(36) + Math.random().toString(36)).toString("base64url");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;
  return sendRedirect(event, url, 302);
});
