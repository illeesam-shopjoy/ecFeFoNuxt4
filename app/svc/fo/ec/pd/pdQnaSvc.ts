/**
 * pdQnaSvc.ts — 상품 Q&A(상품문의) 작성·수정·삭제 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdQnaController(/api/fo/ec/pd/qna, 누구나 호출 가능) — 로그인 회원은 회원 명의, 비회원은 이름(writerNm)+글 비밀번호(writerPwd).
 * 수정·삭제는 작성자(회원 본인 / 비회원은 글 비밀번호 일치)만 가능하다. 조회는 pdProductSvc.getQna. 입력 검증·본문 조립은 utils/mapBoard.ts.
 */
import { authCfg, csrDelete, csrPatch, csrPost, csrPut, idPath } from "~/utils/svcHttp";
import { buildQnaCreatePayload, buildQnaUpdatePayload } from "~/utils/mapBoard";
import type { CoIdResType } from "~/types/co/coIdResType";
import type { PdProdQnaCreateType, PdProdQnaUpdateType } from "~/types/pd/pdProdQnaWriteType";

const QNA = "/fo/ec/pd/qna";

export const pdQnaSvc = {
  /** POST /fo/ec/pd/qna — Q&A 등록. 제목은 내용 앞부분으로 서버가 만든다 */
  create: (body: PdProdQnaCreateType): Promise<CoIdResType> =>
    csrPost<{ prodQnaId: string }>(QNA, buildQnaCreatePayload(body), authCfg()).then((r) => ({ id: r.prodQnaId })),

  /** PUT /fo/ec/pd/qna/{id} — Q&A 수정(작성자만) */
  update: (qnaId: string, body: PdProdQnaUpdateType): Promise<void> => csrPut(idPath(QNA, qnaId), buildQnaUpdatePayload(body), authCfg()),

  /** DELETE /fo/ec/pd/qna/{id} — Q&A 삭제(작성자만) */
  remove: (qnaId: string, writerPwd?: string): Promise<void> => csrDelete(idPath(QNA, qnaId), authCfg({ data: writerPwd ? { writerPwd } : undefined })),

  /** PATCH /fo/ec/pd/qna/{id}/answer — 답변 등록/수정(MD 또는 판매자 소속 계정만). 2026-09-29(셀러 Phase 1) */
  answer: (qnaId: string, content: string): Promise<void> => csrPatch(`${idPath(QNA, qnaId)}/answer`, { content }, authCfg()),

  /** PATCH /fo/ec/pd/qna/{id}/hide — 강제 숨김 */
  hide: (qnaId: string): Promise<void> => csrPatch(`${idPath(QNA, qnaId)}/hide`, undefined, authCfg()),

  /** PATCH /fo/ec/pd/qna/{id}/unhide — 숨김 해제 */
  unhide: (qnaId: string): Promise<void> => csrPatch(`${idPath(QNA, qnaId)}/unhide`, undefined, authCfg()),
};
