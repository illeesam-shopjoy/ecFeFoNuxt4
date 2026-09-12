/**
 * 회원가입. ecBeBo FoAuthController(POST /api/co/fo-auth/join) 프록시.
 * ecBeBo FoAuthService.join()이 그대로 MbMember 엔티티를 JSON으로 받는다 — 필드명이
 * loginPwdHash 지만 실제로 여기 담는 값은 평문 비밀번호다(서버가 그 자리에서 encode 후 저장,
 * ecBeBo 코드 확인함). memberId/siteId/memberStatusCd 등은 서버가 알아서 채우므로 보내지 않는다.
 */
import { beApi } from "~~/server/utils/beApi";

interface BeJoinRes {
  memberId: string;
  loginId: string;
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as { name?: string; email?: string; password?: string };
  const memberNm = String(body?.name ?? "").trim();
  const loginId = String(body?.email ?? "").trim();
  const loginPwdHash = String(body?.password ?? ""); // 평문 — ecBeBo가 encode

  if (!memberNm || !loginId || !loginPwdHash) {
    throw createError({ statusCode: 400, statusMessage: "이름, 이메일, 비밀번호를 모두 입력해 주세요." });
  }

  const result = await beApi.post<BeJoinRes>("/co/fo-auth/join", { memberNm, loginId, loginPwdHash });
  return { memberId: result.memberId, loginId: result.loginId };
});
