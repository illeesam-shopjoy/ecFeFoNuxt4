/**
 * mapMy.ts — 회원/마이페이지 요청 본문 조립·검증, 응답 가공 (svc 는 전송만).
 */
import type { SyLoginResType } from "~/types/sy/syLoginResType";
import type { CmContactSubmitType } from "~/types/cm/cmContactSubmitType";
import type { CoOkResType } from "~/types/co/coOkResType";
import type { MbMemberProfileType } from "~/types/mb/mbMemberProfileType";
import type { MbMemberType } from "~/types/mb/mbMemberType";
import type { SyLoginSessionType } from "~/types/sy/syLoginSessionType";
import type { SyNotiType } from "~/types/sy/syNotiType";
import { badRequest, requireText } from "~/utils/svcInput";

// ── 인증 ──
export function buildLoginPayload(email: string, password: string): { loginId: string; loginPwd: string } {
  const loginId = String(email ?? "").trim();
  const loginPwd = String(password ?? "");
  if (!loginId || !loginPwd) badRequest("이메일과 비밀번호를 입력해 주세요.");
  return { loginId, loginPwd };
}
export const mapLoginRes = (r: SyLoginResType): SyLoginSessionType => ({
  token: r.accessToken,
  user: { memberId: r.memberId, userNm: r.userNm, userEmail: r.userEmail, userPhone: r.userPhone, siteId: r.siteId },
});
/** 회원가입 본문 — loginPwdHash 필드에 평문을 담는다(ecBeBo 가 그 자리에서 encode) */
export function buildJoinPayload(name: string, email: string, password: string, passVerifyId?: string, extra: Record<string, string> = {}): Record<string, string> {
  const memberNm = String(name ?? "").trim();
  const loginId = String(email ?? "").trim();
  const loginPwdHash = String(password ?? "");
  if (!memberNm || !loginId || !loginPwdHash) badRequest("이름, 이메일, 비밀번호를 모두 입력해 주세요.");
  // extra: 프로필 이미지 URL · 수신 동의(recv*Yn) 등 가입 화면이 함께 보내는 선택 항목(Y/N·URL 만 허용)
  const safe = Object.fromEntries(Object.entries(extra).filter(([k, v]) => (k === "profileImgUrl" && typeof v === "string") || (/^recv(Phone|Kakao|Sms|Email|Ad|MktEvent|MktPlan)Yn$/.test(k) && (v === "Y" || v === "N"))));
  return { memberNm, loginId, loginPwdHash, ...(passVerifyId ? { passVerifyId } : {}), ...safe };
}

// ── 내 정보 ──
export const mapProfile = (m: MbMemberType): MbMemberProfileType => ({
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
  passVerifiedYn: m.passVerifiedYn ?? "N",
  passVerifiedDate: m.passVerifiedDate,
  profileImgUrl: m.profileImgUrl ?? "",
  recvPhoneYn: m.recvPhoneYn ?? "N",
  recvKakaoYn: m.recvKakaoYn ?? "N",
  recvSmsYn: m.recvSmsYn ?? "N",
  recvEmailYn: m.recvEmailYn ?? "N",
  recvAdYn: m.recvAdYn ?? "N",
  recvMktEventYn: m.recvMktEventYn ?? "N",
  recvMktPlanYn: m.recvMktPlanYn ?? "N",
});
/** PUT /fo/ec/my/info 본문 — 이름 필수, 성별은 M/F 만 */
export function buildProfileUpdatePayload(body: Partial<MbMemberProfileType>) {
  const memberNm = requireText(body.memberNm, "이름을 입력해 주세요.");
  return {
    memberNm,
    memberPhone: String(body.memberPhone ?? "").trim(),
    memberGender: ["M", "F"].includes(String(body.memberGender)) ? String(body.memberGender) : "",
    birthDate: body.birthDate ? String(body.birthDate).slice(0, 10) : null,
    memberZipCode: String(body.memberZipCode ?? "").trim(),
    memberAddr: String(body.memberAddr ?? "").trim(),
    memberAddrDetail: String(body.memberAddrDetail ?? "").trim(),
    profileImgUrl: String(body.profileImgUrl ?? "").trim(),
    recvPhoneYn: body.recvPhoneYn === "Y" ? "Y" : "N",
    recvKakaoYn: body.recvKakaoYn === "Y" ? "Y" : "N",
    recvSmsYn: body.recvSmsYn === "Y" ? "Y" : "N",
    recvEmailYn: body.recvEmailYn === "Y" ? "Y" : "N",
    recvAdYn: body.recvAdYn === "Y" ? "Y" : "N",
    recvMktEventYn: body.recvMktEventYn === "Y" ? "Y" : "N",
    recvMktPlanYn: body.recvMktPlanYn === "Y" ? "Y" : "N",
  };
}
/** 저장 응답 → 헤더/드롭다운에 즉시 반영할 이름·연락처 (응답이 비면 보낸 값) */
export const mapProfileSaved = (saved: MbMemberType | null | undefined, payload: { memberNm: string; memberPhone: string }): Pick<MbMemberProfileType, "memberNm" | "memberPhone"> => ({
  memberNm: String(saved?.memberNm ?? payload.memberNm),
  memberPhone: String(saved?.memberPhone ?? payload.memberPhone),
});
/** 비밀번호 변경 검증 — 현재 비밀번호 필수, 새 비밀번호 6자 이상 */
export function assertPasswordChange(currentPassword: string, newPassword: string): void {
  if (!currentPassword) badRequest("현재 비밀번호를 입력해 주세요.");
  if (String(newPassword ?? "").length < 6) badRequest("새 비밀번호는 6자 이상이어야 합니다.");
}

/** POST /fo/ec/my/password 본문 — 검증 통과 후 조립 */
export function buildPasswordPayload(currentPassword: string, newPassword: string): { currentPassword: string; newPassword: string } {
  assertPasswordChange(currentPassword, newPassword);
  return { currentPassword, newPassword };
}
export const okRes = (): CoOkResType => ({ ok: true });

// ── 문의 ──
/** 1:1 문의 등록 본문(이름/이메일/내용 필수) */
export function buildInquiryPayload(body: CmContactSubmitType) {
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!name || !email || !message) badRequest("이름, 이메일, 문의 내용을 모두 입력해 주세요.");
  return { inquiryType: String(body.inquiryType ?? "").trim(), name, email, tel: String(body.tel ?? "").trim(), orderNo: String(body.orderNo ?? "").trim(), message };
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
export function latestNotis(list: SyNotiType[], limit = 30): SyNotiType[] {
  const max = Math.min(Math.max(Number(limit) || 30, 1), 100);
  return list
    .slice()
    .sort((a, b) => String(b.regDate ?? "").localeCompare(String(a.regDate ?? "")))
    .slice(0, max);
}

// ── 채팅 ──
export const requireMsgText = (v: unknown) => requireText(v, "메시지 내용이 필요합니다.");
