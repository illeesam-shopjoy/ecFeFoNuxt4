/**
 * 판매자 신청 — ecBeBo FoSlSellerController(/api/fo/ec/sl/seller/**) 계약.
 * 회원가입(POST /co/fo-auth/join)에도 sellerNm/sellerTypeCd 를 선택항목으로 함께 보낼 수 있다(가입과 동시에 신청).
 */
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

export type SlSellerTypeCd = "INDIVIDUAL" | "COMPANY";
export type SlSellerStatusCd = "PENDING" | "ACTIVE" | "SUSPENDED";

/** POST /fo/ec/sl/seller/apply 본문 */
export interface SlSellerApplyReqType {
  sellerNm: string;
  sellerTypeCd?: SlSellerTypeCd;
  /** 이메일 링크 인증을 마친 건의 verifyId — 이미 이메일 인증을 마친 회원이면 생략 가능(2026-10-02) */
  emailVerifyId?: string;
  /** 필수 서류(사업자등록증 등) — AttachUploader 변경목록, 새로 올린 파일('I') 1건 이상 필수(2026-10-02) */
  attachFiles: SyAttachChangeType[];
}

/** GET /fo/ec/sl/seller/my 응답 — 신청 이력이 없으면 서버가 null/빈 객체를 줄 수 있다(mapSellerMy 가 null 로 정규화) */
export interface SlSellerMyType {
  sellerId?: string;
  sellerNm?: string;
  sellerStatusCd?: SlSellerStatusCd;
}
