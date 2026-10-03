/** 환불 수단별 내역. 필드명은 ecBeBo(JPA) OdRefundMethodDto.Item(od_refund_method) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional).
 * 2026-10-03 클레임-부분환불 계약 §1 — payMethodCd 는 주문 결제수단(TOSS/KAKAO/NAVER/BANK_TRANSFER/VBANK) + CACHE(적립금/캐시 복원). */
export interface OdRefundMethodType {
  refundMethodId?: string; // 환불수단ID
  refundId?: string; // 환불ID (od_refund.)
  payMethodCd?: string; // 환불 수단 — PAY_METHOD {TOSS:토스, KAKAO:카카오, NAVER:네이버, BANK_TRANSFER:무통장입금, VBANK:가상계좌} + CACHE:캐시복원
  payMethodCdNm?: string; // 환불 수단 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  refundAmt?: number; // 수단별 환불금액
  refundStatusCd?: string; // 환불상태 — REFUND_STATUS_CD {PENDING:대기, COMPLT:완료, FAILED:실패}
  refundStatusCdNm?: string; // 환불상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  pgRefundId?: string; // PG 취소 거래키 (응답의 취소 거래키)
  pgResponse?: string; // PG 응답 요약(JSON)
  refundBankCd?: string; // 환불 은행코드 — BANK_CODE (무통장/가상계좌 환불 시)
  refundBankCdNm?: string; // 환불은행 코드 라벨
  refundAccountNo?: string; // 환불 계좌번호
  refundAccountNm?: string; // 환불 예금주명
  refundDate?: string; // 환불 완료일시
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
