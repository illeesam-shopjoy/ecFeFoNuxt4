/**
 * myCardSvc.ts — 마이페이지 결제카드 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyExtraController(/api/fo/ec/my/card, FO_ONLY) — 카드 등록은 토스 빌링 인증(authKey)으로 서버가 빌링키를 발급받아 보관한다.
 */
import { authCfg, csrDelete, csrList, csrPatch, csrPost, idPath } from "~/utils/svcHttp";
import type { MbMemberCardType } from "~/types/mb/mbMemberCardType";

const CARD = "/fo/ec/my/card";

export const myCardSvc = {
  /** GET /fo/ec/my/card — 내 카드 목록(기본 카드 먼저) */
  getCards: (): Promise<MbMemberCardType[]> => csrList<MbMemberCardType>(CARD, authCfg()),

  /** POST /fo/ec/my/card — 토스 빌링 인증을 마친 authKey 로 카드 등록 */
  addCard: (authKey: string): Promise<MbMemberCardType[]> => csrPost<MbMemberCardType[]>(CARD, { authKey }, authCfg()),

  /** PATCH /fo/ec/my/card/{id}/default — 기본 카드로 설정 */
  setDefault: (cardId: string): Promise<MbMemberCardType[]> => csrPatch<MbMemberCardType[]>(idPath(CARD, cardId, "/default"), undefined, authCfg()),

  /** DELETE /fo/ec/my/card/{id} — 카드 삭제 */
  removeCard: (cardId: string): Promise<MbMemberCardType[]> => csrDelete<MbMemberCardType[]>(idPath(CARD, cardId), authCfg()),
};
