/**
 * 인증(Auth) Pinia 스토어.
 * 2026-09-12: 자체 데모계정/Redis 세션을 걷어내고 ecBeBo(FoAuthController)를 유일한 인증
 * 소스로 사용한다 — 2026-09-20부터 브라우저가 authSvc(axiosCsr)로 ecBeBo를 직접 호출한다
 * (예전엔 server/api/auth/{login,join,refresh,logout}.post.ts 프록시 경유). ecBeBo는 "내 정보 조회" API가 없어서
 * (로그인 응답에 이미 담긴 프로필을 그대로 씀) 새로고침 시 서버 재검증 없이 localStorage에
 * 캐싱해둔 프로필을 그대로 복원한다 — 토큰이 실제로 만료됐는지는 이후 인증이 필요한 API를
 * 호출했을 때 401로만 드러난다(그 시점에 이 스토어의 refresh 로직을 호출해서 갱신할 것).
 *
 * OAuth 소셜 로그인(구글/네이버/카카오/애플)은 이번 전환 범위 밖 — 기존 "oauth_" 접두 토큰
 * 방식 그대로 유지(server/api/auth/{google,naver,kakao,apple}/* 콜백, oauth-success.vue 참조).
 * ecBeBo의 /api/co/fo-auth/social-login으로 옮기는 건 다음 작업.
 */
import { defineStore } from "pinia";
import type { MbAuthUserType } from "~/types/mb/mbAuthUserType";
import { authSvc } from "~/svc/co/auth/authSvc";
import { setCookie, deleteCookie } from "~/utils/cmUtil";

const STORAGE_USER_KEY = "auth_user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    user: null as MbAuthUserType | null,
    initialized: false,
  }),

  actions: {
    /** localStorage + Cookie에서 토큰/프로필 로드 */
    loadStToken() {
      if (!import.meta.client) return;
      this.token = localStorage.getItem("auth_token");
      const cached = localStorage.getItem(STORAGE_USER_KEY);
      if (cached) {
        try { this.user = JSON.parse(cached) as MbAuthUserType; } catch { /** 무시 */ }
      }
    },

    /** 토큰+프로필 저장 (로그인 성공 시 호출) */
    setSession(token: string, user: MbAuthUserType) {
      this.token = token;
      this.user = user;
      this.initialized = true;
      if (import.meta.client) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        setCookie("auth_token", token);
      }
    },

    /** 토큰만 갱신(리프레시 성공 시) — 캐시된 프로필은 그대로 둔다 */
    setToken(token: string) {
      this.token = token;
      if (import.meta.client) {
        localStorage.setItem("auth_token", token);
        setCookie("auth_token", token);
      }
    },

    /** OAuth 로그인 성공: 토큰과 사용자 정보를 한 번에 설정 (oauth_ 토큰용, 기존 로직 유지) */
    setOAuthUser(token: string, user: MbAuthUserType) {
      this.setSession(token, user);
    },

    /** 로그인 — ecBeBo FoAuthController.login() 직접 호출(authSvc) */
    async login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
      try {
        const res = await authSvc.login(email, password);
        this.setSession(res.token, res.user);
        return { ok: true };
      } catch (err: unknown) {
        const message = (
          (err as { response?: { data?: { message?: string; statusMessage?: string } } })?.response?.data?.message
          ?? (err as { response?: { data?: { statusMessage?: string } } })?.response?.data?.statusMessage
          ?? "이메일 또는 비밀번호가 올바르지 않습니다."
        ).split("::")[0]!; // 서버 내부 표기("::클래스::메서드:줄") 제거
        return { ok: false, message };
      }
    },

    /** 소셜 로그인(카카오 등) — 제공자 accessToken 을 ecBeBo 가 검증해 회원 매칭/가입 후 자체 토큰 발급 */
    async socialLogin(provider: string, accessToken: string, reconsent?: boolean): Promise<{ ok: boolean; message?: string }> {
      try {
        const res = await authSvc.socialLogin(provider, accessToken, reconsent);
        this.setSession(res.token, { ...res.user, loginSns: provider.toUpperCase() }); // 이름 옆에 로그인한 소셜 아이콘을 보이기 위해 기억
        return { ok: true };
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; response?: { data?: { message?: string } } };
        return { ok: false, message: String(e?.data?.message ?? e?.response?.data?.message ?? "소셜 로그인에 실패했습니다.").split("::")[0]! };
      }
    },

    /** PASS 본인인증을 마친 비회원을 임시회원으로 로그인시킨다(같은 이름·휴대폰·생년월일이면 같은 임시회원) */
    async passGuestLogin(identityVerificationId: string): Promise<{ ok: boolean; message?: string }> {
      try {
        const res = await authSvc.passGuestLogin(identityVerificationId);
        this.setSession(res.token, res.user);
        return { ok: true };
      } catch (err: unknown) {
        return { ok: false, message: String((err as { data?: { message?: string } })?.data?.message ?? "본인인증 로그인에 실패했습니다.").split("::")[0]! };
      }
    },

    /** 회원가입 — ecBeBo FoAuthController.join() 직접 호출(authSvc) (가입만, 자동로그인은 안 함) */
    async register(name: string, email: string, password: string, passVerifyId?: string, extra?: Record<string, string>): Promise<{ ok: boolean; message?: string }> {
      try {
        await authSvc.join(name, email, password, passVerifyId, extra);
        return { ok: true };
      } catch (err: unknown) {
        const message = ((err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? "회원가입에 실패했습니다.").split("::")[0]!;
        return { ok: false, message };
      }
    },

    /** 앱 부팅 시 인증 상태 복원 — ecBeBo에 "내 정보 조회" API가 없어 네트워크 호출 없이
     *  localStorage 캐시를 그대로 신뢰한다(loadStToken에서 이미 복원됨). oauth_ 토큰만 예외적으로
     *  payload에서 직접 복원(기존 방식 유지). */
    async loadStAuthInfo() {
      if (!this.token) {
        this.initialized = true;
        return;
      }

      // OAuth 토큰 처리 (oauth_ 로 시작하는 토큰은 payload에서 사용자 복원) — 기존 로직 유지
      if (this.token.startsWith("oauth_")) {
        try {
          let base64 = this.token.slice(6).replace(/-/g, "+").replace(/_/g, "/");
          const pad = base64.length % 4;
          if (pad) base64 += "=".repeat(4 - pad);
          const json = atob(base64);
          const payload = JSON.parse(json) as { email?: string; name?: string; id?: string };
          this.user = {
            memberId: payload.id ?? "0",
            userNm: payload.name || payload.email || "User",
            userEmail: payload.email || "",
          };
        } catch {
          this.setStLogout();
        }
        this.initialized = true;
        return;
      }

      // 그 외(ecBeBo 발급 accessToken)는 loadStToken이 이미 캐시된 프로필을 복원해둠 — 추가 호출 없음.
      this.initialized = true;
    },

    /** accessToken 갱신 — 인증 필요한 API가 401을 반환했을 때 호출 */
    async refreshToken(): Promise<boolean> {
      if (!this.token) return false;
      try {
        const res = await authSvc.refresh(this.token);
        this.setToken(res.accessToken);
        return true;
      } catch {
        // 갱신도 실패(refreshToken 만료/세션 없음)하면 로그인 상태를 정리한다 — 화면은 로그인 유도
        await this.setStLogout();
        return false;
      }
    },

    /** 로그아웃 (API 토큰이면 서버에 로그아웃 요청 후 클라이언트 정리) */
    async setStLogout() {
      const token = this.token;
      this.token = null;
      this.user = null;
      if (import.meta.client) {
        const isApiToken = token && !token.startsWith("oauth_");
        if (isApiToken && token) {
          try {
            await authSvc.logout(token);
          } catch {
            /** 무시 */
          }
        }
        localStorage.removeItem("auth_token");
        localStorage.removeItem(STORAGE_USER_KEY);
        deleteCookie("auth_token");
      }
    },
  },

  getters: {
    isStLoggedIn: (state) => !!state.token && !!state.user,
    /** PASS 본인인증으로 들어온 임시회원(비회원 결제·채팅) 여부 */
    isPassGuest: (state) => !!state.user?.userEmail?.endsWith("@guest.shopjoy"),
  },
});
