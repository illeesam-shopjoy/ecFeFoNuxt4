import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { BeDpPanelItem } from "../area/[areaCd].get";

export interface BeDpPanel {
  panelId: string;
  areaId: string;
  panelNm: string;
  panelTypeCd?: string | null;
  dispPanelStatusCd?: string | null;
  useYn?: string | null;
  panelItems?: BeDpPanelItem[];
}

/**
 * 전시패널관리(어드민) — 패널 목록(패널항목 포함). ecBeBo GET /api/fo/ec/dp/admin/panel 프록시(FO_ONLY).
 * query.areaId 로 특정 영역의 패널만 조회.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const list = await beApi.get<BeDpPanel[]>(
    "/fo/ec/dp/admin/panel",
    { areaId: query.areaId || undefined },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url, "list size=" + (list?.length ?? 0));
  return list ?? [];
});
