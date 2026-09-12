/**
 * 로그인 API. ecBeBo FoAuthController(POST /api/co/fo-auth/login) 프록시.
 * 2026-09-12 BFF 전환: 기존 데모계정(demoN@mail.com)·자체 Redis/JWT 발급을 전부 제거하고
 * ecBeBo가 발급한 accessToken·회원 프로필을 그대로 프록시한다 — ecBeBo가 유일한 인증 소스.
 * siteId는 FO 로그인 화면에 사이트 선택란이 없어 생략(로그인 요청의 siteId는 선택값이라
 * 생략하면 FoAuthService.login()이 사이트 일치 검사를 건너뛴다).
 */
import { beApi } from "~~/server/utils/beApi";

interface BeLoginRes {
  accessToken: string;
  memberId: string;
  userNm: string;
  userEmail: string;
  userPhone?: string;
  siteId?: string;
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as { email?: string; password?: string };
  const loginId = String(body?.email ?? "").trim();
  const loginPwd = String(body?.password ?? "");

  if (!loginId || !loginPwd) {
    throw createError({ statusCode: 400, statusMessage: "이메일과 비밀번호를 입력해 주세요." });
  }

  const result = await beApi.post<BeLoginRes>("/co/fo-auth/login", { loginId, loginPwd });

  return {
    token: result.accessToken,
    user: {
      memberId: result.memberId,
      userNm: result.userNm,
      userEmail: result.userEmail,
      userPhone: result.userPhone,
      siteId: result.siteId,
    },
  };
});
