/**
 * pdQnaSvc.ts — 상품 Q&A(상품문의) 작성·수정·삭제 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdQnaController(/api/fo/ec/pd/qna, 누구나 호출 가능) — 로그인 회원은 회원 명의, 비회원은 이름(writerNm)+글 비밀번호(writerPwd).
 * 수정·삭제는 작성자(회원 본인 / 비회원은 글 비밀번호 일치)만 가능하다. 조회는 pdProductSvc.getQna. 입력 검증·본문 조립은 utils/mapBoard.ts.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { buildQnaCreatePayload, buildQnaUpdatePayload } from "~/utils/mapBoard";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

const auth = () => ({ headers: useAuthHeaders() });
const qnaUrl = (id: string) => `/fo/ec/pd/qna/${encodeURIComponent(id)}`;

export const pdQnaSvc = {
  /** POST /fo/ec/pd/qna — Q&A 등록. 제목은 내용 앞부분으로 서버가 만든다 */
  create: async (body: { prodId: string; content: string; writerNm?: string; writerPwd?: string; scrtYn?: "Y" | "N"; attachFiles?: SyAttachChangeType[] }): Promise<{ id: string }> => ({
    id: (await axiosCsr.post<{ prodQnaId: string }>("/fo/ec/pd/qna", buildQnaCreatePayload(body), auth())).data.prodQnaId,
  }),

  /** PUT /fo/ec/pd/qna/{id} — Q&A 수정(작성자만) */
  update: async (qnaId: string, body: { content: string; writerPwd?: string; attachFiles?: SyAttachChangeType[] }): Promise<void> => {
    await axiosCsr.put(qnaUrl(qnaId), buildQnaUpdatePayload(body), auth());
  },

  /** DELETE /fo/ec/pd/qna/{id} — Q&A 삭제(작성자만) */
  remove: async (qnaId: string, writerPwd?: string): Promise<void> => {
    await axiosCsr.delete(qnaUrl(qnaId), { ...auth(), data: writerPwd ? { writerPwd } : undefined });
  },
};
