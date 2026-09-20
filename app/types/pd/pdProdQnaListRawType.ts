import type { PdProdQnaRawType } from "~/types/pd/pdProdQnaType";

/** GET /fo/ec/pd/prod/{id}/qna 원본 응답 — { qnaPage: { pageList } } */
export interface PdProdQnaListRawType {
  qnaPage?: { pageList?: PdProdQnaRawType[] };
}
