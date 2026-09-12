import { beApi } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

export interface BeDpPanelItem {
  panelItemId: string;
  panelId: string;
  widgetTypeCd?: string | null;
  widgetTitle?: string | null;
  widgetContent?: string | null;
  widgetConfigJson?: string | null;
  sortOrd?: number | null;
}

/**
 * 전시 영역(area_cd)의 활성 위젯 목록. ecBeBo GET /api/fo/ec/dp/area/{areaCd} 프록시(공개, 인증 불필요).
 * 홈 화면 히어로 슬라이더·후기·브랜드로고 등 "전시 위젯" 콘텐츠 조회용 (2026-09-13 신설).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const areaCd = getRouterParam(event, "areaCd") ?? "";
  const list = await beApi.get<BeDpPanelItem[]>(`/fo/ec/dp/area/${encodeURIComponent(areaCd)}`);

  logger.info("[api] ◀", method, url, "list size=" + (list?.length ?? 0));
  return list ?? [];
});
