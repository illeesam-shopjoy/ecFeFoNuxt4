/** 회원 결제카드 (mb_member_card) — 토스 빌링키로 등록. 카드번호/빌링키는 화면에 내려오지 않고 카드사·마스킹 번호만 보인다. */
export interface MbMemberCardType {
  cardId: string; // 카드ID
  cardCompany?: string; // 카드사(발급사 코드/명)
  cardNoMasked?: string; // 마스킹된 카드번호
  cardType?: string; // 카드 종류 (신용/체크/기프트)
  isDefault?: string; // 기본 카드 여부 Y/N
  regDate?: string; // 등록일시
}
