import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/** 공지 수정(관리자). ecBeBo PUT /api/base/sy/notice/{id} 프록시. */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 공지 ID입니다." });

  const body = await readBody<{ noticeTitle: string; noticeType: string; noticeContent?: string; status: string }>(event);
  if (!body?.noticeTitle?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "공지제목을 입력하세요." });
  }

  await beApi.put(
    `/base/sy/notice/${id}`,
    {
      noticeTitle: body.noticeTitle.trim(),
      noticeTypeCd: body.noticeType || "GENERAL",
      contentHtml: body.noticeContent?.trim() ?? "",
      noticeStatusCd: body.status || "ACTIVE",
    },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url);
  return { ok: true };
});
