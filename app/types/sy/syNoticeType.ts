/** 공지사항. 필드명은 ecBeBo(JPA) SyNoticeDto.Item(sy_notice) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyNoticeType {
  noticeId: string; // 공지ID (YYMMDDhhmmss+rand4)
  noticeTitle?: string; // 제목
  noticeTypeCd?: string; // 공지유형 (코드: NOTICE_TYPE)
  noticeTypeCdNm?: string; // 공지유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  isFixed?: string; // 상단고정 Y/N
  contentHtml?: string; // 내용 (HTML)
  startDate?: string; // 노출시작일
  endDate?: string; // 노출종료일
  noticeStatusCd?: string; // 상태 (ACTIVE/INACTIVE)
  noticeStatusCdNm?: string; // 상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  viewCount?: number; // 조회수
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
