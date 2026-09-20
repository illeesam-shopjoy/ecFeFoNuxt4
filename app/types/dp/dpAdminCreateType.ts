import type { DpAreaType } from "~/types/dp/dpAreaType";
import type { DpPanelItemType } from "~/types/dp/dpPanelItemType";
import type { DpPanelType } from "~/types/dp/dpPanelType";
import type { DpUiType } from "~/types/dp/dpUiType";

/** 전시패널관리 어드민(/dp/panels) 등록 입력 — 필수 컬럼 + 선택 컬럼 */
export type DpUiCreateType = Required<Pick<DpUiType, "siteId" | "uiCd" | "uiNm">> & Pick<DpUiType, "useYn">;
export type DpAreaCreateType = Required<Pick<DpAreaType, "uiId" | "siteId" | "areaCd" | "areaNm">> & Pick<DpAreaType, "useYn">;
export type DpPanelCreateType = Required<Pick<DpPanelType, "areaId" | "siteId" | "panelNm">> & Pick<DpPanelType, "panelTypeCd" | "useYn" | "dispPanelStatusCd">;
export type DpPanelItemCreateType = Required<Pick<DpPanelItemType, "panelId" | "siteId" | "widgetTypeCd">> &
  Pick<DpPanelItemType, "widgetTitle" | "widgetContent" | "widgetConfigJson" | "sortOrd" | "useYn" | "dispYn">;
