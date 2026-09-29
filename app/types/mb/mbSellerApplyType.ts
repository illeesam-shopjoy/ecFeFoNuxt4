/**
 * 판매자 신청 — ecBeBo FoMbSellerController(/api/fo/ec/mb/seller/**) 계약.
 * 회원가입(POST /co/fo-auth/join)에도 sellerNm/sellerTypeCd 를 선택항목으로 함께 보낼 수 있다(가입과 동시에 신청).
 */
export type MbSellerTypeCd = "INDIVIDUAL" | "COMPANY";
export type MbSellerStatusCd = "PENDING" | "ACTIVE" | "SUSPENDED";

/** POST /fo/ec/mb/seller/apply 본문 */
export interface MbSellerApplyReqType {
  sellerNm: string;
  sellerTypeCd?: MbSellerTypeCd;
}

/** GET /fo/ec/mb/seller/my 응답 — 신청 이력이 없으면 서버가 null/빈 객체를 줄 수 있다(mapSellerMy 가 null 로 정규화) */
export interface MbSellerMyType {
  sellerId?: string;
  sellerNm?: string;
  sellerStatusCd?: MbSellerStatusCd;
}
