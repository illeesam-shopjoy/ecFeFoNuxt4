/** 사이트. 필드명은 ecBeBo(JPA) SySiteDto.Item(sy_site) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SySiteType {
  siteId: string; // 사이트ID (YYMMDDhhmmss+rand4)
  siteCode?: string; // 사이트코드
  siteTypeCd?: string; // 사이트유형 — SITE_TYPE_CD {EC:이커머스, ADMIN:관리자, API:API}
  siteTypeCdNm?: string; // 사이트유형 코드명 (JOIN)
  siteDomain?: string; // 도메인
  logoUrl?: string; // 로고URL
  faviconUrl?: string; // 파비콘URL
  siteDesc?: string; // 사이트설명
  siteEmail?: string; // 대표이메일
  sitePhone?: string; // 대표전화
  siteZipCode?: string; // 우편번호
  siteAddress?: string; // 주소
  siteBusinessNo?: string; // 사업자번호
  siteCeo?: string; // 대표자명
  siteStatusCd?: string; // 상태 — SITE_STATUS_CD {ACTIVE:활성, MAINTENANCE:점검중, INACTIVE:비활성}
  siteStatusCdNm?: string; // 상태 코드명 (JOIN)
  configJson?: string; // 확장설정 (JSON)
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  pathId?: string; // 점(.) 구분 표시경로 (트리 빌드용)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
