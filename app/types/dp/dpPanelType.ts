import type { DpPanelItemType } from "~/types/dp/dpPanelItemType";

/** 전시 패널. 필드명은 ecBeBo(JPA) DpPanelDto.Item(dp_panel) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface DpPanelType {
  panelId: string; // 패널ID (YYMMDDhhmmss+rand4)
  areaId?: string; // 영역ID (dp_area.area_id)
  panelNm?: string; // 패널명
  panelTypeCd?: string; // 표시유형 — PANEL_TYPE_CD {MAIN_BANNER:메인배너, SUB_BANNER:서브배너, POPUP:팝업, SPE…
  panelTypeCdNm?: string; // 표시유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  pathId?: string; // 점(.) 구분 표시경로
  visibilityTargets?: string; // 공개대상 (^CODE^CODE^ 형식)
  useYn?: string; // 사용여부 Y/N
  useStartDate?: string; // 사용시작일
  useEndDate?: string; // 사용종료일
  dispPanelStatusCd?: string; // 상태 — DISP_PANEL_STATUS_CD {SHOW:노출, HIDE:숨김}
  dispPanelStatusCdNm?: string; // 상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  dispPanelStatusCdBefore?: string; // 변경 전 패널상태 — DISP_PANEL_STATUS_CD {SHOW:노출, HIDE:숨김}
  contentJson?: string; // 패널콘텐츠 (JSON - 위젯 목록 및 설정)
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  panelItems?: DpPanelItemType[]; // 이 패널의 항목(위젯 배치) (dp_panel_item.panel_id)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
