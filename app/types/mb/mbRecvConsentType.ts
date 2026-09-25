/**
 * 수신 동의(Y/N) — 회원가입·프로필 수정이 같은 모양을 쓴다.
 *  ① 필수(주문/문의)          : recvPhoneYn / recvKakaoYn / recvSmsYn / recvEmailYn — 휴대폰·이메일 중 1개 이상 필수(초기값 체크)
 *  ② 선택 마케팅(이벤트/기획전): recvMktKakaoYn / recvMktSmsYn / recvMktEmailYn
 *  ③ 선택 광고                : recvAdKakaoYn / recvAdSmsYn / recvAdEmailYn
 *  recvAdYn 은 광고 채널이 하나라도 Y 인 요약값(서버 하위 호환).
 */
export interface MbRecvConsentType {
  recvPhoneYn: string;
  recvKakaoYn: string;
  recvSmsYn: string;
  recvEmailYn: string;
  recvMktKakaoYn: string;
  recvMktSmsYn: string;
  recvMktEmailYn: string;
  recvAdKakaoYn: string;
  recvAdSmsYn: string;
  recvAdEmailYn: string;
  recvAdYn: string;
}
