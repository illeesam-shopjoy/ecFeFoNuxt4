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
}
