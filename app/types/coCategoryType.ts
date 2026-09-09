/** 카테고리 타입. 필드명은 ecBeBo(JPA) PdCategoryDto.Item 기준 (2026-09 정렬) — 실 스키마엔 categoryCode 컬럼이 없어 categoryId 자체가 코드 역할. */
export interface CoCategoryType {
  categoryId: string; // 카테고리ID (ecBeBo categoryId, 예: "CAT0100072")
  categoryNm: string; // 카테고리명 (ecBeBo categoryNm)
  categoryDepth: number; // 카테고리 뎁스 (ecBeBo categoryDepth)
  parentCategoryId?: string; // 상위 카테고리ID (ecBeBo parentCategoryId)
}
