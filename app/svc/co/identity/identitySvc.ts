/**
 * identitySvc.ts — 본인인증(PASS) 결과 서버 검증 (server/api/identity/verify.post.ts).
 * 포트원 API 시크릿은 서버에만 있어야 해서 axiosCsr(ecBeBo 직접 호출) 대신 $fetch(/api/...)를 쓰는 예외다 (결제 승인과 같은 이유).
 */
import type { MbIdentityVerifyType } from "~/types/mb/mbIdentityVerifyType";

export const identitySvc = {
  /** POST /api/identity/verify — 인증창을 마친 identityVerificationId 를 포트원에서 조회해 인증 완료 여부/정보를 확인 */
  verify: (identityVerificationId: string): Promise<MbIdentityVerifyType> =>
    $fetch<MbIdentityVerifyType>("/api/identity/verify", { method: "POST", body: { identityVerificationId } }),
};
