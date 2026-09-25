/** 토스페이먼츠 결제 승인 응답(Payment 객체) 중 결제완료 화면이 쓰는 필드 — POST /api/payments/confirm 이 그대로 통과시킨다 */
export interface OdPayConfirmResType {
  paymentKey: string; // 결제 키(결제 고유 번호)
  orderId: string;
  mId?: string; // 가맹점 ID
  lastTransactionKey?: string; // 마지막 거래 키(거래번호)
  orderName?: string; // 주문명
  status?: string; // 결제 상태 — DONE(완료) 등
  method?: string; // 결제수단 — 카드/간편결제/계좌이체 등
  totalAmount?: number; // 총 결제 금액
  balanceAmount?: number; // 취소 가능 잔액
  currency?: string;
  approvedAt?: string; // 결제 승인 일시(ISO)
  requestedAt?: string; // 결제 요청 일시(ISO)
  card?: { number?: string; installmentPlanMonths?: number; approveNo?: string; cardType?: string; ownerType?: string; isInterestFree?: boolean };
  easyPay?: { provider?: string; amount?: number };
  virtualAccount?: { bankCode?: string; accountNumber?: string; dueDate?: string; customerName?: string; accountType?: string; expired?: boolean }; // 가상계좌 발급 정보(입금대기)
  receipt?: { url?: string };
  failure?: { code?: string; message?: string }; // 실패 시 오류 코드/메시지
}
