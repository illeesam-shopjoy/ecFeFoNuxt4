/** 수신 동의 도우미 — 회원가입/프로필 수정/표시가 같은 규칙을 쓴다(types/mb/mbRecvConsentType.ts 참조). */
import type { MbRecvConsentType } from "~/types/mb/mbRecvConsentType";

const N = "N";
const Y = "Y";

/** 수신 동의 초기값 — 필수(주문/문의)는 SMS·이메일 체크, 나머지는 미동의. (휴대폰 수신 recvPhoneYn 은 화면에서 제거돼 항상 N) */
export const defaultRecvConsent = (): MbRecvConsentType => ({
  recvPhoneYn: N,
  recvKakaoYn: N,
  recvSmsYn: Y,
  recvEmailYn: Y,
  recvMktEventYn: N,
  recvMktPlanYn: N,
  recvAdYn: N,
});

/** 필수(주문/문의) — SMS·이메일·카카오 중 1개 이상 */
export const isRequiredRecvOk = (c: Partial<MbRecvConsentType>): boolean => c.recvSmsYn === Y || c.recvEmailYn === Y || c.recvKakaoYn === Y;
export const REQUIRED_RECV_MESSAGE = "수신 동의(필수·주문/문의)는 SMS, 이메일, 카카오 중 1개 이상 선택해 주세요.";

/** 필수 그룹이 전부 N(아직 정한 적 없음)이면 초기값(SMS·이메일 체크)으로 채운다 — 기존 회원의 수정 화면용 */
export function withRequiredDefault(c: MbRecvConsentType): MbRecvConsentType {
  return isRequiredRecvOk(c) ? c : { ...c, recvSmsYn: Y, recvEmailYn: Y };
}

/** 서버 응답의 Y/N 정리(없으면 N) */
export const yn = (v: unknown): string => (v === Y ? Y : N);
