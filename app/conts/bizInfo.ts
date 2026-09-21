/**
 * 사업자 정보 — 회사소개(about.vue)와 푸터(layouts/footers/Footer.vue)가 함께 쓴다(2026-09-22: 푸터에 회사명·사업자번호 표시 요청으로 한 곳으로 모음).
 * 값이 바뀌면 여기만 고치면 된다.
 */
export interface BizInfoItem {
  label: string;
  value: string;
}

export const BIZ_INFO: BizInfoItem[] = [
  { label: "상호명", value: "모두누리" },
  { label: "대표자", value: "송성일" },
  { label: "사업자번호", value: "123-45-67890" },
  { label: "통신판매업", value: "제2024-성남중원-0001호" },
  { label: "주소", value: "경기도 성남시 중원구 성남대로 997번길 49-14 201호" },
  { label: "고객센터", value: "010-3805-0206" },
  { label: "이메일", value: "illeesam@gmail.com" },
];

/** 전화번호 → tel: 링크용 숫자만 */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^0-9+]/g, "")}`;

export const bizValue = (label: string): string => BIZ_INFO.find((i) => i.label === label)?.value ?? "";
