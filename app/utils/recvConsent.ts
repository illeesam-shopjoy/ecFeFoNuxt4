/** 수신 동의 도우미 — 회원가입/프로필 수정/표시가 같은 규칙을 쓴다(types/mb/mbRecvConsentType.ts 참조). */
import type { MbRecvConsentType } from "~/types/mb/mbRecvConsentType";

const N = "N";
const Y = "Y";

/** 수신 동의 초기값 — 필수(주문/문의)는 휴대폰·이메일 체크, 나머지는 미동의 */
export const defaultRecvConsent = (): MbRecvConsentType => ({
  recvPhoneYn: Y,
  recvKakaoYn: N,
  recvSmsYn: N,
  recvEmailYn: Y,
  recvMktKakaoYn: N,
  recvMktSmsYn: N,
  recvMktEmailYn: N,
  recvAdKakaoYn: N,
  recvAdSmsYn: N,
  recvAdEmailYn: N,
  recvAdYn: N,
});

/** 필수(주문/문의) — 휴대폰 또는 이메일 중 1개 이상 */
export const isRequiredRecvOk = (c: Partial<MbRecvConsentType>): boolean => c.recvPhoneYn === Y || c.recvEmailYn === Y;
export const REQUIRED_RECV_MESSAGE = "수신 동의(필수·주문/문의)는 휴대폰 또는 이메일 중 1개 이상 선택해 주세요.";

/** 필수 그룹이 전부 N(아직 정한 적 없음)이면 초기값(휴대폰·이메일 체크)으로 채운다 — 기존 회원의 수정 화면용 */
export function withRequiredDefault(c: MbRecvConsentType): MbRecvConsentType {
  const anyRequired = c.recvPhoneYn === Y || c.recvKakaoYn === Y || c.recvSmsYn === Y || c.recvEmailYn === Y;
  return anyRequired ? c : { ...c, recvPhoneYn: Y, recvEmailYn: Y };
}

/** 광고 수신 요약값(recvAdYn) 채우기 — 광고 채널이 하나라도 Y 면 Y */
export function withAdSummary(c: MbRecvConsentType): MbRecvConsentType {
  return { ...c, recvAdYn: c.recvAdKakaoYn === Y || c.recvAdSmsYn === Y || c.recvAdEmailYn === Y ? Y : N };
}

/** 서버 응답의 Y/N 정리(없으면 N) */
export const yn = (v: unknown): string => (v === Y ? Y : N);
