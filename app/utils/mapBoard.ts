/**
 * mapBoard.ts — 상품평/Q&A 작성·수정 요청 본문 조립 + 입력 검증 (svc 는 이 결과를 그대로 전송만 한다).
 * 서버 규칙: reviewTitle 필수. 2026-09-22(요청사항: "제목만 2자 이상 필수, 내용은 필수 아니어도 됨") — 제목은
 * 화면(prod-dtl/[id].vue, ProdQna.vue)에서 이미 2자 이상 입력을 강제하므로 여기서는 다시 막지 않고,
 * 혹시 비어 오면(방어적으로만) 내용 앞부분으로 대신 채운다. 내용(content)은 더 이상 필수가 아니다.
 */
import type { CoWriteResultType } from "~/types/co/coWriteResultType";
import type { PdProdQnaCreateType, PdProdQnaUpdateType } from "~/types/pd/pdProdQnaWriteType";
import type { PdReviewCommentCreateType, PdReviewCreateType, PdReviewUpdateType } from "~/types/pd/pdReviewWriteType";
import { htmlToText } from "~/utils/htmlSafe";
import { badRequest } from "~/utils/svcInput";

/** 제목 자동 생성용 — HTML 본문이면 태그를 걷어낸 글자의 앞부분 */
const firstLine = (s: string, n = 30) => htmlToText(s).slice(0, n);
const checkRating = (v: unknown): number => {
  const rating = Number(v);
  if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) badRequest("별점을 선택해 주세요. (0.5 ~ 5)");
  return rating;
};

/** POST /fo/ec/pd/review 본문 — 비회원이면 writerNm+writerPwd 를 함께 보낸다 */
export function buildReviewCreatePayload(body: PdReviewCreateType): Record<string, unknown> {
  const reviewContent = String(body.content ?? "").trim();
  if (!body.prodId) badRequest("상품 ID가 필요합니다.");
  const rating = checkRating(body.rating);
  const reviewTitle = String(body.reviewTitle ?? "").trim() || firstLine(reviewContent) || "상품평";
  const payload: Record<string, unknown> = { prodId: body.prodId, reviewTitle, reviewContent, rating };
  if (body.writerNm) payload.writerNm = body.writerNm.trim();
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}

/** PUT /fo/ec/pd/review/{id} 본문 */
export function buildReviewUpdatePayload(body: PdReviewUpdateType): Record<string, unknown> {
  const reviewContent = String(body.content ?? "").trim();
  const rating = checkRating(body.rating);
  const payload: Record<string, unknown> = { reviewTitle: String(body.reviewTitle ?? "").trim() || firstLine(reviewContent) || "상품평", reviewContent, rating };
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}

/** POST /fo/ec/pd/review-comment 본문 */
export function buildReviewCommentPayload(body: PdReviewCommentCreateType): Record<string, unknown> {
  const reviewReplyContent = String(body.content ?? "").trim();
  if (!body.reviewId) badRequest("상품평 ID가 필요합니다.");
  if (!reviewReplyContent) badRequest("답글 내용을 입력해 주세요.");
  return { reviewId: body.reviewId, reviewReplyContent };
}

/** POST /fo/ec/pd/qna 본문 */
export function buildQnaCreatePayload(body: PdProdQnaCreateType): Record<string, unknown> {
  const prodQnaContent = String(body.content ?? "").trim();
  if (!body.prodId) badRequest("상품 ID가 필요합니다.");
  const payload: Record<string, unknown> = { prodId: body.prodId, prodQnaContent, prodQnaTitle: body.title?.trim() || firstLine(prodQnaContent) || "문의" };
  if (body.writerNm) payload.writerNm = body.writerNm.trim();
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.scrtYn) payload.scrtYn = body.scrtYn;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}

/** PUT /fo/ec/pd/qna/{id} 본문 */
export function buildQnaUpdatePayload(body: PdProdQnaUpdateType): Record<string, unknown> {
  const prodQnaContent = String(body.content ?? "").trim();
  const payload: Record<string, unknown> = { prodQnaContent, prodQnaTitle: body.title?.trim() || firstLine(prodQnaContent) || "문의" };
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}

/** 작성/수정/삭제 결과 — svc 는 서버 응답에서 꺼낸 id 와 안내 문구만 넘긴다 */
export const writeRes = (id?: string, message?: string): CoWriteResultType => ({ success: true, ...(message ? { message } : {}), ...(id ? { id } : {}) });
