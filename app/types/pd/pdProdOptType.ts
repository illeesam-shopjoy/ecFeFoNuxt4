/** 상품 옵션 타입. 필드명은 ecBeBo(JPA) PdProdOptDto.Item 기준 (2026-09 정렬), 사이즈는 sy_code(SIZE_INFO_CD)에서도 옴. */
export interface PdProdOptType {
  prodOptId: string; // 옵션ID (ecBeBo prodOptId, 코드옵션은 sy_code.codeId)
  prodOptStdCd?: string; // 옵션코드 (ecBeBo prodOptStdCd)
  prodOptStdCdNm?: string; // 옵션코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodOptNm: string; // 옵션명 (ecBeBo prodOptNm)
  prodOptTypeCd: string; // 옵션 유형 (ecBeBo prodOpt1TypeCd/prodOpt2TypeCd, 예: COLOR/SIZE)
  prodOptTypeCdNm?: string; // 옵션 유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodOptTypeLevel: number; // 옵션 레벨 (ecBeBo prodOptTypeLevel)
}
