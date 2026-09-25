/**
 * oauthLink.ts — 소셜 로그인 흐름을 "내 계정에 연동" 용도로 재사용하기 위한 도우미.
 * 시작 URL 에 ?link=1 이 있으면 짧게 사는 쿠키(oauth_link)를 심고, 콜백이 그 쿠키를 보고
 *  - 오류는 /login 이 아니라 /login/oauth-link#error=.. 로(팝업이면 창을 닫고 부모에 알림, 아니면 /account?snsError= 로),
 *  - 성공은 앱 토큰 발급 대신 /login/oauth-link#provider=..&at=<제공자 accessToken> 으로 보낸다(주소 조각(#)은 서버로 전송되지 않는다).
 * 그 페이지가 내 JWT 와 함께 ecBeBo(POST /api/fo/ec/my/info/sns)에 accessToken 을 넘기면 서버가 제공자에게 직접 검증해 연동한다.
 */
import { deleteCookie, getCookie, getQuery, setCookie, type H3Event } from "h3";

const COOKIE = "oauth_link";

/** 시작 라우트에서 호출: ?link=1 이면 연동 모드 쿠키를 심고 true */
export function markLinkMode(event: H3Event): boolean {
  const link = getQuery(event).link === "1";
  if (link) setCookie(event, COOKIE, "1", { maxAge: 600, httpOnly: true, sameSite: "lax", path: "/" });
  else deleteCookie(event, COOKIE, { path: "/" });
  // 소셜 인증을 팝업으로 열었는지(?popup=1) — /login/oauth-link 가 브라우저에서 읽어 결과를 부모 창에 알리고 창을 닫는다(httpOnly 아님)
  if (link && getQuery(event).popup === "1") setCookie(event, "oauth_link_popup", "1", { maxAge: 600, httpOnly: false, sameSite: "lax", path: "/" });
  else deleteCookie(event, "oauth_link_popup", { path: "/" });
  return link;
}

/** 콜백 라우트에서 호출: 연동 모드였는지 확인하고 쿠키를 지운다 */
export function consumeLinkMode(event: H3Event): boolean {
  const link = getCookie(event, COOKIE) === "1";
  if (link) deleteCookie(event, COOKIE, { path: "/" });
  return link;
}

export const linkErrorUrl = (msg: string) => `/login/oauth-link#error=${encodeURIComponent(msg)}`;
export const linkSuccessUrl = (provider: string, accessToken: string) => `/login/oauth-link#provider=${provider}&at=${encodeURIComponent(accessToken)}`;
