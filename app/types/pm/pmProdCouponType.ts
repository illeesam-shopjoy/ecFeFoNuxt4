/** 상품쿠폰(상품 교환권) — ecBeBo FoPmProdCouponService 응답. 선물하기로 발급되고, 결제수단 "상품쿠폰"으로 해당 상품을 0원 교환한다. */
export type PmProdCouponStatusCd = "PENDING_PAY" | "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED";

export interface PmProdCouponType {
  prodCouponId: string;
  couponCode: string; // XXXX-XXXX-XXXX
  prodId: string;
  prodSkuId?: string | null;
  prodNm: string;
  qty: number;
  unitPrice: number;
  senderNm?: string | null; // 보낸 사람
  recvNm?: string | null; // 받는 사람
  giftMsg?: string | null;
  statusCd: PmProdCouponStatusCd;
  issueDate?: string | null;
  expireDate?: string | null;
  useDate?: string | null;
  useOrderId?: string | null; // 교환 주문
  claimed: boolean; // 누가 받기 했는지
  srcOrderId?: string | null; // (소유자 조회) 선물 결제 주문
  recvPhone?: string | null;
  recvEmail?: string | null;
}

/** 선물 결제 대기 주문 생성 응답 — payAmt 는 서버가 계산한 금액 */
export interface PmProdCouponGiftOrderType {
  orderId: string;
  payAmt: number;
  prodCouponId: string;
  couponCode: string;
}

/** 선물 주문 요청(받는 사람 정보 + 상품/옵션/수량) */
export interface PmProdCouponGiftReqType {
  prodId: string;
  prodSkuId?: string;
  qty: number;
  recvNm: string;
  recvPhone?: string;
  recvEmail?: string;
  giftMsg?: string;
}

/** 교환(주문) 요청 — 받는 분·배송지 */
export interface PmProdCouponRedeemReqType {
  prodCouponId: string;
  recvNm: string;
  recvPhone: string;
  recvZip?: string;
  recvAddr: string;
  recvAddrDetail?: string;
  recvMemo?: string;
}
