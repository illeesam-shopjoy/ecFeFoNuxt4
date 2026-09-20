/**
 * mapBoard.ts — 상품평/Q&A 작성·수정 요청 본문 조립 + 입력 검증 (svc 는 이 결과를 그대로 전송만 한다).
 * 서버 규칙: reviewTitle 필수(작성 폼에 제목 입력란이 없어 내용 앞 30자로 자동 생성), Q&A 제목은 서버가 생성.
 */
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";
import { badRequest } from "~/utils/svcInput";

const firstLine = (s: string, n = 30) => s.replace(/\s+/g, " ").slice(0, n);
const checkRating = (v: unknown): number => {
  const rating = Number(v);
  if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) badRequest("별점을 선택해 주세요. (0.5 ~ 5)");
  return rating;
};

interface ReviewIn {
  content: string;
  rating: number;
  reviewTitle?: string;
  writerNm?: string;
  writerPwd?: string;
  attachFiles?: SyAttachChangeType[];
}

/** POST /fo/ec/pd/review 본문 — 비회원이면 writerNm+writerPwd 를 함께 보낸다 */
export function buildReviewCreatePayload(body: ReviewIn & { prodId: string }): Record<string, unknown> {
  const reviewContent = String(body.content ?? "").trim();
  if (!body.prodId) badRequest("상품 ID가 필요합니다.");
  if (!reviewContent) badRequest("리뷰 내용을 입력해 주세요.");
  const rating = checkRating(body.rating);
  const reviewTitle = String(body.reviewTitle ?? "").trim() || firstLine(reviewContent);
  const payload: Record<string, unknown> = { prodId: body.prodId, reviewTitle, reviewContent, rating };
  if (body.writerNm) payload.writerNm = body.writerNm.trim();
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}

/** PUT /fo/ec/pd/review/{id} 본문 */
export function buildReviewUpdatePayload(body: Pick<ReviewIn, "content" | "rating" | "writerPwd" | "attachFiles">): Record<string, unknown> {
  const reviewContent = String(body.content ?? "").trim();
  if (!reviewContent) badRequest("리뷰 내용을 입력해 주세요.");
  const rating = checkRating(body.rating);
  const payload: Record<string, unknown> = { reviewTitle: firstLine(reviewContent), reviewContent, rating };
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}

/** POST /fo/ec/pd/review-comment 본문 */
export function buildReviewCommentPayload(body: { reviewId: string; content: string }): Record<string, unknown> {
  const reviewReplyContent = String(body.content ?? "").trim();
  if (!body.reviewId) badRequest("리뷰 ID가 필요합니다.");
  if (!reviewReplyContent) badRequest("답글 내용을 입력해 주세요.");
  return { reviewId: body.reviewId, reviewReplyContent };
}

/** POST /fo/ec/pd/qna 본문 */
export function buildQnaCreatePayload(body: { prodId: string; content: string; writerNm?: string; writerPwd?: string; scrtYn?: "Y" | "N"; attachFiles?: SyAttachChangeType[] }): Record<string, unknown> {
  const prodQnaContent = String(body.content ?? "").trim();
  if (!body.prodId) badRequest("상품 ID가 필요합니다.");
  if (!prodQnaContent) badRequest("문의 내용을 입력해 주세요.");
  const payload: Record<string, unknown> = { prodId: body.prodId, prodQnaContent };
  if (body.writerNm) payload.writerNm = body.writerNm.trim();
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.scrtYn) payload.scrtYn = body.scrtYn;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}

/** PUT /fo/ec/pd/qna/{id} 본문 */
export function buildQnaUpdatePayload(body: { content: string; writerPwd?: string; attachFiles?: SyAttachChangeType[] }): Record<string, unknown> {
  const prodQnaContent = String(body.content ?? "").trim();
  if (!prodQnaContent) badRequest("문의 내용을 입력해 주세요.");
  const payload: Record<string, unknown> = { prodQnaContent };
  if (body.writerPwd) payload.writerPwd = body.writerPwd;
  if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
  return payload;
}
