/**
 * dpAreaSvc.ts — 전시 영역(dp_area) 위젯 조회 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoDpAreaController(/api/fo/ec/dp/area/{areaCd}, 공개) 를 직접 부른다.
 * 히어로슬라이더/브랜드로고/푸터 링크 등 하드코딩이던 것들이 이 API 로 내려온다([[ecfefonuxt4-dp-widget-migration]]).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import type { DpPanelItemType } from "~/types/dp/dpPanelItemType";

export const dpAreaSvc = {
  /** GET /fo/ec/dp/area/{areaCd} — 영역의 활성 위젯 아이템 목록 */
  getActiveItems: async (areaCd: string): Promise<DpPanelItemType[]> =>
    (await axiosCsr.get<DpPanelItemType[]>(`/fo/ec/dp/area/${encodeURIComponent(areaCd)}`)).data ?? [],

  /** 영역의 첫 위젯 config(JSON)를 파싱해서 반환. 미등록/조회실패/파싱실패는 null → 호출부가 기본값 폴백 */
  async getFirstWidgetConfig<T>(areaCd: string): Promise<T | null> {
    try {
      const items = await dpAreaSvc.getActiveItems(areaCd);
      const raw = items?.[0]?.widgetConfigJson;
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};
