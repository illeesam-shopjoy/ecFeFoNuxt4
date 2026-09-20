/** 카테고리 타입. 필드명은 ecBeBo(JPA) PdCategoryDto.Item 기준 (2026-09 정렬) — 실 스키마엔 categoryCode 컬럼이 없어 categoryId 자체가 코드 역할. */
import type { PdCategoryProdType } from "~/types/pd/pdCategoryProdType";

export interface PdCategoryType {
  categoryId: string; // 카테고리ID (ecBeBo categoryId, 예: "CAT0100072")
  categoryNm: string; // 카테고리명 (ecBeBo categoryNm)
  categoryDepth: number; // 카테고리 뎁스 (ecBeBo categoryDepth)
  parentCategoryId?: string; // 상위 카테고리ID (ecBeBo parentCategoryId)
  categoryProds?: PdCategoryProdType[]; // 이 카테고리에 연결된 상품 목록 (pd_category_prod)
  // ── pd_category 테이블 컬럼(ecBeBo PdCategoryDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  sortOrd?: number; // 정렬순서
  categoryStatusCd?: string; // 상태 — CATEGORY_STATUS_CD {ACTIVE:활성, INACTIVE:비활성}
  categoryStatusCdNm?: string; // 카테고리상태 코드라벨 (조인 표시용)
  categoryStatusCdBefore?: string; // 변경 전 카테고리상태 — CATEGORY_STATUS_CD {ACTIVE:활성, INACTIVE:비활성}
  imgUrl?: string; // 이미지URL
  categoryDesc?: string; // 설명
  siteId?: string; // 사이트ID
  parentCategoryNm?: string; // 상위 카테고리명 (조인 표시용)
  grandParentCategoryNm?: string; // 최상위(조부모) 카테고리명 (조인 표시용)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일시 (reg_date)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
