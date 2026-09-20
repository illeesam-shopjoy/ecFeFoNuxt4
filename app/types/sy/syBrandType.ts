/** 브랜드 타입. 필드명은 ecBeBo(JPA) SyBrandDto.Item 기준 (2026-09 정렬). */
export interface SyBrandType {
  brandId?: string; // 브랜드ID (ecBeBo brandId)
  brandCode?: string; // 브랜드코드 (ecBeBo brandCode)
  brandNm: string; // 브랜드명 (ecBeBo brandNm)
  // ── sy_brand 테이블 컬럼(ecBeBo SyBrandDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  brandEnNm?: string; // 브랜드영문명
  pathId?: string; // 점(.) 구분 표시경로 (트리 빌드용)
  logoUrl?: string; // 로고URL
  vendorId?: string; // 업체ID
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  brandRemark?: string; // 비고
  vendorNm?: string; // 업체명
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일시 (reg_date)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
