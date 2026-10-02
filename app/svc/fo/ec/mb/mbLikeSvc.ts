/**
 * mbLikeSvc.ts — 찜(좋아요) API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-10-02.
 * ecBeBo FoMbLikeController(/api/fo/ec/mb/like, FO_ONLY) — 로그인 토큰 필요(authCfg). 사이트는 서버가 요청의 X-Site-Id 로 확정한다.
 */
import { authCfg, csrDelete, csrList, csrPost } from "~/utils/svcHttp";
import type { MbLikeTargetTypeCd, MbLikeToggleResType, MbLikeType } from "~/types/mb/mbLikeType";

const LIKE = "/fo/ec/mb/like";

export const mbLikeSvc = {
  /** GET /fo/ec/mb/like?targetTypeCd= — 내 찜 목록(상품이면 prod 포함) */
  getMyLikes: (targetTypeCd: MbLikeTargetTypeCd = "PRODUCT"): Promise<MbLikeType[]> => csrList<MbLikeType>(LIKE, authCfg({ params: { targetTypeCd } })),

  /** POST /fo/ec/mb/like/{type}/{id} — 찜 토글. 결과 liked=true 면 찜 됨 */
  toggle: (targetId: string, targetTypeCd: MbLikeTargetTypeCd = "PRODUCT"): Promise<boolean> =>
    csrPost<MbLikeToggleResType>(`${LIKE}/${targetTypeCd}/${encodeURIComponent(targetId)}`, undefined, authCfg()).then((r) => !!r?.liked),

  /** DELETE /fo/ec/mb/like/{type}/{id} — 찜 취소 */
  unlike: (targetId: string, targetTypeCd: MbLikeTargetTypeCd = "PRODUCT"): Promise<void> => csrDelete(`${LIKE}/${targetTypeCd}/${encodeURIComponent(targetId)}`, authCfg()),
};
