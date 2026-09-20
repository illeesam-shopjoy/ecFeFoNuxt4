import type { DpWidgetType } from "~/types/dp/dpWidgetType";

/** 전시 위젯 라이브러리. 필드명은 ecBeBo(JPA) DpWidgetLibDto.Item(dp_widget_lib) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface DpWidgetLibType {
  widgetLibId: string; // 위젯라이브러리ID (YYMMDDhhmmss+rand4)
  widgetCode?: string; // 위젯코드
  widgetNm?: string; // 위젯명
  widgetTypeCd?: string; // 위젯유형 — WIDGET_TYPE_CD {image_banner:이미지 배너, product_slider:상품 슬라이더, ch…
  widgetTypeCdNm?: string; // 위젯유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  widgetLibDesc?: string; // 위젯라이브러리설명
  pathId?: string; // 점(.) 구분 표시경로
  thumbnailUrl?: string; // 미리보기 썸네일URL
  widgetContent?: string; // 위젯내용 (HTML 에디터, 3개 테이블 통일)
  widgetConfigJson?: string; // 위젯설정 (JSON, 3개 테이블 통일)
  isSystem?: string; // 시스템기본위젯 Y/N
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  widgets?: DpWidgetType[]; // 이 라이브러리로 만든 위젯 (dp_widget.widget_lib_id)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
