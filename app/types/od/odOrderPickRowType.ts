/** 문의하기의 "주문 선택" 목록 한 줄 (내 주문 → 화면용) */
export interface OdOrderPickRowType {
  orderId: string;
  orderDate: string;
  status: string;
  payAmt: number;
}
