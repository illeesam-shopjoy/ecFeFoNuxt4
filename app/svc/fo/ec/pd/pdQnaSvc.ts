/**
 * pdQnaSvc.ts — 상품 Q&A(상품문의) 작성·수정·삭제 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoPdQnaController(/api/fo/ec/pd/qna, 누구나 호출 가능) — 로그인 회원은 회원 명의, 비회원은 이름(writerNm)+글 비밀번호(writerPwd).
 * 수정·삭제는 작성자(회원 본인 / 비회원은 글 비밀번호 일치)만 가능하다. 조회는 pdProductSvc.getQna.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { AttachChange } from "~/svc/fo/ec/pd/pdReviewSvc";

/** 백엔드 검증 실패 메시지를 소비처(e.data.message / e.message)가 그대로 읽도록 던진다 */
function badRequest(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 400, statusMessage: message, data: { message, statusMessage: message } });
}

export const pdQnaSvc = {
  /** POST /fo/ec/pd/qna — Q&A 등록. 제목은 내용 앞부분으로 서버가 만든다 */
  create: async (body: { prodId: string; content: string; writerNm?: string; writerPwd?: string; scrtYn?: "Y" | "N"; attachFiles?: AttachChange[] }): Promise<{ id: string }> => {
    const prodQnaContent = String(body.content ?? "").trim();
    if (!body.prodId) badRequest("상품 ID가 필요합니다.");
    if (!prodQnaContent) badRequest("문의 내용을 입력해 주세요.");
    const payload: Record<string, unknown> = { prodId: body.prodId, prodQnaContent };
    if (body.writerNm) payload.writerNm = body.writerNm.trim();
    if (body.writerPwd) payload.writerPwd = body.writerPwd;
    if (body.scrtYn) payload.scrtYn = body.scrtYn;
    if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
    const created = (await axiosCsr.post<{ prodQnaId: string }>("/fo/ec/pd/qna", payload, { headers: useAuthHeaders() })).data;
    return { id: created.prodQnaId };
  },

  /** PUT /fo/ec/pd/qna/{id} — Q&A 수정(작성자만) */
  update: async (qnaId: string, body: { content: string; writerPwd?: string; attachFiles?: AttachChange[] }): Promise<void> => {
    const prodQnaContent = String(body.content ?? "").trim();
    if (!prodQnaContent) badRequest("문의 내용을 입력해 주세요.");
    const payload: Record<string, unknown> = { prodQnaContent };
    if (body.writerPwd) payload.writerPwd = body.writerPwd;
    if (body.attachFiles?.length) payload.attachFiles = body.attachFiles;
    await axiosCsr.put(`/fo/ec/pd/qna/${encodeURIComponent(qnaId)}`, payload, { headers: useAuthHeaders() });
  },

  /** DELETE /fo/ec/pd/qna/{id} — Q&A 삭제(작성자만) */
  remove: async (qnaId: string, writerPwd?: string): Promise<void> => {
    await axiosCsr.delete(`/fo/ec/pd/qna/${encodeURIComponent(qnaId)}`, { headers: useAuthHeaders(), data: writerPwd ? { writerPwd } : undefined });
  },
};
