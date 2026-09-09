/**
 * 상품 리뷰 타입. 필드명은 ecBeBo(JPA) PdReviewDto.Item 기준 (2026-09 정렬).
 * 리뷰/답글(댓글)을 같은 타입으로 재귀 표현 — 답글은 ecBeBo에선 PdReviewCommentDto라
 * 필드가 다르지만(writerNm/reviewReplyContent 등) BFF(server/utils/mapProduct.ts)가
 * 이 타입 하나로 통일해서 내려준다.
 */
export interface PdReviewType {
  reviewId: string; // 리뷰ID (ecBeBo reviewId, 답글이면 reviewCommentId)
  img: string; // 이미지 — ecBeBo는 첨부를 pd_review_attach로 따로 관리, 지금은 미연동(빈 문자열)
  writerNm: string; // 작성자명 (리뷰는 ecBeBo regUserNm, 답글은 writerNm)
  reviewDate: string; // 작성일시 (리뷰는 ecBeBo reviewDate, 답글은 regDate)
  rating: number; // 평점 (답글은 0)
  title?: string; // 리뷰 제목 (ecBeBo reviewTitle, 답글엔 없음)
  reviewContent?: string; // 리뷰/답글 내용 (ecBeBo reviewContent/reviewReplyContent)
  attachments?: string[]; // 첨부 이미지·동영상 URL 목록 — 미연동, 항상 빈 배열
  children?: boolean; // 답글 여부
  replies?: PdReviewType[]; // 답글 목록
}
