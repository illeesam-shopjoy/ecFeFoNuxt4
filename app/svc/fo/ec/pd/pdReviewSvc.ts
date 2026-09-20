/**
 * pdReviewSvc.ts — 상품 리뷰/리뷰 답글 작성·수정·삭제 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdReviewController(/api/fo/ec/pd/review, 비회원 작성 허용)·FoPdReviewCommentController(/api/fo/ec/pd/review-comment, 로그인 필요).
 * 입력 검증·본문 조립은 utils/mapBoard.ts — 여기서는 전송만 한다. 리뷰 "조회"는 상품 상세(pdProductSvc.getById)가 함께 내려받는다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { buildReviewCommentPayload, buildReviewCreatePayload, buildReviewUpdatePayload } from "~/utils/mapBoard";
import type { CoWriteResultType } from "~/types/co/coWriteResultType";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

const auth = () => ({ headers: useAuthHeaders() });
const reviewUrl = (id: string) => `/fo/ec/pd/review/${encodeURIComponent(id)}`;

export const pdReviewSvc = {
  /** POST /fo/ec/pd/review — 리뷰 작성(비회원은 writerNm+writerPwd) */
  createReview: async (body: { prodId: string; content: string; rating: number; reviewTitle?: string; writerNm?: string; writerPwd?: string; attachFiles?: SyAttachChangeType[] }): Promise<CoWriteResultType> => {
    const created = (await axiosCsr.post<{ reviewId: string }>("/fo/ec/pd/review", buildReviewCreatePayload(body), auth())).data;
    return { success: true, message: "리뷰가 등록되었습니다.", id: created.reviewId };
  },

  /** PUT /fo/ec/pd/review/{id} — 리뷰 수정(작성자만: 회원 본인 또는 비회원은 writerPwd 일치) */
  updateReview: async (reviewId: string, body: { content: string; rating: number; writerPwd?: string; attachFiles?: SyAttachChangeType[] }): Promise<CoWriteResultType> => {
    await axiosCsr.put(reviewUrl(reviewId), buildReviewUpdatePayload(body), auth());
    return { success: true, message: "수정되었습니다.", id: reviewId };
  },

  /** DELETE /fo/ec/pd/review/{id} — 리뷰 삭제(작성자만: 회원 본인 또는 비회원은 writerPwd 일치) */
  deleteReview: async (reviewId: string, writerPwd?: string): Promise<CoWriteResultType> => {
    await axiosCsr.delete(reviewUrl(reviewId), { ...auth(), data: writerPwd ? { writerPwd } : undefined });
    return { success: true };
  },

  /** POST /fo/ec/pd/review-comment — 리뷰 답글 작성 */
  createReviewComment: async (body: { reviewId: string; content: string }): Promise<CoWriteResultType> => {
    const created = (await axiosCsr.post<{ reviewCommentId: string }>("/fo/ec/pd/review-comment", buildReviewCommentPayload(body), auth())).data;
    return { success: true, message: "답글이 등록되었습니다.", id: created.reviewCommentId };
  },

  /** DELETE /fo/ec/pd/review-comment/{id} — 리뷰 답글 삭제 */
  deleteReviewComment: async (reviewCommentId: string): Promise<CoWriteResultType> => {
    await axiosCsr.delete(`/fo/ec/pd/review-comment/${encodeURIComponent(reviewCommentId)}`, auth());
    return { success: true };
  },
};
