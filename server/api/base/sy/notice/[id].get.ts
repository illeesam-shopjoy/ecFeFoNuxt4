import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

interface BeNoticeItem {
  noticeId: string;
  noticeTitle: string;
  noticeTypeCd?: string | null;
  contentHtml?: string | null;
  noticeStatusCd?: string | null;
  regBy?: string | null;
  regDate?: string | null;
  updBy?: string | null;
  updDate?: string | null;
}

/** 공지 상세(관리자). ecBeBo GET /api/base/sy/notice/{id} 프록시. */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 공지 ID입니다." });

  const row = await beApi.get<BeNoticeItem>(`/base/sy/notice/${id}`, undefined, authHeaderFrom(event)).catch((e: unknown) => {
    const err = e as { statusCode?: number };
    if (err?.statusCode === 404) throw createError({ statusCode: 404, statusMessage: "공지를 찾을 수 없습니다." });
    throw e;
  });

  const out = {
    noticeId: row.noticeId,
    noticeTitle: row.noticeTitle,
    noticeType: row.noticeTypeCd ?? "",
    noticeContent: row.contentHtml ?? "",
    status: row.noticeStatusCd ?? "",
    createBy: row.regBy ?? "",
    createTime: row.regDate ?? null,
    updateBy: row.updBy ?? "",
    updateTime: row.updDate ?? null,
    remark: "",
  };
  logger.info("[api] ◀", method, url);
  return out;
});
