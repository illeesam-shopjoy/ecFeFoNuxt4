import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 내 알림 목록 — ecBeBo GET /api/fo/my/noti/list 프록시 (2026-09-19, ecFeBo CoNotiBell 이식). 로그인 필요.
 * 최신순으로 limit(기본 30, 최대 100)건만 내려준다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const limit = Math.min(Math.max(Number(getQuery(event).limit ?? 30) || 30, 1), 100);
  const list = await beApi.get<Record<string, unknown>[]>("/fo/my/noti/list", undefined, authHeaderFrom(event), 8000);
  const out = (list ?? [])
    .slice()
    .sort((a, b) => String(b.regDate ?? "").localeCompare(String(a.regDate ?? "")))
    .slice(0, limit);

  logger.info("[api] ◀", method, url, "count=" + out.length);
  return out;
});
