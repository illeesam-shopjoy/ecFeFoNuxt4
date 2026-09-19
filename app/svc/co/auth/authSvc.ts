/**
 * authSvc.ts — 회원 인증 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoAuthController(/api/co/fo-auth/**, 공개) 가 유일한 인증 소스다. useAuthStore 가 이 객체를 쓴다.
 * (소셜 로그인 구글/네이버/카카오/애플은 브라우저 리다이렉트 흐름이라 server/api/auth/** 에 그대로 남는다.)
 */
import { axiosCsr } from "~/utils/axiosCsr";
import type { AuthUser } from "~/store/useAuthStore";

interface BeLoginRes {
  accessToken: string;
  memberId: string;
  userNm: string;
  userEmail: string;
  userPhone?: string;
  siteId?: string;
}

interface BeTokenPair {
  accessToken: string;
  refreshToken: string | null;
  accessExpiresIn: number; // 분(minute) 단위 — ecBeBo JwtProvider 기준
}

/** 백엔드 호출 전 검증 실패를 소비처(err.response.data.message)가 읽는 모양으로 던진다 */
function badRequest(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 400, statusMessage: message, response: { data: { message, statusMessage: message } } });
}

export const authSvc = {
  /** POST /co/fo-auth/login — siteId 는 생략(FO 로그인 화면에 사이트 선택 UI 없음). accessToken + 프로필 반환 */
  login: async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const loginId = String(email ?? "").trim();
    const loginPwd = String(password ?? "");
    if (!loginId || !loginPwd) badRequest("이메일과 비밀번호를 입력해 주세요.");
    const r = (await axiosCsr.post<BeLoginRes>("/co/fo-auth/login", { loginId, loginPwd })).data;
    return {
      token: r.accessToken,
      user: { memberId: r.memberId, userNm: r.userNm, userEmail: r.userEmail, userPhone: r.userPhone, siteId: r.siteId },
    };
  },

  /** POST /co/fo-auth/join — 회원가입(자동 로그인 안 함). loginPwdHash 필드에 평문을 담는다(ecBeBo 가 그 자리에서 encode) */
  join: async (name: string, email: string, password: string): Promise<{ memberId: string; loginId: string }> => {
    const memberNm = String(name ?? "").trim();
    const loginId = String(email ?? "").trim();
    const loginPwdHash = String(password ?? "");
    if (!memberNm || !loginId || !loginPwdHash) badRequest("이름, 이메일, 비밀번호를 모두 입력해 주세요.");
    const r = (await axiosCsr.post<{ memberId: string; loginId: string }>("/co/fo-auth/join", { memberNm, loginId, loginPwdHash })).data;
    return { memberId: r.memberId, loginId: r.loginId };
  },

  /** POST /co/fo-auth/token-refresh — 만료된 accessToken 을 Authorization 으로 보내면 서버가 연결된 refreshToken 으로 새 토큰 발급 */
  refresh: async (accessToken: string): Promise<{ token: string }> => {
    const r = (await axiosCsr.post<BeTokenPair>("/co/fo-auth/token-refresh", undefined, { headers: { Authorization: `Bearer ${accessToken}` } })).data;
    return { token: r.accessToken };
  },

  /** POST /co/fo-auth/logout — 서버 세션 종료. 실패해도 클라이언트 정리는 진행돼야 하므로 오류는 삼킨다 */
  logout: async (accessToken: string): Promise<void> => {
    if (!accessToken) return;
    await axiosCsr.post("/co/fo-auth/logout", undefined, { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => null);
  },
};
