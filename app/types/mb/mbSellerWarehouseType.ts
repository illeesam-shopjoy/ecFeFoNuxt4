/**
 * 판매자 창고(출고지/반품지) — ecBeBo FoMbSellerWarehouseController(/api/fo/ec/mb/seller-warehouse) 계약. mb_seller_warehouse 테이블 기준.
 * sellerId 는 서버가 로그인 회원의 소속 판매자로 고정하므로 요청에 담지 않는다.
 */
export interface MbSellerWarehouseType {
  warehouseId: string;
  sellerId?: string;
  warehouseNm: string;
  zipCode?: string;
  addr?: string;
  addrDetail?: string;
  contactNm?: string;
  contactPhone?: string;
  /** 기본 출고지 Y/N — 판매자당 1개(서버가 새 Y 지정 시 기존 Y 를 N 으로 내림) */
  isDefault?: "Y" | "N";
  /** 반품지 겸용 Y/N */
  isReturnAddr?: "Y" | "N";
  useYn?: "Y" | "N";
}

/** POST/PUT 본문 — 서버 엔티티에 기본값이 없어 isDefault/isReturnAddr/useYn 을 항상 명시해서 보낸다 */
export interface MbSellerWarehouseSaveType {
  warehouseNm: string;
  zipCode: string;
  addr: string;
  addrDetail: string;
  contactNm: string;
  contactPhone: string;
  isDefault: "Y" | "N";
  isReturnAddr: "Y" | "N";
  useYn: "Y" | "N";
}
