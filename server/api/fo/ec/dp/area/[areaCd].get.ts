import { beApi } from "~~/server/utils/beApi";
import { cachedCall } from "~~/server/utils/cache";
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
  // 2026-09-13: 홈 화면 SSR 시 여러 위젯 영역이 동시에 조회되면서 자택 NAS 백엔드
  // 동시접속 부하로 일부가 타임아웃(502)나는 문제 완화 — areaCd별 60초 캐시.
  const list = await cachedCall(`be:dp:area:${areaCd}`, 60_000, () => beApi.get<BeDpPanelItem[]>(`/fo/ec/dp/area/${encodeURIComponent(areaCd)}`));

  logger.info("[api] ◀", method, url, "list size=" + (list?.length ?? 0));
  return list ?? [];
});
