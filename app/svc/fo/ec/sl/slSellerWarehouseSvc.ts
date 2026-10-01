/**
 * slSellerWarehouseSvc.ts — 판매자 창고(출고지/반품지) CRUD API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoSlSellerWarehouseController(/api/fo/ec/sl/seller-warehouse, FO_ONLY) — 로그인 토큰 필요(authCfg).
 * 로그인 회원이 소속된(ACTIVE) 판매자의 창고만 다룬다 — 판매자가 아니면 서버가 오류를 던진다.
 */
import { authCfg, csrDelete, csrList, csrPost, csrPut, idPath } from "~/utils/svcHttp";
import type { SlSellerWarehouseSaveType, SlSellerWarehouseType } from "~/types/sl/slSellerWarehouseType";

const WAREHOUSE = "/fo/ec/sl/seller-warehouse";

export const slSellerWarehouseSvc = {
  /** GET — 내 판매자의 창고 전체(사용/미사용 모두) */
  getMyWarehouses: (): Promise<SlSellerWarehouseType[]> => csrList<SlSellerWarehouseType>(WAREHOUSE, authCfg()),

  /** POST — 창고 등록 */
  createWarehouse: (body: SlSellerWarehouseSaveType): Promise<SlSellerWarehouseType> => csrPost<SlSellerWarehouseType>(WAREHOUSE, body, authCfg()),

  /** PUT /{id} — 창고 수정(소유 판매자만) */
  updateWarehouse: (warehouseId: string, body: SlSellerWarehouseSaveType): Promise<SlSellerWarehouseType> =>
    csrPut<SlSellerWarehouseType>(idPath(WAREHOUSE, warehouseId), body, authCfg()),

  /** DELETE /{id} — 창고 삭제(하드 삭제, 소유 판매자만) */
  removeWarehouse: (warehouseId: string): Promise<void> => csrDelete(idPath(WAREHOUSE, warehouseId), authCfg()),
};
