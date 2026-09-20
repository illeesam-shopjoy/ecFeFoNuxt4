/** 카테고리-상품 연결. 필드명은 ecBeBo(JPA) PdCategoryProdDto.Item(pd_category_prod) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PdCategoryProdType {
  categoryProdId: string; // 상품카테고리연결ID (YYMMDDhhmmss+rand4)
  categoryId?: string; // 카테고리ID (pd_category.category_id)
  prodId?: string; // 상품ID (pd_prod.prod_id)
  categoryProdTypeCd?: string; // 진열유형 (NORMAL/HIGHLIGHT/RECOMMEND/MAIN/BANNER/HOT_DEAL)
  categoryProdTypeCdNm?: string; // 진열유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  sortOrd?: number; // 표시 순서 (동일 타입 내, 낮을수록 우선 노출)
  emphasisCd?: string; // 강조표시 코드 (자유 문자열)
  emphasisCdNm?: string; // 강조표시 코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  dispYn?: string; // 전시여부 (Y=전시, N=비전시)
  dispStartDate?: string; // 전시시작일 (NULL=즉시)
  dispEndDate?: string; // 전시종료일 (NULL=무기한, 기본 3년 후 12월31일)
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  categoryNm?: string; // 카테고리명 (조인 표시용)
  prodNm?: string; // 상품명 (조인 표시용)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
