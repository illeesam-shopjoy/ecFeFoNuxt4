/**
 * pdReviewSvc.ts — 상품 리뷰/리뷰답글 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘") —
 * ReviewForm.vue/ProductDetailsReview.vue가 각자 "/api/fo/ec/pd/review..." 문자열을
 * $fetch에 박아 호출하던 걸 한 곳으로 모음. 전부 로그인 필요(FoPdReviewController/
 * FoPdReviewCommentController, FO_ONLY) — useAuthHeaders()를 여기서 한 번만 붙이면
 * 호출부에서 매번 안 챙겨도 된다. 폴더 위치(svc/fo/ec/pd/)는 실제 라우트 경로
 * (server/api/fo/ec/pd/*)를 그대로 따른다.
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";

interface WriteResult {
  success?: boolean;
  message?: string;
  id?: string;
}

export const pdReviewSvc = {
  /** POST /api/fo/ec/pd/review — 리뷰 등록 */
  createReview: (body: { prodId: string; content: string; rating: number }) =>
    $fetch<WriteResult>("/api/fo/ec/pd/review", { method: "POST", body, headers: useAuthHeaders() }),

  /** DELETE /api/fo/ec/pd/review/{id} — 본인 리뷰 삭제 */
  deleteReview: (reviewId: string) =>
    $fetch<WriteResult>(`/api/fo/ec/pd/review/${reviewId}`, { method: "DELETE", headers: useAuthHeaders() }),

  /** POST /api/fo/ec/pd/review-comment — 답글 등록 */
  createReviewComment: (body: { reviewId: string; content: string }) =>
    $fetch<WriteResult>("/api/fo/ec/pd/review-comment", { method: "POST", body, headers: useAuthHeaders() }),

  /** DELETE /api/fo/ec/pd/review-comment/{id} — 본인 답글 삭제 */
  deleteReviewComment: (reviewCommentId: string) =>
    $fetch<WriteResult>(`/api/fo/ec/pd/review-comment/${reviewCommentId}`, { method: "DELETE", headers: useAuthHeaders() }),
};
