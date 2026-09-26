/**
 * 네이버 연동 토큰 삭제(연결 끊기): 연동을 취소했던 네이버 계정이 다시 로그인하려 할 때, 화면이 이 라우트로 방금 받은 accessToken 을
 * 보내 네이버 쪽 동의를 지운다 → 이어서 네이버 인증을 다시 시작하면 동의 화면이 다시 나온다(클라이언트 시크릿이 필요해 서버에서 한다).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const clientId = config.naverClientId as string;
  const clientSecret = config.naverClientSecret as string;
  const body = await readBody<{ accessToken?: string }>(event).catch(() => null);
  const accessToken = body?.accessToken;
  if (!clientId || !clientSecret || !accessToken) return { ok: false };
  const res = await $fetch<{ result?: string }>("https://nid.naver.com/oauth2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "delete", client_id: clientId, client_secret: clientSecret, access_token: accessToken, service_provider: "NAVER" }).toString(),
  }).catch(() => null);
  return { ok: res?.result === "success" };
});
