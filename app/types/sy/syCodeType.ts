/** 공통 코드 타입. 필드명은 ecBeBo(JPA) SyCodeDto.Item 기준 (2026-09 정렬). */
export interface SyCodeType {
  codeId: string; // 코드ID (ecBeBo codeId)
  codeGrp: string; // 그룹코드 (ecBeBo codeGrp)
  codeValue: string; // 코드값 (ecBeBo codeValue)
  codeLabel: string; // 표시명 (ecBeBo codeLabel)
  // ── sy_code 테이블 컬럼(ecBeBo SyCodeDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  codeGrpId?: string; // FK → sy_code_grp.code_grp_id
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  parentCodeValue?: string; // 부모 코드값 (트리 구조 시 상위 code_value, null이면 루트)
  childCodeValues?: string; // 허용 자식/전이 코드값 목록 (^VAL1^VAL2^ 형식 — 상태 전이 제약이나 하위 코드 목록)
  codeRemark?: string; // 비고
  codeLevel?: number; // 코드 트리 레벨 (1=루트, 2=중간, 3=리프 등)
  codeOpt1?: string; // 코드별 부가 옵션 1 (스타일 색상 hex, 아이콘 클래스 등 자유 문자열)
  grpNm?: string; // 코드그룹명
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일시 (reg_date)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
