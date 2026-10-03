/** 클레임 신청 요청 본문 — ecBeBo FoClaimReqDto (POST /api/fo/my/claim, /preview).
 * 2026-10-03 클레임-부분환불 계약(z0docs/정책서/ec/od/od.13.클레임-부분환불.impl-2026-10-03.md §2). */
export interface OdClaimReqItemType {
  orderItemId: string; // 주문상품ID (od_order_item.)
  claimQty: number; // 클레임 수량 (1 ≤ claimQty ≤ 남은 수량 claimableQty)
  newProdSkuId?: string; // 교환 신규 SKU ID — EXCHANGE 만 (같은 prodId 의 SKU)
  newQty?: number; // 교환 신규 수량 — EXCHANGE 만 (= claimQty)
}

export interface OdClaimReqType {
  orderId: string; // 주문ID (od_order.)
  claimTypeCd: string; // 클레임유형 — CLAIM_TYPE_CD {CANCEL:취소, RETURN:반품, EXCHANGE:교환}
  reasonCd: string; // 사유코드 — REASON_CD {CHANGE_MIND:단순변심, WRONG_ORDER:잘못 주문, DEFECT:상품 불량, WRONG_DELIVERY:오배송, DELIVERY_DELAY:배송 지연, ETC:기타}
  reasonDetail?: string; // 사유 상세
  refundBankCd?: string; // 환불 은행코드 — BANK_CODE (무통장/가상계좌 주문의 취소·반품만 필수)
  refundAccountNo?: string; // 환불 계좌번호 (무통장/가상계좌 주문의 취소·반품만 필수)
  refundAccountNm?: string; // 환불 예금주명 (무통장/가상계좌 주문의 취소·반품만 필수)
  items: OdClaimReqItemType[]; // 클레임 품목 (claimQty 0 인 품목은 보내지 않는다)
}
