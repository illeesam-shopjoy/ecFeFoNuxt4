/** 표시경로(분류 트리). 필드명은 ecBeBo(JPA) SyPathDto.Item(sy_path) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyPathType {
  pathId: string; // 경로ID (PK, auto)
  bizCd?: string; // 업무코드 (참조 테이블명, 예: sy_brand / sy_code_grp / sy_prop)
  bizCdNm?: string; // 업무코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  parentPathId?: string; // 부모 경로ID (sy_path.path_id, 루트는 NULL)
  pathLabel?: string; // 경로 라벨 (한글 표시명)
  sortOrd?: number; // 동일 부모 내 정렬순서
  useYn?: string; // 사용여부 Y/N
  pathRemark?: string; // 비고
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
