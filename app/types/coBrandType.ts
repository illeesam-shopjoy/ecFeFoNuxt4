/** 브랜드 타입. 필드명은 ecBeBo(JPA) SyBrandDto.Item 기준 (2026-09 정렬). */
export interface CoBrandType {
  brandId?: string; // 브랜드ID (ecBeBo brandId)
  brandCode?: string; // 브랜드코드 (ecBeBo brandCode)
  brandNm: string; // 브랜드명 (ecBeBo brandNm)
}
