import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 문의 등록 — ecBeBo POST /api/fo/inquiry/create 프록시 (2026-09-19, ecFeBo foApiSvc.myInquiry.create 이식).
 * 비로그인도 등록할 수 있다(FoInquiryController 는 공개). 로그인 상태면 Authorization 을 그대로 전달해 회원 문의로 남긴다.
 * body(CmContactSubmitDto.Request): inquiryType, name, email, tel?, orderNo?, message — 허용 필드만 골라 보낸다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = ((await readBody(event).catch(() => ({}))) ?? {}) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!name || !email || !message) throw createError({ statusCode: 400, statusMessage: "이름, 이메일, 문의 내용을 모두 입력해 주세요." });

  const payload = {
    inquiryType: String(body.inquiryType ?? "").trim(),
    name,
    email,
    tel: String(body.tel ?? "").trim(),
    orderNo: String(body.orderNo ?? "").trim(),
    message,
  };
  const res = await beApi.post<unknown>("/fo/inquiry/create", payload, authHeaderFrom(event));
  logger.info("[api] ◀", method, url);
  return res;
});
