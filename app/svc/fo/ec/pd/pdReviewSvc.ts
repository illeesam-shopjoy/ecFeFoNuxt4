/**
 * pdReviewSvc.ts — 상품 리뷰/리뷰 답글 작성·삭제 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdReviewController(/api/fo/ec/pd/review)·FoPdReviewCommentController(/api/fo/ec/pd/review-comment)
 * — FO_ONLY 인가라 로그인 토큰이 필요하다(useAuthHeaders).
 * 리뷰 "조회"는 상품 상세(pdProductSvc.getById)가 함께 내려받는다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";

interface WriteResult {
  success?: boolean;
  message?: string;
  id?: string;
}

/** 백엔드 검증 실패 메시지를 소비처(e.data.message / e.message)가 그대로 읽도록 던진다 */
function badRequest(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 400, statusMessage: message, data: { message, statusMessage: message } });
}

export const pdReviewSvc = {
  /** POST /fo/ec/pd/review — 리뷰 작성 (별점 0.5~5) */
  createReview: async (body: { prodId: string; content: string; rating: number }): Promise<WriteResult> => {
    const reviewContent = String(body.content ?? "").trim();
    const rating = Number(body.rating);
    if (!body.prodId) badRequest("상품 ID가 필요합니다.");
    if (!reviewContent) badRequest("리뷰 내용을 입력해 주세요.");
    if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) badRequest("별점을 선택해 주세요. (0.5 ~ 5)");
    const created = (await axiosCsr.post<{ reviewId: string }>("/fo/ec/pd/review", { prodId: body.prodId, reviewTitle: "", reviewContent, rating }, { headers: useAuthHeaders() })).data;
    return { success: true, message: "리뷰가 등록되었습니다.", id: created.reviewId };
  },

  /** DELETE /fo/ec/pd/review/{id} — 리뷰 삭제 */
  deleteReview: async (reviewId: string): Promise<WriteResult> => {
    await axiosCsr.delete(`/fo/ec/pd/review/${encodeURIComponent(reviewId)}`, { headers: useAuthHeaders() });
    return { success: true };
  },

  /** POST /fo/ec/pd/review-comment — 리뷰 답글 작성 */
  createReviewComment: async (body: { reviewId: string; content: string }): Promise<WriteResult> => {
    const reviewReplyContent = String(body.content ?? "").trim();
    if (!body.reviewId) badRequest("리뷰 ID가 필요합니다.");
    if (!reviewReplyContent) badRequest("답글 내용을 입력해 주세요.");
    const created = (await axiosCsr.post<{ reviewCommentId: string }>("/fo/ec/pd/review-comment", { reviewId: body.reviewId, reviewReplyContent }, { headers: useAuthHeaders() })).data;
    return { success: true, message: "답글이 등록되었습니다.", id: created.reviewCommentId };
  },

  /** DELETE /fo/ec/pd/review-comment/{id} — 리뷰 답글 삭제 */
  deleteReviewComment: async (reviewCommentId: string): Promise<WriteResult> => {
    await axiosCsr.delete(`/fo/ec/pd/review-comment/${encodeURIComponent(reviewCommentId)}`, { headers: useAuthHeaders() });
    return { success: true };
  },
};
