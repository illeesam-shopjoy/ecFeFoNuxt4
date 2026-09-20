import type { DpWidgetLibType } from "~/types/dp/dpWidgetLibType";

/** 전시 패널 항목(위젯 배치). 필드명은 ecBeBo(JPA) DpPanelItemDto.Item(dp_panel_item) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface DpPanelItemType {
  panelItemId: string; // 패널항목ID (YYMMDDhhmmss+rand4)
  panelId?: string; // 패널ID (dp_panel.panel_id)
  widgetLibId?: string; // 위젯라이브러리ID (dp_widget_lib.widget_lib_id, 선택사항)
  widgetTypeCd?: string; // 위젯유형 — WIDGET_TYPE_CD {image_banner:이미지 배너, product_slider:상품 슬라이더, ch…
  widgetTypeCdNm?: string; // 위젯유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  widgetTitle?: string; // 위젯타이틀
  widgetContent?: string; // 위젯내용 (HTML 에디터)
  titleShowYn?: string; // 타이틀표시여부 Y/N
  widgetLibRefYn?: string; // 위젯라이브러리참조여부 Y/N
  contentTypeCd?: string; // 콘텐츠유형 (WIDGET/HTML/TEXT/IMAGE 등)
  contentTypeCdNm?: string; // 콘텐츠유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  sortOrd?: number; // 항목정렬순서
  widgetConfigJson?: string; // 위젯설정 (JSON - 위젯별 특정 설정 또는 직접 생성 콘텐츠)
  visibilityTargets?: string; // 공개대상 (^CODE^CODE^ 형식)
  dispYn?: string; // 전시여부 Y/N (배치로 자동 관리)
  dispStartDt?: string; // 전시시작일시
  dispEndDt?: string; // 전시종료일시
  dispEnv?: string; // 전시 환경 (^PROD^DEV^TEST^ 형식)
  useYn?: string; // 사용여부 Y/N
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  widgetLib?: DpWidgetLibType; // 배치된 위젯 라이브러리 (dp_widget_lib.widget_lib_id)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
