/**
 * myBoardSvc.ts — 마이페이지 리뷰/상품문의 관리 목록 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyExtraController(/api/fo/ec/my/review · /qna, FO_ONLY). 수정·삭제는 상품 상세와 같은 pdReviewSvc / pdQnaSvc 를 쓴다.
 */
import { authCfg, csrList } from "~/utils/svcHttp";
import type { PdMyQnaType, PdMyReviewType } from "~/types/pd/pdMyReviewType";

export const myBoardSvc = {
  /** GET /fo/ec/my/review — 내가 쓴 리뷰 */
  getReviews: (): Promise<PdMyReviewType[]> => csrList<PdMyReviewType>("/fo/ec/my/review", authCfg()),

  /** GET /fo/ec/my/qna — 내가 쓴 상품문의 */
  getQna: (): Promise<PdMyQnaType[]> => csrList<PdMyQnaType>("/fo/ec/my/qna", authCfg()),
};
