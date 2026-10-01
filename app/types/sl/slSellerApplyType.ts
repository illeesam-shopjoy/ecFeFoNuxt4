/**
 * 판매자 신청 — ecBeBo FoSlSellerController(/api/fo/ec/sl/seller/**) 계약.
 * 회원가입(POST /co/fo-auth/join)에도 sellerNm/sellerTypeCd 를 선택항목으로 함께 보낼 수 있다(가입과 동시에 신청).
 */
export type SlSellerTypeCd = "INDIVIDUAL" | "COMPANY";
export type SlSellerStatusCd = "PENDING" | "ACTIVE" | "SUSPENDED";

/** POST /fo/ec/sl/seller/apply 본문 */
export interface SlSellerApplyReqType {
  sellerNm: string;
  sellerTypeCd?: SlSellerTypeCd;
}

/** GET /fo/ec/sl/seller/my 응답 — 신청 이력이 없으면 서버가 null/빈 객체를 줄 수 있다(mapSellerMy 가 null 로 정규화) */
export interface SlSellerMyType {
  sellerId?: string;
  sellerNm?: string;
  sellerStatusCd?: SlSellerStatusCd;
}
