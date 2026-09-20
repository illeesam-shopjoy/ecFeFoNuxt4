/**
 * 상품 리뷰 타입. 필드명은 ecBeBo(JPA) PdReviewDto.Item 기준 (2026-09 정렬).
 * 리뷰/답글(댓글)을 같은 타입으로 재귀 표현 — 답글은 ecBeBo에선 PdReviewCommentDto라
 * 필드가 다르지만(writerNm/reviewReplyContent 등) BFF(server/utils/mapProduct.ts)가
 * 이 타입 하나로 통일해서 내려준다.
 */
import type { SyAttachType } from "~/types/sy/syAttachType";

export interface PdReviewType {
  reviewId: string; // 리뷰ID (ecBeBo reviewId, 답글이면 reviewCommentId)
  memberId?: string; // 작성 회원ID — 없으면 비회원 작성(글 비밀번호로 수정·삭제)
  img: string; // 이미지 — ecBeBo는 첨부를 pd_review_attach로 따로 관리, 지금은 미연동(빈 문자열)
  writerNm: string; // 작성자명 (리뷰는 ecBeBo regUserNm, 답글은 writerNm)
  reviewDate: string; // 작성일시 (리뷰는 ecBeBo reviewDate, 답글은 regDate)
  rating: number; // 평점 (답글은 0)
  reviewTitle?: string; // 리뷰 제목 (ecBeBo reviewTitle, 답글엔 없음)
  reviewContent?: string; // 리뷰/답글 내용 (ecBeBo reviewContent/reviewReplyContent)
  attachments?: string[]; // 첨부 이미지·동영상 URL 목록(미디어 뷰어용) — attachFiles 에서 파생
  attachFiles?: SyAttachType[]; // 첨부파일 전체(이미지·동영상·기타 파일) — 수정 시 기존 첨부 표시에도 사용
  children?: boolean; // 답글 여부
  replies?: PdReviewType[]; // 답글 목록
  // ── pd_review 테이블 컬럼(ecBeBo PdReviewDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  prodId?: string; // 상품ID (pd_prod.prod_id)
  helpfulCnt?: number; // 도움이 돼요 수
  unhelpfulCnt?: number; // 도움이 안 돼요 수
  reviewStatusCd?: string; // 상태 — REVIEW_STATUS_CD {ACTIVE:정상, HIDDEN:숨김, DELETED:삭제}
  reviewStatusCdNm?: string; // 상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
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
