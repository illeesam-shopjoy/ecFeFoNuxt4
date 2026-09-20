/** 전시 위젯. 필드명은 ecBeBo(JPA) DpWidgetDto.Item(dp_widget) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface DpWidgetType {
  widgetId: string; // 위젯ID (YYMMDDhhmmss+rand4)
  widgetLibId?: string; // 위젯라이브러리ID (dp_widget_lib.widget_lib_id, 참조 선택사항)
  widgetNm?: string; // 위젯명
  widgetTypeCd?: string; // 위젯유형 — WIDGET_TYPE_CD {image_banner:이미지 배너, product_slider:상품 슬라이더, ch…
  widgetTypeCdNm?: string; // 위젯유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  widgetDesc?: string; // 위젯설명
  widgetTitle?: string; // 위젯타이틀
  widgetContent?: string; // 위젯내용 (HTML 에디터)
  titleShowYn?: string; // 타이틀표시여부 Y/N
  widgetLibRefYn?: string; // 위젯라이브러리참조여부 Y/N
  widgetConfigJson?: string; // 위젯추가설정 (JSON)
  thumbnailUrl?: string; // 미리보기 썸네일URL
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  dispEnv?: string; // 전시 환경 (^PROD^DEV^TEST^ 형식)
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
