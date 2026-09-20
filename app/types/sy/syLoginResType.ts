/** 로그인 응답(ecBeBo FoAuthController) — accessToken + 회원 프로필. */
export interface SyLoginResType {
  accessToken: string;
  memberId: string;
  userNm: string;
  userEmail: string;
  userPhone?: string;
  siteId?: string;
}

/** 토큰 재발급 응답 — accessExpiresIn 은 분(minute) 단위(ecBeBo JwtProvider 기준). */
export interface SyTokenPairType {
  accessToken: string;
  refreshToken: string | null;
  accessExpiresIn: number;
}
