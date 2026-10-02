/** 블로그 댓글. 필드명은 ecBeBo(JPA) CmBlogReplyDto.Item(cm_blog_reply) 기준 — 서버가 내려주는 값을 그대로 담는다. */
export interface CmBlogReplyType {
  blogReplyId: string; // 댓글ID
  blogId?: string; // 블로그ID (cm_blog.blog_id)
  parentCommentId?: string | null; // 대댓글 부모ID
  writerId?: string | null; // 작성자ID (mb_member.member_id)
  writerNm?: string | null; // 작성자명
  blogCommentContent?: string | null; // 댓글 내용
  commentStatusCd?: string | null; // 상태 — COMMENT_STATUS_CD {ACTIVE:정상, HIDDEN:숨김, DELETED:삭제}
  regDate?: string | null; // 등록일
  updDate?: string | null; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string | null; // 등록자 (reg_by)
  regSiteId?: string | null; // 등록 사이트ID (reg_site_id)
}
