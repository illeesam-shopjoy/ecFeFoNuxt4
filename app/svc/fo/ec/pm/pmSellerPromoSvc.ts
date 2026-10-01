/**
 * pmSellerPromoSvc.ts — 판매자 프로모션(할인·적립금·상품권) API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-10-02 (셀러 Phase 2 · 2C).
 * ecBeBo FoPmSellerPromoController(/api/fo/ec/pm/seller-promo/{discnt|save|voucher}, FO_ONLY) — 로그인 토큰 필요(authCfg).
 * 승인된(ACTIVE) 판매자의 본인 정책만 다룬다. DELETE 는 물리 삭제가 아니라 종료(비활성) 처리.
 */
import { authCfg, csrDelete, csrGet, csrList, csrPost, csrPut, idPath } from "~/utils/svcHttp";
import type { PmSellerPromoKindType, PmSellerPromoSaveType, PmSellerPromoType } from "~/types/pm/pmSellerPromoType";

const BASE = "/fo/ec/pm/seller-promo";

export const pmSellerPromoSvc = {
  /** GET /{kind} — 내 프로모션 목록 */
  list: (kind: PmSellerPromoKindType): Promise<PmSellerPromoType[]> => csrList<PmSellerPromoType>(`${BASE}/${kind}`, authCfg()),

  /** GET /{kind}/{id} — 상세(할인·적립금은 대상 상품 prodIds 포함) */
  get: (kind: PmSellerPromoKindType, id: string): Promise<PmSellerPromoType> => csrGet<PmSellerPromoType>(idPath(`${BASE}/${kind}`, id), authCfg()),

  /** POST /{kind} — 등록 */
  create: (kind: PmSellerPromoKindType, body: PmSellerPromoSaveType): Promise<PmSellerPromoType> => csrPost<PmSellerPromoType>(`${BASE}/${kind}`, body, authCfg()),

  /** PUT /{kind}/{id} — 수정 */
  update: (kind: PmSellerPromoKindType, id: string, body: PmSellerPromoSaveType): Promise<PmSellerPromoType> => csrPut<PmSellerPromoType>(idPath(`${BASE}/${kind}`, id), body, authCfg()),

  /** DELETE /{kind}/{id} — 종료(비활성) 처리 */
  end: (kind: PmSellerPromoKindType, id: string): Promise<void> => csrDelete(idPath(`${BASE}/${kind}`, id), authCfg()),
};
