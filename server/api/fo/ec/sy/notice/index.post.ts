import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 공지 등록(관리자). ecBeBo POST /api/fo/sy/notice 프록시. */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{ noticeTitle: string; noticeType: string; noticeContent?: string; status: string }>(event);
  if (!body?.noticeTitle?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "공지제목을 입력하세요." });
  }

  const created = await beApi.post<{ noticeId: string }>(
    "/fo/sy/notice",
    {
      noticeTitle: body.noticeTitle.trim(),
      noticeTypeCd: body.noticeType || "GENERAL",
      contentHtml: body.noticeContent?.trim() ?? "",
      noticeStatusCd: body.status || "ACTIVE",
    },
    authHeaderFrom(event),
  );

  const out = { noticeId: created.noticeId };
  logger.info("[api] ◀", method, url, out);
  return out;
});
