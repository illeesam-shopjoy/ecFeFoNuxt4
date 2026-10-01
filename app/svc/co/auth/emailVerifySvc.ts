/**
 * emailVerifySvc.ts — 이메일 링크 인증 API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-10-02, PASS 대체.
 * ecBeBo FoAuthEmailVerifyController(/api/co/fo-auth/email-verify/**, 공개). 로그인 목적(MYPAGE/SELLER_APPLY)만 토큰이 필요하다 —
 * 공개 API 에 만료 토큰이 붙어 401 나는 것을 막으려고 그 두 목적에만 authCfg() 를 붙인다.
 */
import { authCfg, csrGet, csrPost } from "~/utils/svcHttp";
import type { MbEmailVerifyConfirmedType, MbEmailVerifyPreviewType, MbEmailVerifyPurposeType, MbEmailVerifyReauthType, MbEmailVerifyRequestedType, MbEmailVerifyStatusType } from "~/types/mb/mbEmailVerifyType";

const BASE = "/co/fo-auth/email-verify";
const needsLogin = (p: MbEmailVerifyPurposeType) => p === "MYPAGE" || p === "SELLER_APPLY";

export const emailVerifySvc = {
  /** POST /request — 인증 메일 발송. 로그인 목적은 서버가 내 이메일로만 보낸다(email 은 무시) */
  request: (purposeCd: MbEmailVerifyPurposeType, email: string): Promise<MbEmailVerifyRequestedType> =>
    csrPost<MbEmailVerifyRequestedType>(`${BASE}/request`, { purposeCd, email }, needsLogin(purposeCd) ? authCfg() : undefined),

  /** GET /status — 요청 화면의 폴링. 메일 링크 인증이 끝났는지 */
  status: (verifyId: string): Promise<MbEmailVerifyStatusType> => csrGet<MbEmailVerifyStatusType>(`${BASE}/status`, { params: { verifyId } }),

  /** POST /preview — 메일 링크 페이지 진입 시 링크 유형(SIMPLE/IDENTITY)과 재확인 필요 여부를 받는다(인증 상태는 안 바뀜) */
  preview: (token: string): Promise<MbEmailVerifyPreviewType> => csrPost<MbEmailVerifyPreviewType>(`${BASE}/preview`, { token }),

  /** POST /confirm — 메일 링크 페이지가 token 으로 인증 완료 처리. 링크 유형 IDENTITY 는 reauth(PC 비밀번호 / 모바일 기기 인증)가 필요하다 */
  confirm: (token: string, reauth: MbEmailVerifyReauthType = {}): Promise<MbEmailVerifyConfirmedType> => csrPost<MbEmailVerifyConfirmedType>(`${BASE}/confirm`, { token, ...reauth }),
};
