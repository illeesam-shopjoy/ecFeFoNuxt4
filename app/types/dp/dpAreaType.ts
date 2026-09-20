import type { DpPanelType } from "~/types/dp/dpPanelType";

/** 전시 영역. 필드명은 ecBeBo(JPA) DpAreaDto.Item(dp_area) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface DpAreaType {
  areaId: string; // 영역ID (YYMMDDhhmmss+rand4)
  uiId?: string; // UIID (dp_ui.ui_id)
  areaCd?: string; // 영역코드 (예: MAIN_TOP, SIDEBAR_MID)
  areaCdNm?: string; // 영역코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  areaNm?: string; // 영역명
  areaTypeCd?: string; // 영역유형 — AREA_TYPE_CD {FULL:전체폭, SIDEBAR:사이드바, POPUP:팝업, INLINE:인라인}
  areaTypeCdNm?: string; // 영역유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  areaDesc?: string; // 영역설명
  pathId?: string; // 점(.) 구분 표시경로
  useYn?: string; // 사용여부 Y/N
  useStartDate?: string; // 사용시작일
  useEndDate?: string; // 사용종료일
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  panels?: DpPanelType[]; // 이 영역에 속한 전시 패널 (dp_panel.area_id)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
