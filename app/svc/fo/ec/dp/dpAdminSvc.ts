/**
 * dpAdminSvc.ts — 전시패널관리(어드민) API 호출 객체.
 *
 * 2026-09-13 신설 — "전시관리 > 전시관리 > 전시패널관리" 화면(app/pages/adminEc/dp/panels/index.vue)
 * 전용. 로그인한 FO 회원이면 접근 가능(FoDpAdminController, FO_ONLY) — 진짜 BO 관리자 권한분리는
 * 프론트에 BO 로그인 흐름이 생긴 뒤 교체할 것([[ecfefonuxt4-dp-widget-migration]] 메모리 참조).
 */
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

export const dpAdminSvc = {
  /** GET /api/fo/ec/dp/admin/ui — UI 전체 목록 */
  listUis: () => $fetch<DpUiRow[]>("/api/fo/ec/dp/admin/ui", { headers: useAuthHeaders() }),

  /** POST /api/fo/ec/dp/admin/ui — UI 등록 */
  createUi: (body: { siteId: string; uiCd: string; uiNm: string; useYn?: string }) =>
    $fetch<DpUiRow>("/api/fo/ec/dp/admin/ui", { method: "POST", body, headers: useAuthHeaders() }),

  /** GET /api/fo/ec/dp/admin/area — 영역 전체 목록 */
  listAreas: () => $fetch<DpAreaRow[]>("/api/fo/ec/dp/admin/area", { headers: useAuthHeaders() }),

  /** POST /api/fo/ec/dp/admin/area — 영역 등록 */
  createArea: (body: { uiId: string; siteId: string; areaCd: string; areaNm: string; useYn?: string }) =>
    $fetch<DpAreaRow>("/api/fo/ec/dp/admin/area", { method: "POST", body, headers: useAuthHeaders() }),

  /** GET /api/fo/ec/dp/admin/panel?areaId= — 특정 영역의 패널(패널항목 포함) 목록 */
  listPanels: (areaId?: string) =>
    $fetch<DpPanelRow[]>("/api/fo/ec/dp/admin/panel", { query: { areaId }, headers: useAuthHeaders() }),

  /** POST /api/fo/ec/dp/admin/panel — 패널 등록 */
  createPanel: (body: { areaId: string; siteId: string; panelNm: string; panelTypeCd?: string; useYn?: string; dispPanelStatusCd?: string }) =>
    $fetch<DpPanelRow>("/api/fo/ec/dp/admin/panel", { method: "POST", body, headers: useAuthHeaders() }),

  /** GET /api/fo/ec/dp/admin/panel-item?panelId= — 특정 패널의 항목 목록 */
  listPanelItems: (panelId: string) =>
    $fetch<DpAreaWidgetItem[]>("/api/fo/ec/dp/admin/panel-item", { query: { panelId }, headers: useAuthHeaders() }),

  /** POST /api/fo/ec/dp/admin/panel-item — 패널항목 등록 */
  createPanelItem: (body: {
    panelId: string;
    siteId: string;
    widgetTypeCd: string;
    widgetTitle?: string;
    widgetContent?: string;
    widgetConfigJson?: string;
    sortOrd?: number;
    useYn?: string;
    dispYn?: string;
  }) => $fetch<DpAreaWidgetItem>("/api/fo/ec/dp/admin/panel-item", { method: "POST", body, headers: useAuthHeaders() }),

  /** PUT /api/fo/ec/dp/admin/panel-item/{id} — 패널항목 수정 */
  updatePanelItem: (id: string, body: Partial<DpAreaWidgetItem> & { useYn?: string; dispYn?: string }) =>
    $fetch<DpAreaWidgetItem>(`/api/fo/ec/dp/admin/panel-item/${encodeURIComponent(id)}`, { method: "PUT", body, headers: useAuthHeaders() }),

  /** DELETE /api/fo/ec/dp/admin/panel-item/{id} — 패널항목 삭제 */
  deletePanelItem: (id: string) =>
    $fetch<{ success: boolean }>(`/api/fo/ec/dp/admin/panel-item/${encodeURIComponent(id)}`, { method: "DELETE", headers: useAuthHeaders() }),
};
