/** FAQ(자주 묻는 질문). 필드명은 ecBeBo(JPA) CmFaqDto.Item(cm_faq) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface CmFaqType {
  faqId: string; // FAQ ID
  pathId?: string; // FAQ 분류 표시경로 (sy_path.path_id, biz_cd=cm_faq)
  faqQuestion?: string; // 질문
  faqAnswer?: string; // 답변(HTML)
  sortOrd?: number; // 정렬순서
  useYn?: string; // 노출여부 Y/N
  viewCount?: number; // 조회수
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  pathLabel?: string; // sy_path.path_label (분류 표시명)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
