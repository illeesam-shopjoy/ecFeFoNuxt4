import type { SyAttachFileType } from "~/types/sy/syAttachType";

/** ecBeBo 상품 리뷰 원본 응답 — utils/mapProduct.ts 가 PdReviewType(화면용)으로 변환한다. */
export interface PdReviewCommentRawType {
  reviewCommentId: string;
  parentReplyId?: string | null;
  writerNm?: string | null;
  reviewReplyContent: string;
  regDate?: string | null;
}

export interface PdReviewRawType {
  reviewId: string;
  prodId: string;
  memberId?: string | null;
  writerNm?: string | null; // 비회원 작성자명
  attachFiles?: SyAttachFileType[] | null;
  reviewTitle?: string | null;
  reviewContent: string;
  rating: number;
  reviewDate?: string | null;
  regUserNm?: string | null;
  comments?: PdReviewCommentRawType[] | null;
}

/** GET /fo/ec/pd/prod/{id}/reviews 응답 */
export interface PdReviewsRawType {
  summary: { avgRating?: number; reviewCount?: number };
  reviewPage: { pageList: PdReviewRawType[]; pageTotalCount: number };
}
