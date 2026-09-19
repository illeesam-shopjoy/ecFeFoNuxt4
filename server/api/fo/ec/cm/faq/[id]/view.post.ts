import { beApi } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * FAQ 펼침(읽음) 시 조회수 +1. ecBeBo POST /api/fo/faq/{faqId}/view 프록시 (공개, 로그인 불필요).
 * 응답: 갱신된 조회수(number). 캐시하지 않는다(쓰기).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "잘못된 FAQ ID입니다." });

  const count = await beApi.post<number>(`/fo/faq/${encodeURIComponent(id)}/view`, {});
  logger.info("[api] ◀", method, url, "viewCount=" + count);
  return count;
});
