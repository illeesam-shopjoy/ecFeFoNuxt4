/** 푸터 링크 묶음(제목 + 링크들) — 전시 위젯 FOOTER_LINKS_MAIN / FOOTER_LINKS_THREE */
export interface DpFooterLinkSectionType {
  title: string;
  links: { href: string; label: string }[];
}

/** 푸터 연락처 한 줄 */
export interface DpFooterContactItemType {
  icon: string;
  label: string;
  value: string;
}

/** 푸터 전시 위젯 데이터 (Footer.vue) */
export interface DpFooterDataType {
  introText: string;
  contactInfo: DpFooterContactItemType[];
  sections: DpFooterLinkSectionType[];
}

/** 푸터 전시 위젯 데이터 (FooterThree.vue) — 뉴스레터 문구 포함 */
export interface DpFooterThreeDataType extends DpFooterDataType {
  newsletter: { title: string; desc: string };
}

/** 푸터 링크 그룹 (FooterTwo.vue, FOOTER_LINKS_TWO) */
export interface DpFooterLinkGroupType {
  id: number;
  title: string;
  links: { link: string; list: string }[];
}
