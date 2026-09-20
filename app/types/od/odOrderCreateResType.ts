/** 주문 생성 결과 (svc/mapOrder.mapOrderCreateRes) */
export interface OdOrderCreateResType {
  success: boolean;
  orderId?: string;
}

/** ecBeBo POST /fo/order/create 원본 응답 — { data: { orderId } } 가 한 겹 더 들어 있다 */
export interface OdOrderCreateRawType {
  data?: { orderId?: string };
}
