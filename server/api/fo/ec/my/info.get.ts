import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 내 회원정보 조회 — ecBeBo GET /api/fo/ec/my/info 프록시 (2026-09-19, 프로필 수정 모달용). 로그인 필요.
 * 프로필 수정 화면이 쓰는 필드만 내려준다(회원등급/상태/메모 등 내부 정보는 제외).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const m = await beApi.get<Record<string, unknown>>("/fo/ec/my/info", undefined, authHeaderFrom(event), 8000);
  const out = {
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
  };
  logger.info("[api] ◀", method, url);
  return out;
});
