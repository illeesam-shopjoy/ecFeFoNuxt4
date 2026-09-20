/**
 * myInfoSvc.ts — 내 정보/비밀번호 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/ec/my/info, /password, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders). 검증·가공은 utils/mapMy.ts.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { assertPasswordChange, buildProfileUpdatePayload, mapProfile } from "~/utils/mapMy";
import type { MyProfile } from "~/types/fo/foMyType";

const auth = () => ({ headers: useAuthHeaders() });

export const myInfoSvc = {
  /** GET /fo/ec/my/info — 내 프로필 */
  getProfile: async (): Promise<MyProfile> => mapProfile((await axiosCsr.get<Record<string, unknown>>("/fo/ec/my/info", auth())).data),

  /** PUT /fo/ec/my/info — 내 프로필 수정 (이름 필수, 성별은 M/F 만) */
  updateProfile: async (body: Partial<MyProfile>): Promise<{ memberNm: string; memberPhone: string }> => {
    const payload = buildProfileUpdatePayload(body);
    const saved = (await axiosCsr.put<Record<string, unknown>>("/fo/ec/my/info", payload, auth())).data;
    return { memberNm: String(saved?.memberNm ?? payload.memberNm), memberPhone: String(saved?.memberPhone ?? payload.memberPhone) };
  },

  /** POST /fo/ec/my/password — 비밀번호 변경 (새 비밀번호 6자 이상) */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ ok: boolean }> => {
    assertPasswordChange(currentPassword, newPassword);
    await axiosCsr.post("/fo/ec/my/password", { currentPassword, newPassword }, auth());
    return { ok: true };
  },
};
