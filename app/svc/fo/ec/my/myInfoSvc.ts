/**
 * myInfoSvc.ts — 내 정보/비밀번호 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/ec/my/info, /password, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyProfile } from "~/types/foMyType";

/** 백엔드 호출 전 검증 실패를 소비처(e.data.statusMessage)가 읽는 모양으로 던진다 */
function badRequest(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 400, statusMessage: message, data: { message, statusMessage: message } });
}

export const myInfoSvc = {
  /** GET /fo/ec/my/info — 내 프로필 */
  getProfile: async (): Promise<MyProfile> => {
    const m = (await axiosCsr.get<Record<string, unknown>>("/fo/ec/my/info", { headers: useAuthHeaders() })).data;
    return {
      memberId: m.memberId,
      loginId: m.loginId,
      memberNm: m.memberNm ?? "",
      memberEmail: m.memberEmail ?? "",
      memberPhone: m.memberPhone ?? "",
      memberGender: m.memberGender ?? "",
      birthDate: m.birthDate ? String(m.birthDate).slice(0, 10) : "",
      memberZipCode: m.memberZipCode ?? "",
      memberAddr: m.memberAddr ?? "",
      memberAddrDetail: m.memberAddrDetail ?? "",
    } as unknown as MyProfile;
  },

  /** PUT /fo/ec/my/info — 내 프로필 수정 (이름 필수, 성별은 M/F 만) */
  updateProfile: async (body: Partial<MyProfile>): Promise<{ memberNm: string; memberPhone: string }> => {
    const b = (body ?? {}) as Record<string, unknown>;
    const memberNm = String(b.memberNm ?? "").trim();
    if (!memberNm) badRequest("이름을 입력해 주세요.");
    const payload = {
      memberNm,
      memberPhone: String(b.memberPhone ?? "").trim(),
      memberGender: ["M", "F"].includes(String(b.memberGender)) ? String(b.memberGender) : "",
      birthDate: b.birthDate ? String(b.birthDate).slice(0, 10) : null,
      memberZipCode: String(b.memberZipCode ?? "").trim(),
      memberAddr: String(b.memberAddr ?? "").trim(),
      memberAddrDetail: String(b.memberAddrDetail ?? "").trim(),
    };
    const saved = (await axiosCsr.put<Record<string, unknown>>("/fo/ec/my/info", payload, { headers: useAuthHeaders() })).data;
    return { memberNm: String(saved?.memberNm ?? payload.memberNm), memberPhone: String(saved?.memberPhone ?? payload.memberPhone) };
  },

  /** POST /fo/ec/my/password — 비밀번호 변경 (새 비밀번호 6자 이상) */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ ok: boolean }> => {
    if (!currentPassword) badRequest("현재 비밀번호를 입력해 주세요.");
    if (String(newPassword ?? "").length < 6) badRequest("새 비밀번호는 6자 이상이어야 합니다.");
    await axiosCsr.post("/fo/ec/my/password", { currentPassword, newPassword }, { headers: useAuthHeaders() });
    return { ok: true };
  },
};
