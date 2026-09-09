/** 상품 옵션 타입. 필드명은 ecBeBo(JPA) PdProdOptDto.Item 기준 (2026-09 정렬), 사이즈는 sy_code(SIZE_INFO_CD)에서도 옴. */
export interface PdOptionType {
  optionId: string; // 옵션ID (ecBeBo prodOptId, 코드옵션은 sy_code.codeId)
  optionCode?: string; // 옵션코드 (ecBeBo prodOptStdCd)
  optionNm: string; // 옵션명 (ecBeBo prodOptNm)
  optionType: string; // 옵션 유형 (ecBeBo prodOpt1TypeCd/prodOpt2TypeCd, 예: COLOR/SIZE)
  optionLevel: number; // 옵션 레벨 (ecBeBo prodOptTypeLevel)
}
