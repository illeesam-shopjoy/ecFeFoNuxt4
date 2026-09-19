/**
 * myInfoSvc.ts — 내 회원정보(프로필) · 비밀번호 API 호출 객체 (로그인 필요). 2026-09-19.
 * 폴더 위치(svc/fo/ec/my/)는 BFF 라우트(server/api/fo/ec/my/*)를 그대로 따른다 — 배송지는 myAddrSvc.ts 참조.
 *   getProfile     → GET  /api/fo/ec/my/info      (ecBeBo /fo/ec/my/info)
 *   updateProfile  → PUT  /api/fo/ec/my/info      (이름·휴대폰·성별·생년월일·주소 7개 필드만 반영)
 *   changePassword → POST /api/fo/ec/my/password  (ecBeBo /fo/ec/my/password, body { currentPassword, newPassword })
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyProfile } from "~/types/foMyType";

const h = () => ({ headers: useAuthHeaders() });

export const myInfoSvc = {
  getProfile: () => $fetch<MyProfile>("/api/fo/ec/my/info", h()),
  updateProfile: (body: Partial<MyProfile>) => $fetch<{ memberNm: string; memberPhone: string }>("/api/fo/ec/my/info", { ...h(), method: "PUT", body }),
  changePassword: (currentPassword: string, newPassword: string) => $fetch<{ ok: boolean }>("/api/fo/ec/my/password", { ...h(), method: "POST", body: { currentPassword, newPassword } }),
};
