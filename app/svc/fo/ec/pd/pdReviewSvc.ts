/**
 * pdReviewSvc.ts — 상품 리뷰/리뷰 답글 작성·삭제 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdReviewController(/api/fo/ec/pd/review)·FoPdReviewCommentController(/api/fo/ec/pd/review-comment)
 * — FO_ONLY 인가라 로그인 토큰이 필요하다(useAuthHeaders).
 * 리뷰 "조회"는 상품 상세(pdProductSvc.getById)가 함께 내려받는다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

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
  /**
   * POST /fo/ec/pd/review — 리뷰 작성 (별점 0.5~5). 2026-09-20: 비회원 작성 허용 — 로그인 안 했으면 writerNm(이름)+writerPwd(글 비밀번호) 필수.
   * 백엔드가 reviewTitle 을 필수로 검증하는데("리뷰 제목을 입력해주세요") 작성 폼에는 제목 입력란이 없어서
   * 그동안 항상 400 으로 실패했다 — 제목을 안 주면 내용 앞부분(최대 30자)으로 자동 생성한다.
   */
  createReview: async (body: { prodId: string; content: string; rating: number; reviewTitle?: string; writerNm?: string; writerPwd?: string; attachFiles?: SyAttachChangeType[] }): Promise<WriteResult> => {
    const reviewContent = String(body.content ?? "").trim();
    const rating = Number(body.rating);
    if (!body.prodId) badRequest("상품 ID가 필요합니다.");
    if (!reviewContent) badRequest("리뷰 내용을 입력해 주세요.");
    if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) badRequest("별점을 선택해 주세요. (0.5 ~ 5)");
    const reviewTitle = String(body.reviewTitle ?? "").trim() || reviewContent.replace(/\s+/g, " ").slice(0, 30);
    const payload: Record<string, unknown> = { prodId: body.prodId, reviewTitle, reviewContent, rating };
    if (body.writerNm) payload.writerNm = body.writerNm.trim();
    if (body.writerPwd) payload.writerPwd = body.writerPwd;
    if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
    const created = (await axiosCsr.post<{ reviewId: string }>("/fo/ec/pd/review", payload, { headers: useAuthHeaders() })).data;
    return { success: true, message: "리뷰가 등록되었습니다.", id: created.reviewId };
  },

  /** PUT /fo/ec/pd/review/{id} — 리뷰 수정(작성자만: 회원 본인 또는 비회원은 writerPwd 일치) */
  updateReview: async (reviewId: string, body: { content: string; rating: number; writerPwd?: string; attachFiles?: SyAttachChangeType[] }): Promise<WriteResult> => {
    const reviewContent = String(body.content ?? "").trim();
    const rating = Number(body.rating);
    if (!reviewContent) badRequest("리뷰 내용을 입력해 주세요.");
    if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) badRequest("별점을 선택해 주세요. (0.5 ~ 5)");
    const payload: Record<string, unknown> = { reviewTitle: reviewContent.replace(/\s+/g, " ").slice(0, 30), reviewContent, rating };
    if (body.writerPwd) payload.writerPwd = body.writerPwd;
    if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
    await axiosCsr.put(`/fo/ec/pd/review/${encodeURIComponent(reviewId)}`, payload, { headers: useAuthHeaders() });
    return { success: true, message: "수정되었습니다.", id: reviewId };
  },

  /** DELETE /fo/ec/pd/review/{id} — 리뷰 삭제(작성자만: 회원 본인 또는 비회원은 writerPwd 일치) */
  deleteReview: async (reviewId: string, writerPwd?: string): Promise<WriteResult> => {
    await axiosCsr.delete(`/fo/ec/pd/review/${encodeURIComponent(reviewId)}`, { headers: useAuthHeaders(), data: writerPwd ? { writerPwd } : undefined });
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
