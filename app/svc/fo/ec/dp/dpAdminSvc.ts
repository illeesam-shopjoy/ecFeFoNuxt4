/**
 * dpAdminSvc.ts — 전시패널관리 어드민(/dp/panels) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoDpAdminController(/api/fo/ec/dp/admin/**, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 * dp_ui → dp_area → dp_panel → dp_panel_item 4단 전시 구조([[ecfefonuxt4-dp-widget-convention]]).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { DpAreaWidgetItem } from "./dpAreaSvc";

export interface DpUiRow {
  uiId: string;
  siteId: string;
  uiCd: string;
  uiNm: string;
  useYn?: string | null;
}

export interface DpAreaRow {
  areaId: string;
  uiId: string;
  areaCd: string;
  areaNm: string;
  areaTypeCd?: string | null;
  areaDesc?: string | null;
  useYn?: string | null;
}

export interface DpPanelRow {
  panelId: string;
  areaId: string;
  panelNm: string;
  panelTypeCd?: string | null;
  dispPanelStatusCd?: string | null;
  useYn?: string | null;
  panelItems?: DpAreaWidgetItem[];
}

const auth = () => ({ headers: useAuthHeaders() });
const BASE = "/fo/ec/dp/admin";

export const dpAdminSvc = {
  listUis: async (): Promise<DpUiRow[]> => (await axiosCsr.get<DpUiRow[]>(`${BASE}/ui`, auth())).data ?? [],
  createUi: async (body: { siteId: string; uiCd: string; uiNm: string; useYn?: string }): Promise<DpUiRow> => (await axiosCsr.post<DpUiRow>(`${BASE}/ui`, body, auth())).data,

  listAreas: async (): Promise<DpAreaRow[]> => (await axiosCsr.get<DpAreaRow[]>(`${BASE}/area`, auth())).data ?? [],
  createArea: async (body: { uiId: string; siteId: string; areaCd: string; areaNm: string; useYn?: string }): Promise<DpAreaRow> =>
    (await axiosCsr.post<DpAreaRow>(`${BASE}/area`, body, auth())).data,

  listPanels: async (areaId?: string): Promise<DpPanelRow[]> => (await axiosCsr.get<DpPanelRow[]>(`${BASE}/panel`, { ...auth(), params: { areaId: areaId || undefined } })).data ?? [],
  createPanel: async (body: { areaId: string; siteId: string; panelNm: string; panelTypeCd?: string; useYn?: string; dispPanelStatusCd?: string }): Promise<DpPanelRow> =>
    (await axiosCsr.post<DpPanelRow>(`${BASE}/panel`, body, auth())).data,

  listPanelItems: async (panelId: string): Promise<DpAreaWidgetItem[]> =>
    (await axiosCsr.get<DpAreaWidgetItem[]>(`${BASE}/panel-item`, { ...auth(), params: { panelId: panelId || undefined } })).data ?? [],
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
  }): Promise<DpAreaWidgetItem> => (await axiosCsr.post<DpAreaWidgetItem>(`${BASE}/panel-item`, body, auth())).data,
  updatePanelItem: async (id: string, body: Partial<DpAreaWidgetItem> & { useYn?: string; dispYn?: string }): Promise<DpAreaWidgetItem> =>
    (await axiosCsr.put<DpAreaWidgetItem>(`${BASE}/panel-item/${encodeURIComponent(id)}`, body, auth())).data,
  deletePanelItem: async (id: string): Promise<{ success: boolean }> => {
    await axiosCsr.delete(`${BASE}/panel-item/${encodeURIComponent(id)}`, auth());
    return { success: true };
  },
};
