/** 상품목록 좌측 필터(판매업체/담당MD)에서 고르는 항목 — ID + 이름 + 연결된 상품 수 (ecBeBo /fo/ec/sy/vendor · /md) */
export interface SyFilterOptType {
  id: string;
  name: string;
  prodCount?: number;
}
