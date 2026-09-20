/**
 * myInfoSvc.ts — 내 정보/비밀번호 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/ec/my/info, /password, FO_ONLY) — 로그인 토큰 필요(authCfg). 검증·가공은 utils/mapMy.ts.
 */
import { authCfg, csrGet, csrPost, csrPut } from "~/utils/svcHttp";
import { buildPasswordPayload, buildProfileUpdatePayload, mapProfile, mapProfileSaved, okRes } from "~/utils/mapMy";
import type { CoOkResType } from "~/types/co/coOkResType";
import type { MbMemberProfileType } from "~/types/mb/mbMemberProfileType";
import type { MbMemberType } from "~/types/mb/mbMemberType";

const INFO = "/fo/ec/my/info";

export const myInfoSvc = {
  /** GET /fo/ec/my/info — 내 프로필 */
  getProfile: (): Promise<MbMemberProfileType> => csrGet<MbMemberType>(INFO, authCfg()).then(mapProfile),

  /** GET /fo/ec/my/info — 보유 캐시(적립금) 잔액 */
  getCacheBalance: (): Promise<number> => csrGet<MbMemberType>(INFO, authCfg()).then((m) => Number(m.cacheBalanceAmt ?? 0)),

  /** PUT /fo/ec/my/info — 내 프로필 수정 (이름 필수, 성별은 M/F 만). 저장된 이름·연락처를 돌려준다 */
  updateProfile: (body: Partial<MbMemberProfileType>): Promise<Pick<MbMemberProfileType, "memberNm" | "memberPhone">> => {
    const payload = buildProfileUpdatePayload(body);
    return csrPut<MbMemberType>(INFO, payload, authCfg()).then((saved) => mapProfileSaved(saved, payload));
  },

  /** POST /fo/ec/my/info/pass-verify — PASS 본인인증 완료 반영(서버가 포트원에서 재확인) */
  passVerify: (identityVerificationId: string): Promise<MbMemberProfileType> =>
    csrPost<MbMemberType>(`${INFO}/pass-verify`, { identityVerificationId }, authCfg()).then(mapProfile),

  /** POST /fo/ec/my/password — 비밀번호 변경 (새 비밀번호 6자 이상) */
  changePassword: (currentPassword: string, newPassword: string): Promise<CoOkResType> =>
    csrPost("/fo/ec/my/password", buildPasswordPayload(currentPassword, newPassword), authCfg()).then(okRes),
};
