/** 수신 동의(Y/N) — 휴대폰/카카오/SMS/이메일 + 광고. 회원가입·프로필 수정이 같은 모양을 쓴다. */
export interface MbRecvConsentType {
  recvPhoneYn: string;
  recvKakaoYn: string;
  recvSmsYn: string;
  recvEmailYn: string;
  recvAdYn: string;
}
