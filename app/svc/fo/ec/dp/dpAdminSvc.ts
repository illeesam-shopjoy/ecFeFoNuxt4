/**
 * dpAdminSvc.ts — 전시패널관리 어드민(/dp/panels) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoDpAdminController(/api/fo/ec/dp/admin/**, FO_ONLY) — 로그인 토큰 필요(authCfg).
 * dp_ui → dp_area → dp_panel → dp_panel_item 4단 전시 구조([[ecfefonuxt4-dp-widget-convention]]).
 */
import { authCfg, csrDelete, csrList, csrPost, csrPut, idPath } from "~/utils/svcHttp";
import type { DpAreaCreateType, DpPanelCreateType, DpPanelItemCreateType, DpUiCreateType } from "~/types/dp/dpAdminCreateType";
import type { DpAreaType } from "~/types/dp/dpAreaType";
import type { DpPanelItemType } from "~/types/dp/dpPanelItemType";
import type { DpPanelType } from "~/types/dp/dpPanelType";
import type { DpUiType } from "~/types/dp/dpUiType";

const BASE = "/fo/ec/dp/admin";
const ITEM = `${BASE}/panel-item`;

export const dpAdminSvc = {
  listUis: (): Promise<DpUiType[]> => csrList<DpUiType>(`${BASE}/ui`, authCfg()),
  createUi: (body: DpUiCreateType): Promise<DpUiType> => csrPost<DpUiType>(`${BASE}/ui`, body, authCfg()),

  listAreas: (): Promise<DpAreaType[]> => csrList<DpAreaType>(`${BASE}/area`, authCfg()),
  createArea: (body: DpAreaCreateType): Promise<DpAreaType> => csrPost<DpAreaType>(`${BASE}/area`, body, authCfg()),

  listPanels: (areaId?: string): Promise<DpPanelType[]> => csrList<DpPanelType>(`${BASE}/panel`, authCfg({ params: { areaId: areaId || undefined } })),
  createPanel: (body: DpPanelCreateType): Promise<DpPanelType> => csrPost<DpPanelType>(`${BASE}/panel`, body, authCfg()),

  listPanelItems: (panelId: string): Promise<DpPanelItemType[]> => csrList<DpPanelItemType>(`${BASE}/panel-item`, authCfg({ params: { panelId: panelId || undefined } })),
  createPanelItem: (body: DpPanelItemCreateType): Promise<DpPanelItemType> => csrPost<DpPanelItemType>(ITEM, body, authCfg()),
  updatePanelItem: (id: string, body: Partial<DpPanelItemType>): Promise<DpPanelItemType> => csrPut<DpPanelItemType>(idPath(ITEM, id), body, authCfg()),
  deletePanelItem: (id: string): Promise<void> => csrDelete(idPath(ITEM, id), authCfg()),
};
