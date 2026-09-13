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
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const areaCd = getRouterParam(event, "areaCd") ?? "";
  // 2026-09-13: 홈 화면 SSR 시 여러 위젯 영역이 동시에 조회되면서 자택 NAS 백엔드
  // 동시접속 부하로 일부가 타임아웃(502)나는 문제 완화 — areaCd별 캐시.
  // (2026-09-13 재조정: 페이지 첫 로딩이 15초 가까이 걸린다는 실측 확인 — 위젯 콘텐츠는
  // 관리자가 "전시패널관리"에서 수시로 바꾸는 게 아니라 60초는 지나치게 짧았다. 10분으로
  // 늘려 콜드 조회 자체의 빈도를 크게 줄인다 — 즉시 반영이 필요하면 캐시 만료를 기다리거나
  // 배포로 컨테이너를 새로 띄우면 된다.)
  const list = await cachedCall(`be:dp:area:${areaCd}`, 600_000, () => beApi.get<BeDpPanelItem[]>(`/fo/ec/dp/area/${encodeURIComponent(areaCd)}`));

  logger.info("[api] ◀", method, url, "list size=" + (list?.length ?? 0));
  return list ?? [];
});
