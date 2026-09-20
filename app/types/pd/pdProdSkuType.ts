/** 옵션조합 SKU (2026-09 추가) — 장바구니/주문 시 재고차감 대상을 정확히 지정하기 위해
 * 상품상세 응답의 prodSkus[]를 그대로 통과시킨다. prodOpt1List/prodOpt2List 의 prodOptTypeLevel과
 * prodOpt1Id/prodOpt2Id를 매칭해 사용자가 고른 옵션 조합에 해당하는 SKU를 찾는다. */
export interface PdProdSkuType {
  prodSkuId: string;
  prodOpt1Id?: string | null;
  prodOpt2Id?: string | null;
  skuCode?: string | null;
  addPrice?: number | null;
  stockQty?: number | null;
  // ── pd_prod_sku 테이블 컬럼(ecBeBo PdProdSkuDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  prodId?: string; // 상품ID
  saleCount?: number; // 판매수량 캐시 (2026-09-14: pd_prod_stock 병합)
  useYn?: string; // 사용여부 Y/N
  sortNo?: number; // 정렬순서
  siteId?: string; // 사이트ID
  prodOptNm1?: string; // 옵션1 표시명 (조인 조회값)
  prodOptNm2?: string; // 옵션2 표시명 (조인 조회값)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일시 (reg_date)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
