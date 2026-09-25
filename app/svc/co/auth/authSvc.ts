/**
 * authSvc.ts — 회원 인증 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoAuthController(/api/co/fo-auth/**, 공개) 가 유일한 인증 소스다. useAuthStore 가 이 객체를 쓴다.
 * (소셜 로그인 구글/네이버/카카오/애플은 브라우저 리다이렉트 흐름이라 server/api/auth/** 에 그대로 남는다.)
 * 입력 검증·응답 가공은 utils/mapMy.ts — 여기서는 전송만 한다.
 */
import { csrPost } from "~/utils/svcHttp";
import type { SyFoundIdType, SyPwCodeSentType, SyPwResetTokenType } from "~/types/sy/syFindAccountType";
import { buildJoinPayload, buildLoginPayload, mapLoginRes } from "~/utils/mapMy";
import type { SyJoinResType } from "~/types/sy/syJoinResType";
import type { SyLoginResType, SyTokenPairType } from "~/types/sy/syLoginResType";
import type { SyLoginSessionType } from "~/types/sy/syLoginSessionType";

const bearer = (accessToken: string) => ({ headers: { Authorization: `Bearer ${accessToken}` } });

export const authSvc = {
  /** POST /co/fo-auth/login — accessToken + 프로필 반환 */
  login: (email: string, password: string): Promise<SyLoginSessionType> => csrPost<SyLoginResType>("/co/fo-auth/login", buildLoginPayload(email, password)).then(mapLoginRes),

  /** POST /co/fo-auth/social-login — 소셜 제공자 accessToken 을 서버가 검증 → 회원 매칭/자동가입 → 자체 accessToken 발급 */
  socialLogin: (provider: string, accessToken: string): Promise<SyLoginSessionType> => csrPost<SyLoginResType>("/co/fo-auth/social-login", { provider, accessToken }).then(mapLoginRes),

  /** POST /co/fo-auth/join — 회원가입(자동 로그인 안 함) */
  join: (name: string, email: string, password: string, passVerifyId?: string, extra?: Record<string, string>): Promise<SyJoinResType> =>
    csrPost<SyJoinResType>("/co/fo-auth/join", buildJoinPayload(name, email, password, passVerifyId, extra)),

  /** POST /co/fo-auth/token-refresh — 만료된 accessToken 으로 새 토큰 발급 */
  refresh: (accessToken: string): Promise<SyTokenPairType> => csrPost<SyTokenPairType>("/co/fo-auth/token-refresh", undefined, bearer(accessToken)),

  /** POST /co/fo-auth/pass-guest-login — PASS 본인인증을 마친 비회원을 "PASS 임시회원"으로 로그인(채팅 상담·비회원 결제용) */
  passGuestLogin: (identityVerificationId: string): Promise<SyLoginSessionType> => csrPost<SyLoginResType>("/co/fo-auth/pass-guest-login", { identityVerificationId }).then(mapLoginRes),

  /** POST /co/fo-auth/find-id — PASS 인증 결과로 가입 아이디(가림) 찾기 */
  findId: (identityVerificationId: string): Promise<SyFoundIdType> => csrPost<SyFoundIdType>("/co/fo-auth/find-id", { identityVerificationId }),

  /** POST /co/fo-auth/pw-reset/request — 아이디 + PASS 인증 확인 후 본인확인번호를 메일로 발송 */
  requestPwReset: (loginId: string, identityVerificationId: string): Promise<SyPwCodeSentType> => csrPost<SyPwCodeSentType>("/co/fo-auth/pw-reset/request", { loginId, identityVerificationId }),

  /** POST /co/fo-auth/pw-reset/verify — 메일로 받은 본인확인번호 확인 → 재설정 토큰 */
  verifyPwReset: (loginId: string, code: string): Promise<SyPwResetTokenType> => csrPost<SyPwResetTokenType>("/co/fo-auth/pw-reset/verify", { loginId, code }),

  /** POST /co/fo-auth/pw-reset/confirm — 재설정 토큰으로 새 비밀번호 설정 */
  confirmPwReset: (loginId: string, resetToken: string, newPassword: string): Promise<void> => csrPost("/co/fo-auth/pw-reset/confirm", { loginId, resetToken, newPassword }),

  /** POST /co/fo-auth/logout — 서버 세션 종료. 실패해도 클라이언트 정리는 진행돼야 하므로 오류는 삼킨다 */
  logout: (accessToken: string): Promise<unknown> => (accessToken ? csrPost("/co/fo-auth/logout", undefined, bearer(accessToken)).catch(() => null) : Promise.resolve()),
};
