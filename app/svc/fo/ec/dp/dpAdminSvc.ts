/**
 * dpAdminSvc.ts — 전시패널관리 어드민(/dp/panels) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoDpAdminController(/api/fo/ec/dp/admin/**, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 * dp_ui → dp_area → dp_panel → dp_panel_item 4단 전시 구조([[ecfefonuxt4-dp-widget-convention]]).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { DpUiType } from "~/types/dp/dpUiType";
import type { DpAreaType } from "~/types/dp/dpAreaType";
import type { DpPanelType } from "~/types/dp/dpPanelType";
import type { DpPanelItemType } from "~/types/dp/dpPanelItemType";

const auth = () => ({ headers: useAuthHeaders() });
const BASE = "/fo/ec/dp/admin";

export const dpAdminSvc = {
  listUis: async (): Promise<DpUiType[]> => (await axiosCsr.get<DpUiType[]>(`${BASE}/ui`, auth())).data ?? [],
  createUi: async (body: { siteId: string; uiCd: string; uiNm: string; useYn?: string }): Promise<DpUiType> => (await axiosCsr.post<DpUiType>(`${BASE}/ui`, body, auth())).data,

  listAreas: async (): Promise<DpAreaType[]> => (await axiosCsr.get<DpAreaType[]>(`${BASE}/area`, auth())).data ?? [],
  createArea: async (body: { uiId: string; siteId: string; areaCd: string; areaNm: string; useYn?: string }): Promise<DpAreaType> =>
    (await axiosCsr.post<DpAreaType>(`${BASE}/area`, body, auth())).data,

  listPanels: async (areaId?: string): Promise<DpPanelType[]> => (await axiosCsr.get<DpPanelType[]>(`${BASE}/panel`, { ...auth(), params: { areaId: areaId || undefined } })).data ?? [],
  createPanel: async (body: { areaId: string; siteId: string; panelNm: string; panelTypeCd?: string; useYn?: string; dispPanelStatusCd?: string }): Promise<DpPanelType> =>
    (await axiosCsr.post<DpPanelType>(`${BASE}/panel`, body, auth())).data,

  listPanelItems: async (panelId: string): Promise<DpPanelItemType[]> =>
    (await axiosCsr.get<DpPanelItemType[]>(`${BASE}/panel-item`, { ...auth(), params: { panelId: panelId || undefined } })).data ?? [],
  createPanelItem: async (body: {
    panelId: string;
    siteId: string;
    widgetTypeCd: string;
    widgetTitle?: string;
    widgetContent?: string;
    widgetConfigJson?: string;
    sortOrd?: number;
    useYn?: string;
    dispYn?: string;
  }): Promise<DpPanelItemType> => (await axiosCsr.post<DpPanelItemType>(`${BASE}/panel-item`, body, auth())).data,
  updatePanelItem: async (id: string, body: Partial<DpPanelItemType> & { useYn?: string; dispYn?: string }): Promise<DpPanelItemType> =>
    (await axiosCsr.put<DpPanelItemType>(`${BASE}/panel-item/${encodeURIComponent(id)}`, body, auth())).data,
  deletePanelItem: async (id: string): Promise<{ success: boolean }> => {
    await axiosCsr.delete(`${BASE}/panel-item/${encodeURIComponent(id)}`, auth());
    return { success: true };
  },
};
