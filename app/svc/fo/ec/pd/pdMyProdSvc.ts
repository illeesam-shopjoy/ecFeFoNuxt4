/**
 * pdMyProdSvc.ts — 판매자 상품등록(단품) API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-10-02 (셀러 Phase 2 · 2B).
 * ecBeBo FoPdProdWriteController(/api/fo/ec/pd/my-prod, FO_ONLY) — 로그인 토큰 필요(authCfg). 승인된(ACTIVE) 판매자의 본인 상품만 다룬다.
 * 입력 검증은 서버가 한다(상품유형·판매자·사이트는 서버 강제). DELETE 는 물리 삭제가 아니라 판매종료 처리.
 */
import { authCfg, csrDelete, csrGet, csrList, csrPost, csrPut, idPath } from "~/utils/svcHttp";
import type { PdCategoryType } from "~/types/pd/pdCategoryType";
import type { PdMyProdSaveType, PdMyProdType } from "~/types/pd/pdMyProdType";

const MY_PROD = "/fo/ec/pd/my-prod";

export const pdMyProdSvc = {
  /** GET — 내 상품 목록(판매종료 포함). warehouseId 가 있으면 그 창고 상품·재고만(창고 재고 조회 뷰) */
  getMyProds: (warehouseId?: string): Promise<PdMyProdType[]> => csrList<PdMyProdType>(MY_PROD, authCfg({ params: warehouseId ? { warehouseId } : undefined })),

  /** GET /{id} — 내 상품 상세(수정 화면용, 상세설명 포함) */
  getMyProd: (prodId: string): Promise<PdMyProdType> => csrGet<PdMyProdType>(idPath(MY_PROD, prodId), authCfg()),

  /** POST — 단품 등록 */
  createProd: (body: PdMyProdSaveType): Promise<PdMyProdType> => csrPost<PdMyProdType>(MY_PROD, body, authCfg()),

  /** PUT /{id} — 내 상품 수정 */
  updateProd: (prodId: string, body: PdMyProdSaveType): Promise<PdMyProdType> => csrPut<PdMyProdType>(idPath(MY_PROD, prodId), body, authCfg()),

  /** DELETE /{id} — 판매종료 처리(물리 삭제 아님) */
  endProd: (prodId: string): Promise<void> => csrDelete(idPath(MY_PROD, prodId), authCfg()),

  /** GET /fo/ec/pd/category — 카테고리 평탄 목록(공개). 등록 폼의 카테고리 선택용 */
  getCategories: (): Promise<PdCategoryType[]> => csrList<PdCategoryType>("/fo/ec/pd/category"),
};
