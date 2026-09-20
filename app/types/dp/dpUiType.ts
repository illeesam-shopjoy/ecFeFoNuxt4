import type { DpAreaType } from "~/types/dp/dpAreaType";

/** 전시 UI(화면). 필드명은 ecBeBo(JPA) DpUiDto.Item(dp_ui) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface DpUiType {
  uiId: string; // UIID (YYMMDDhhmmss+rand4)
  uiCd?: string; // UI코드 (예: MOBILE_MAIN, PC_MAIN)
  uiCdNm?: string; // UI코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  uiNm?: string; // UI명
  uiDesc?: string; // UI설명
  deviceTypeCd?: string; // 디바이스유형 — DEVICE_TYPE_CD {PC:PC, MOBILE:모바일, TABLET:태블릿, ALL:공통}
  deviceTypeCdNm?: string; // 디바이스유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  pathId?: string; // 페이지경로
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  useStartDate?: string; // 사용시작일
  useEndDate?: string; // 사용종료일
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  areas?: DpAreaType[]; // 이 UI 에 속한 전시 영역 (dp_area.ui_id)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
