import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 내 회원정보(프로필) 수정 — ecBeBo PUT /api/fo/ec/my/info 프록시 (2026-09-19). 로그인 필요.
 * 백엔드도 이름/휴대폰/성별/생년월일/주소 7개 필드만 반영하지만, 여기서도 그 필드만 골라 보낸다(다른 값이 섞여 들어오는 것 차단).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = ((await readBody(event).catch(() => ({}))) ?? {}) as Record<string, unknown>;
  const memberNm = String(body.memberNm ?? "").trim();
  if (!memberNm) throw createError({ statusCode: 400, statusMessage: "이름을 입력해 주세요." });

  const payload = {
    memberNm,
    memberPhone: String(body.memberPhone ?? "").trim(),
    memberGender: ["M", "F"].includes(String(body.memberGender)) ? String(body.memberGender) : "",
    birthDate: body.birthDate ? String(body.birthDate).slice(0, 10) : null,
    memberZipCode: String(body.memberZipCode ?? "").trim(),
    memberAddr: String(body.memberAddr ?? "").trim(),
    memberAddrDetail: String(body.memberAddrDetail ?? "").trim(),
  };

  const saved = await beApi.put<Record<string, unknown>>("/fo/ec/my/info", payload, authHeaderFrom(event));
  logger.info("[api] ◀", method, url);
  return {
    memberNm: saved?.memberNm ?? payload.memberNm,
    memberPhone: saved?.memberPhone ?? payload.memberPhone,
  };
});
