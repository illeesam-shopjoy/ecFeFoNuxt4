/** 결제. 필드명은 ecBeBo(JPA) OdPayDto.Item(od_pay) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface OdPayType {
  payId: string; // 결제ID (YYMMDDhhmmss+rand4)
  orderId?: string; // 주문ID (od_order.)
  memberId?: string; // 회원ID (표시용)
  payStatusCd?: string; // 결제상태 — PAY_STATUS {PENDING:대기, COMPLT:완료, FAILED:실패, CANCELLED:취소, PAR…
  payStatusCdNm?: string; // 결제상태 코드 라벨
  payStatusCdBefore?: string; // 변경 전 결제상태 — PAY_STATUS
  payMethodCd?: string; // 결제수단 — PAY_METHOD {BANK_TRANSFER:무통장입금, VBANK:가상계좌, TOSS:토스, KAKAO:카카오…
  payMethodCdNm?: string; // 결제수단 코드 라벨
  payDirCd?: string; // 입금/환불 방향 — PAY_DIR_CD {DEPOSIT:입금, REFUND:환불}
  payDirCdNm?: string; // 입금/환불방향 코드 라벨
  payChannelCd?: string; // 결제채널 — PAY_CHANNEL_CD {CARD:카드, ACCOUNT:계좌이체, KAKAO:카카오페이, NAVER:네이버페이…
  payChannelCdNm?: string; // 결제채널 코드 라벨
  payAmt?: number; // 결제 금액
  refundAmt?: number; // 환불 금액
  refundStatusCd?: string; // 환불 상태 — REFUND_STATUS_CD {PENDING:대기, COMPLT:완료, FAILED:실패}
  refundStatusCdNm?: string; // 환불상태 코드 라벨
  refundDate?: string; // 환불 완료일시
  pgTransactionId?: string; // PG 거래ID
  pgOrderId?: string; // PG 주문번호 (PG사 발급 주문 식별자)
  pgResultCd?: string; // PG 응답결과코드
  pgResultCdNm?: string; // PG 응답결과코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  pgResultMsg?: string; // PG 응답결과메시지
  payDate?: string; // 결제 완료일시
  cardNo?: string; // 카드번호 (마스킹: ****-****-****-5678)
  cardTypeCd?: string; // 카드 타입 — CARD_TYPE_CD {CREDIT:신용카드, DEBIT:체크카드, CHECK:직불카드}
  cardTypeCdNm?: string; // 카드유형 코드 라벨
  cardInstallMonth?: number; // 할부 개월수 (0=일시불)
  vbankBankCd?: string; // 가상계좌 은행코드 — BANK_CODE {KOOKMIN:국민은행, SHINHAN:신한은행, WOORI:우리은행 외}
  vbankBankCdNm?: string; // 가상계좌은행 코드 라벨
  vbankAccountNo?: string; // 가상계좌 계좌번호
  vbankAccountNm?: string; // 가상계좌 예금주명
  vbankExpireDate?: string; // 가상계좌 입금기한
  memo?: string; // 메모
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  memberNm?: string; // 회원명 (조인 표시용)
  orderDate?: string; // 주문일시 (od_order 조인)
  orderStatusCd?: string; // 주문상태 (od_order 조인) — ORDER_STATUS_CD
  orderStatusCdNm?: string; // 주문상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  memberEmail?: string; // 회원 이메일 (mb_member 조인)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
