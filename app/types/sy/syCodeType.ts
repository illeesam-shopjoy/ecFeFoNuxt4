/** 공통 코드 타입. 필드명은 ecBeBo(JPA) SyCodeDto.Item 기준 (2026-09 정렬). */
export interface SyCodeType {
  codeId: string; // 코드ID (ecBeBo codeId)
  codeGrp: string; // 그룹코드 (ecBeBo codeGrp)
  codeValue: string; // 코드값 (ecBeBo codeValue)
  codeLabel: string; // 표시명 (ecBeBo codeLabel)
}
