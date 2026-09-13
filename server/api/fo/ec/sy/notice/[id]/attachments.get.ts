import { beApi, authHeaderFrom, type BePage } from "~~/server/utils/beApi";
import { resolveProdCdnUrl } from "~~/server/utils/cdn";
import { logger } from "~~/server/utils/logger";

interface BeAttachItem {
  attachId: string;
  fileNm: string;
  fileExt?: string | null;
  fileSize?: number | null;
  mimeTypeCd?: string | null;
  attachUrl?: string | null;
  cdnImgUrl?: string | null;
  sortOrd?: number | null;
}

/** 공지 첨부파일 목록. ecBeBo GET /api/fo/sy/attach/page?refTableNm=sy_notice&refId={id} 프록시. */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 공지 ID입니다." });

  const page = await beApi.get<BePage<BeAttachItem>>("/fo/sy/attach/page", { refTableNm: "sy_notice", refId: id, pageSize: 100 }, authHeaderFrom(event));
  const list = page.pageList.map((r) => ({
    attachId: r.attachId,
    fileNm: r.fileNm,
    physicalNm: r.fileNm,
    ext: r.fileExt ?? "",
    fileSize: r.fileSize ?? undefined,
    mimeType: r.mimeTypeCd ?? undefined,
    url: resolveProdCdnUrl(r.cdnImgUrl ?? r.attachUrl) ?? "",
    sortOrder: r.sortOrd ?? 0,
  }));

  logger.info("[api] ◀", method, url, "count=" + list.length);
  return { list };
});
