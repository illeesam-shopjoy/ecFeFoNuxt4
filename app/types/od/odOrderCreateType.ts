/** 주문 생성 요청 품목(POST /fo/order/create). */
export interface OdOrderCreateItemType {
  prodId: string;
  prodSkuId?: string;
  prodNm?: string;
  unitPrice?: number;
  orderQty: number;
  rsPoolId?: string; // 타임딜(이벤트/기획전) 구매 시 세팅
}

/** 주문 생성 요청 본문. */
export interface OdOrderCreateType {
  payAmt: number;
  totalAmt: number;
  items: OdOrderCreateItemType[];
  ordererEmail?: string;
  accessChannelCd?: string;
  couponId?: string; // 적용한 할인쿠폰 (백엔드는 주문당 1개 — 주문/상품/배송비 순으로 첫 번째)
  // 2026-10-03 클레임/부분환불(od.13) 보완 — 환불 계산(배송비 환불·쿠폰/캐시 안분)의 전제 금액을 주문 생성 시 저장
  payMethodCd?: string; // 선택한 결제수단(PAY_METHOD) — 결제 기록이 PG 기준으로 다시 덮어쓴다
  outboundShippingFee?: number; // 배송비(배송비 쿠폰 적용 후)
  couponDiscountAmt?: number; // 쿠폰 할인 합계
  cacheUseAmt?: number; // 캐시(적립금) 사용액
}
