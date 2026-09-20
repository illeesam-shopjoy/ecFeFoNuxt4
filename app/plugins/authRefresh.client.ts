/**
 * authRefresh.client.ts — accessToken(15분) 만료 시 refresh 로 새 토큰을 받아 요청을 이어가게 한다.
 * ecBeBo POST /api/co/fo-auth/token-refresh 는 "만료된 accessToken" 을 Authorization 으로 받고, 서버에 저장된 refreshToken(15일, sliding)으로 새 accessToken 을 발급한다.
 * 실제 요청 재시도는 utils/axiosCsr.ts 가 하고, 이 플러그인은 "어떻게 갱신하는가"만 알려준다.
 */
import { setAuthRefresher } from "~/utils/axiosCsr";
import { useAuthStore } from "~/store/useAuthStore";

export default defineNuxtPlugin(() => {
  setAuthRefresher(async (usedToken) => {
    const auth = useAuthStore();
    auth.loadStToken(); // 다른 탭이 이미 갱신했을 수 있어 저장소의 최신 토큰부터 확인
    if (auth.token && auth.token !== usedToken) return auth.token;
    if (!auth.token || auth.token.startsWith("oauth_")) return null;
    return (await auth.refreshToken()) ? auth.token : null;
  });
});
