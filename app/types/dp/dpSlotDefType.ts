/** 전시패널관리(/dp/panels) 화면이 다루는 영역 슬롯 정의 — 영역코드별 기본 위젯 유형/JSON */
export interface DpSlotDefType {
  areaCd: string;
  label: string;
  widgetTypeCd: "SLIDER" | "TESTIMONIAL" | "BRAND_LOGO" | "CONTACT_INFO" | "CATEGORY_TREE" | "FOOTER_LINKS";
  defaultJson: unknown;
}
