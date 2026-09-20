/** 모바일(오프캔버스) 메뉴 한 항목 — 하위가 있으면 dropdownMenu, 없으면 link */
export interface SyMenuMobileType {
  title: string;
  link?: string;
  dropdown?: boolean;
  dropdownMenu?: { link: string; title: string }[];
}
