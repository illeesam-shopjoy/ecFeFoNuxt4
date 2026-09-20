import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

/** 상품 리뷰 작성 입력 — 비회원은 writerNm + writerPwd (utils/mapBoard.buildReviewCreatePayload) */
export interface PdReviewCreateType {
  prodId: string;
  content: string;
  rating: number;
  reviewTitle?: string;
  writerNm?: string;
  writerPwd?: string;
  attachFiles?: SyAttachChangeType[];
}

/** 상품 리뷰 수정 입력 — 작성자만(회원 본인 또는 비회원은 writerPwd 일치) */
export type PdReviewUpdateType = Pick<PdReviewCreateType, "content" | "rating" | "writerPwd" | "attachFiles">;

/** 리뷰 답글 작성 입력 */
export interface PdReviewCommentCreateType {
  reviewId: string;
  content: string;
}
