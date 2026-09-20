/**
 * mapMy.ts — 회원/마이페이지 요청 본문 조립·검증, 응답 가공 (svc 는 전송만).
 */
import type { AuthUser } from "~/store/useAuthStore";
import type { SyLoginResType } from "~/types/sy/syLoginResType";
import type { CmContactSubmitType } from "~/types/cm/cmContactSubmitType";
import type { MyInquirySubmit, MyNotiItem, MyProfile } from "~/types/fo/foMyType";
import { badRequest, requireText } from "~/utils/svcInput";

// ── 인증 ──
export function buildLoginPayload(email: string, password: string): { loginId: string; loginPwd: string } {
  const loginId = String(email ?? "").trim();
  const loginPwd = String(password ?? "");
  if (!loginId || !loginPwd) badRequest("이메일과 비밀번호를 입력해 주세요.");
  return { loginId, loginPwd };
}
export const mapLoginRes = (r: SyLoginResType): { token: string; user: AuthUser } => ({
  token: r.accessToken,
  user: { memberId: r.memberId, userNm: r.userNm, userEmail: r.userEmail, userPhone: r.userPhone, siteId: r.siteId },
});
/** 회원가입 본문 — loginPwdHash 필드에 평문을 담는다(ecBeBo 가 그 자리에서 encode) */
export function buildJoinPayload(name: string, email: string, password: string): { memberNm: string; loginId: string; loginPwdHash: string } {
  const memberNm = String(name ?? "").trim();
  const loginId = String(email ?? "").trim();
  const loginPwdHash = String(password ?? "");
  if (!memberNm || !loginId || !loginPwdHash) badRequest("이름, 이메일, 비밀번호를 모두 입력해 주세요.");
  return { memberNm, loginId, loginPwdHash };
}

// ── 내 정보 ──
export function mapProfile(m: Record<string, unknown>): MyProfile {
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
}
/** PUT /fo/ec/my/info 본문 — 이름 필수, 성별은 M/F 만 */
export function buildProfileUpdatePayload(body: Partial<MyProfile>) {
  const b = (body ?? {}) as Record<string, unknown>;
  const memberNm = requireText(b.memberNm, "이름을 입력해 주세요.");
  return {
    memberNm,
    memberPhone: String(b.memberPhone ?? "").trim(),
    memberGender: ["M", "F"].includes(String(b.memberGender)) ? String(b.memberGender) : "",
    birthDate: b.birthDate ? String(b.birthDate).slice(0, 10) : null,
    memberZipCode: String(b.memberZipCode ?? "").trim(),
    memberAddr: String(b.memberAddr ?? "").trim(),
    memberAddrDetail: String(b.memberAddrDetail ?? "").trim(),
  };
}
/** 비밀번호 변경 검증 — 현재 비밀번호 필수, 새 비밀번호 6자 이상 */
export function assertPasswordChange(currentPassword: string, newPassword: string): void {
  if (!currentPassword) badRequest("현재 비밀번호를 입력해 주세요.");
  if (String(newPassword ?? "").length < 6) badRequest("새 비밀번호는 6자 이상이어야 합니다.");
}

// ── 문의 ──
/** 1:1 문의 등록 본문(이름/이메일/내용 필수) */
export function buildInquiryPayload(body: MyInquirySubmit) {
  const b = body as unknown as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const message = String(b.message ?? "").trim();
  if (!name || !email || !message) badRequest("이름, 이메일, 문의 내용을 모두 입력해 주세요.");
  return { inquiryType: String(b.inquiryType ?? "").trim(), name, email, tel: String(b.tel ?? "").trim(), orderNo: String(b.orderNo ?? "").trim(), message };
}
/** 고객센터 문의 접수(문의하기 화면) 본문 — 필수값 검증 */
export function buildContactPayload(body: CmContactSubmitType): CmContactSubmitType {
  requireText(body.name, "이름을 입력해 주세요.");
  requireText(body.email, "이메일을 입력해 주세요.");
  requireText(body.message, "문의 내용을 입력해 주세요.");
  return body;
}

// ── 알림 ──
/** 최신순 정렬 후 limit(1~100)만 자른다(백엔드는 전체를 준다) */
export function latestNotis(list: MyNotiItem[], limit = 30): MyNotiItem[] {
  const max = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const reg = (n: MyNotiItem) => String((n as unknown as Record<string, unknown>).regDate ?? "");
  return list
    .slice()
    .sort((a, b) => reg(b).localeCompare(reg(a)))
    .slice(0, max);
}

// ── 채팅 ──
export const requireMsgText = (v: unknown) => requireText(v, "메시지 내용이 필요합니다.");
