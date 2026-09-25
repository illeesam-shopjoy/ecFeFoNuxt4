/**
 * 수신 동의(Y/N) — 회원가입·프로필 수정이 같은 모양을 쓴다.
 *  ① 필수(주문/문의)  : recvSmsYn / recvEmailYn / recvKakaoYn — 1개 이상 필수(초기값 SMS·이메일 체크). recvPhoneYn 은 화면에서 제거(항상 N)
 *  ② 선택 마케팅      : recvMktEventYn(이벤트) / recvMktPlanYn(기획전) / recvAdYn(광고)
 */
export interface MbRecvConsentType {
  recvPhoneYn: string;
  recvKakaoYn: string;
  recvSmsYn: string;
  recvEmailYn: string;
  recvMktEventYn: string;
  recvMktPlanYn: string;
  recvAdYn: string;
}
