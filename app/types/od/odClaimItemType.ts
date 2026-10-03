/** 클레임 품목. 필드명은 ecBeBo(JPA) OdClaimItemDto.Item(od_claim_item) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional).
 * 2026-10-03 클레임-부분환불 계약(z0docs/정책서/ec/od/od.13.클레임-부분환불.impl-2026-10-03.md §2) — OdClaimType.claimItems[] 요소. */
export interface OdClaimItemType {
  claimItemId?: string; // 클레임품목ID
  claimId?: string; // 클레임ID (od_claim.)
  orderItemId: string; // 주문상품ID (od_order_item.)
  prodId?: string; // 상품ID (pd_prod.)
  prodNm?: string; // 상품명 (주문 시점 스냅샷)
  prodSkuId?: string; // 원 SKU ID (pd_prod_sku.)
  skuCode?: string; // 원 SKU 코드 (조인 표시용)
  prodOptNm1?: string; // 옵션1명 (조인 표시용)
  prodOptNm2?: string; // 옵션2명 (조인 표시용)
  claimQty?: number; // 클레임 수량
  unitPrice?: number; // 단가 (itemOrderAmt / orderQty, 없으면 주문상품 unitPrice)
  itemAmt?: number; // 품목 금액 (unitPrice × claimQty)
  refundAmt?: number; // 품목별 환불금액 (상품금액 안분, 마지막 품목이 끝수 흡수)
  newProdSkuId?: string; // 교환 신규 SKU ID (EXCHANGE 만)
  newSkuCode?: string; // 교환 신규 SKU 코드 (조인 표시용)
  newQty?: number; // 교환 신규 수량 (= claimQty)
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
