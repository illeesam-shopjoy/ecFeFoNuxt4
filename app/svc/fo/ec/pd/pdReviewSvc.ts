/**
 * pdReviewSvc.ts — 상품 리뷰/리뷰 답글 작성·수정·삭제 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdReviewController(/api/fo/ec/pd/review, 비회원 작성 허용)·FoPdReviewCommentController(/api/fo/ec/pd/review-comment, 로그인 필요).
 * 입력 검증·본문 조립은 utils/mapBoard.ts — 여기서는 전송만 한다. 리뷰 "조회"는 상품 상세(pdProductSvc.getById)가 함께 내려받는다.
 */
import { authCfg, csrDelete, csrPost, csrPut, idPath } from "~/utils/svcHttp";
import { buildReviewCommentPayload, buildReviewCreatePayload, buildReviewUpdatePayload, writeRes } from "~/utils/mapBoard";
import type { CoWriteResultType } from "~/types/co/coWriteResultType";
import type { PdReviewCommentCreateType, PdReviewCreateType, PdReviewUpdateType } from "~/types/pd/pdReviewWriteType";

const REVIEW = "/fo/ec/pd/review";
const COMMENT = "/fo/ec/pd/review-comment";

export const pdReviewSvc = {
  /** POST /fo/ec/pd/review — 리뷰 작성(비회원은 writerNm+writerPwd) */
  createReview: (body: PdReviewCreateType): Promise<CoWriteResultType> =>
    csrPost<{ reviewId: string }>(REVIEW, buildReviewCreatePayload(body), authCfg()).then((r) => writeRes(r.reviewId, "리뷰가 등록되었습니다.")),

  /** PUT /fo/ec/pd/review/{id} — 리뷰 수정(작성자만: 회원 본인 또는 비회원은 writerPwd 일치) */
  updateReview: (reviewId: string, body: PdReviewUpdateType): Promise<CoWriteResultType> =>
    csrPut(idPath(REVIEW, reviewId), buildReviewUpdatePayload(body), authCfg()).then(() => writeRes(reviewId, "수정되었습니다.")),

  /** DELETE /fo/ec/pd/review/{id} — 리뷰 삭제(작성자만: 회원 본인 또는 비회원은 writerPwd 일치) */
  deleteReview: (reviewId: string, writerPwd?: string): Promise<CoWriteResultType> =>
    csrDelete(idPath(REVIEW, reviewId), authCfg({ data: writerPwd ? { writerPwd } : undefined })).then(() => writeRes()),

  /** POST /fo/ec/pd/review-comment — 리뷰 답글 작성 */
  createReviewComment: (body: PdReviewCommentCreateType): Promise<CoWriteResultType> =>
    csrPost<{ reviewCommentId: string }>(COMMENT, buildReviewCommentPayload(body), authCfg()).then((r) => writeRes(r.reviewCommentId, "답글이 등록되었습니다.")),

  /** DELETE /fo/ec/pd/review-comment/{id} — 리뷰 답글 삭제 */
  deleteReviewComment: (reviewCommentId: string): Promise<CoWriteResultType> => csrDelete(idPath(COMMENT, reviewCommentId), authCfg()).then(() => writeRes()),
};
