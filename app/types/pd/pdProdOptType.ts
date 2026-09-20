/** 상품 옵션 타입. 필드명은 ecBeBo(JPA) PdProdOptDto.Item 기준 (2026-09 정렬), 사이즈는 sy_code(SIZE_INFO_CD)에서도 옴. */
export interface PdProdOptType {
  prodOptId: string; // 옵션ID (ecBeBo prodOptId, 코드옵션은 sy_code.codeId)
  prodOptStdCd?: string; // 옵션코드 (ecBeBo prodOptStdCd)
  prodOptStdCdNm?: string; // 옵션코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodOptNm: string; // 옵션명 (ecBeBo prodOptNm)
  prodOptTypeCd: string; // 옵션 유형 (ecBeBo prodOpt1TypeCd/prodOpt2TypeCd, 예: COLOR/SIZE)
  prodOptTypeCdNm?: string; // 옵션 유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodOptTypeLevel: number; // 옵션 레벨 (ecBeBo prodOptTypeLevel)
  // ── pd_prod_opt 테이블 컬럼(ecBeBo PdProdOptDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  prodId?: string; // 상품ID (pd_prod.prod_id) — 조회 편의용 비정규화 컬럼
  prodOptVal?: string; // 실제 저장값 — 직접입력 또는 프리셋 선택 시 자동 채움 (자유 문자열)
  parentProdOptId?: string; // 상위 옵션ID — 2단 옵션에서 상위 1단 옵션값 참조 (pd_prod_opt.prod_opt_id), NULL이면 독립값
  prodOptStyle?: string; // 옵션 스타일 (컬러 hex 값, 아이콘 클래스 등 자유 문자열)
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  prodOpt1TypeCd?: string; // 옵션유형1 분류코드 (예: COLOR)
  prodOpt1TypeCdNm?: string; // 옵션유형1 분류코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodOpt2TypeCd?: string; // 옵션유형2 분류코드 (예: SIZE)
  prodOpt2TypeCdNm?: string; // 옵션유형2 분류코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  siteId?: string; // 사이트ID
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일시 (reg_date)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
