import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

/** 상품 Q&A 작성 입력 — 비회원은 writerNm + writerPwd (utils/mapBoard.buildQnaCreatePayload) */
export interface PdProdQnaCreateType {
  prodId: string;
  title?: string; // 제목 (선택 — 비우면 서버가 내용 앞부분으로 만든다)
  content: string;
  writerNm?: string;
  writerPwd?: string;
  scrtYn?: "Y" | "N";
  attachFiles?: SyAttachChangeType[];
}

/** 상품 Q&A 수정 입력 — 작성자만(회원 본인 또는 비회원은 writerPwd 일치) */
export type PdProdQnaUpdateType = Pick<PdProdQnaCreateType, "title" | "content" | "writerPwd" | "attachFiles">;
