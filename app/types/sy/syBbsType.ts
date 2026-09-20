/** 게시글. 필드명은 ecBeBo(JPA) SyBbsDto.Item(sy_bbs) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyBbsType {
  bbsId: string; // 게시물ID (YYMMDDhhmmss+rand4)
  bbmId?: string; // 게시판ID
  parentBbsId?: string; // 부모게시물ID (답글)
  memberId?: string; // 작성자 회원ID
  authorNm?: string; // 작성자명
  bbsTitle?: string; // 제목
  contentHtml?: string; // 내용 (HTML)
  viewCount?: number; // 조회수
  likeCount?: number; // 좋아요수
  commentCount?: number; // 댓글수
  isFixed?: string; // 상단고정 Y/N
  bbsStatusCd?: string; // 상태 — BBS_STATUS {ACTIVE:활성, HIDDEN:숨김, DELETED:삭제}
  bbsStatusCdNm?: string; // 상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  pathId?: string; // 점(.) 구분 표시경로 (트리 빌드용)
  bbmNm?: string; // 게시판명
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
