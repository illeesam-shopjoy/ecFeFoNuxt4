/** 비회원 결제 본인인증(PASS) 결과 — POST /api/identity/verify 응답 (서버가 포트원에서 확인한 값, CI/DI 는 내려주지 않는다) */
export interface MbIdentityVerifyType {
  verified: boolean;
  identityVerificationId: string; // 인증 건 ID (주문과 함께 백엔드에 넘겨 재확인)
  name: string; // 인증된 실명
  phoneNumber: string; // 인증된 휴대폰(숫자만)
  birthDate?: string; // 생년월일 yyyy-mm-dd
  gender?: string; // MALE / FEMALE
  isForeigner?: boolean;
  verifiedAt?: string; // 인증 시각(ISO)
  proof: string; // 서버 서명(HMAC) — 인증 결과 위변조 방지용
}
