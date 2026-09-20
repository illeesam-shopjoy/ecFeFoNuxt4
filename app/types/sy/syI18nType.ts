/** 다국어 메시지. 필드명은 ecBeBo(JPA) SyI18nDto.Item(sy_i18n) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyI18nType {
  i18nId: string; // 다국어ID (YYMMDDhhmmss+rand4)
  i18nKey?: string; // 다국어 키 (예: common.bt.save, error.FORBIDDEN)
  i18nDesc?: string; // 키 설명 (번역자 참고용)
  i18nScopeCd?: string; // 적용범위 — I18N_SCOPE_CD {FO:프론트, BO:관리자, COMMON:공통}
  i18nScopeCdNm?: string; // 적용범위 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  i18nCategory?: string; // 키 첫 세그먼트 (common/error/link/paging 등)
  i18nMsgKo?: string; // 한국어 메시지 (플레이스홀더 {0},{1} 지원)
  i18nMsgEn?: string; // 영어 메시지 (플레이스홀더 {0},{1} 지원)
  i18nMsgCn?: string; // 중국어 메시지 (플레이스홀더 {0},{1} 지원)
  i18nMsgJa?: string; // 일본어 메시지 (플레이스홀더 {0},{1} 지원)
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
