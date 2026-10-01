/** 아이디 찾기 결과 — 가린 로그인ID 목록 */
export interface SyFoundIdType {
  maskedIds: string[];
}
/** 비밀번호 찾기 ① 이메일 인증 완료 → 1회용 재설정 토큰 (2026-10-02: 본인확인번호 단계는 이메일 링크 인증으로 대체됨) */
export interface SyPwResetTokenType {
  resetToken: string;
}
