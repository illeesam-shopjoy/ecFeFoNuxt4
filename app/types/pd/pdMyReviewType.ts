/** 내 리뷰 한 건 (ecBeBo GET /fo/ec/my/review) — 상품명 포함 */
export interface PdMyReviewType {
  reviewId: string;
  prodId: string;
  prodNm?: string;
  reviewTitle?: string;
  reviewContent?: string; // 에디터 HTML 또는 예전 일반 텍스트
  rating?: number;
  reviewDate?: string;
  reviewStatusCd?: string; // ACTIVE/HIDDEN/DELETED
}

/** 내 상품문의 한 건 (ecBeBo GET /fo/ec/my/qna) — 상품명·답변 포함 */
export interface PdMyQnaType {
  prodQnaId: string;
  prodId: string;
  prodNm?: string;
  prodQnaTitle?: string;
  prodQnaContent?: string;
  scrtYn?: string;
  answYn?: string;
  answContent?: string;
  answDate?: string;
  regDate?: string;
}
