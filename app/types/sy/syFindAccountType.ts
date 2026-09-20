/** 아이디 찾기 결과 — 가린 로그인ID 목록 */
export interface SyFoundIdType {
  maskedIds: string[];
}
/** 비밀번호 찾기 ① 본인확인번호 발송 결과 */
export interface SyPwCodeSentType {
  maskedEmail: string; // 번호를 보낸 메일(가림)
  expireMinutes: number; // 유효 시간(분)
}
/** 비밀번호 찾기 ② 본인확인 완료 → 1회용 재설정 토큰 */
export interface SyPwResetTokenType {
  resetToken: string;
}
