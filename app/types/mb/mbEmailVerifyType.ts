/**
 * 이메일 링크 인증(PASS 대체, 2026-10-02) — ecBeBo FoAuthEmailVerifyController(/api/co/fo-auth/email-verify/**) 계약.
 * 이메일 인증은 "그 메일함에 접근할 수 있다"만 증명한다(실명/휴대폰 확인 아님).
 */
/** 인증 목적 — 서버가 목적별로 완료 후 이동 경로를 고정한다 */
export type MbEmailVerifyPurposeType = "JOIN" | "SELLER_APPLY" | "CHECKOUT_GUEST" | "FIND_ACCOUNT" | "CHAT_GUEST" | "MYPAGE";

/** POST /request 응답 — verifyId 는 요청한 화면만 아는 비밀 핸들(폴링·가입/로그인 시 서버로 되돌려 보낸다) */
export interface MbEmailVerifyRequestedType {
  verifyId: string;
  maskedEmail: string;
  expireMinutes: number;
}

/** GET /status 응답 */
export interface MbEmailVerifyStatusType {
  verified: boolean;
}

/**
 * 링크 유형 — 한 링크 페이지(/verify-email)를 모든 목적이 같이 쓰므로 서버가 목적별로 정한다.
 * SIMPLE: 링크만 열면 인증 완료(가입·계정찾기·비회원 결제/채팅) / IDENTITY: 본인인증 확인 — PC 는 비밀번호 재입력, 모바일은 기기 인증(지문·얼굴)까지 거쳐야 완료(마이페이지·판매자신청)
 */
export type MbEmailVerifyLinkType = "SIMPLE" | "IDENTITY";

/** POST /preview 응답 — 링크 페이지 진입 시(인증 상태는 바뀌지 않음) */
export interface MbEmailVerifyPreviewType {
  purposeCd: MbEmailVerifyPurposeType;
  linkType: MbEmailVerifyLinkType;
  maskedEmail: string;
  reauthRequired: boolean; // IDENTITY 이고 아직 인증 전이면 true
  challenge?: string; // 기기 인증(WebAuthn)용 challenge (base64url)
}

/** 본인 재확인 입력 — PC: password / 모바일 기기 인증: clientDataJSON + authenticatorData (base64url) */
export interface MbEmailVerifyReauthType {
  password?: string;
  clientDataJSON?: string;
  authenticatorData?: string;
}

/** POST /confirm 응답 — 메일 링크 페이지가 받아 안내 후 redirectPath 로 이동 */
export interface MbEmailVerifyConfirmedType {
  purposeCd: MbEmailVerifyPurposeType;
  redirectPath: string;
  maskedEmail: string;
}
