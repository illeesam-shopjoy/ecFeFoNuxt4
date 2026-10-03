import type { OdRefundMethodType } from "~/types/od/odRefundMethodType";

/** 환불. 필드명은 ecBeBo(JPA) OdRefundDto.Item(od_refund) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional).
 * 2026-10-03 클레임-부분환불 계약 §1/§5 — 클레임 COMPLT 시 1건 생성, OdClaimType.refunds[] 요소. */
export interface OdRefundType {
  refundId: string; // 환불ID
  claimId?: string; // 클레임ID (od_claim.)
  orderId?: string; // 주문ID (od_order.)
  payId?: string; // 결제ID (od_pay.)
  refundTypeCd?: string; // 환불유형 — REFUND_TYPE_CD {CANCEL:취소, RETURN:반품, PARTIAL:부분, EXTRA:추가}
  refundTypeCdNm?: string; // 환불유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  totalRefundAmt?: number; // 총 환불금액 (현금성)
  refundProdAmt?: number; // 환불 상품금액
  refundShippingAmt?: number; // 환불 배송비
  refundSaveAmt?: number; // 적립금/캐시 복원액
  refundStatusCd?: string; // 환불상태 — REFUND_STATUS_CD {PENDING:대기, COMPLT:완료, FAILED:실패}
  refundStatusCdNm?: string; // 환불상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  refundDate?: string; // 환불 완료일시
  memo?: string; // 관리메모
  refundMethods?: OdRefundMethodType[]; // 수단별 환불 내역 (od_refund_method)
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
