/** 이벤트 대상 항목. 필드명은 ecBeBo(JPA) PmEventItemDto.Item(pm_event_item) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmEventItemType {
  eventItemId: string; // 이벤트항목ID (YYMMDDhhmmss+rand4)
  eventId?: string; // 이벤트ID (pm_event.event_id)
  targetTypeCd?: string; // 대상유형 — PROMO_TARGET_TYPE {ALL:전체, PRODUCT:상품, CATEGORY:카테고리, VENDOR:업체…
  targetTypeCdNm?: string; // 대상유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  targetId?: string; // 대상ID (prod_id/category_id/vendor_id/brand_id)
  sortNo?: number; // 이벤트 내 노출 순서
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  dealPoolId?: string; // 예약풀ID (rs_pool.pool_id)
  dealProdSkuId?: string; // 타임딜 대상 SKU (rs_pool.resource_id) — 주문 시 prodSkuId로 사용
  dealPrice?: number; // 타임딜 특가
  dealTotalQty?: number; // 한정 수량
  dealRemainQty?: number; // 잔여 수량 (dealTotalQty - reservedQty)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
