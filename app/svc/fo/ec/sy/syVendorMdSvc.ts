/**
 * syVendorMdSvc.ts — 판매업체 / 담당MD 목록 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoSyVendorMdController(/api/fo/ec/sy/vendor · /md, 공개) — 상품목록 좌측 필터의 모달 선택 항목.
 */
import { csrList } from "~/utils/svcHttp";
import type { SyFilterOptType } from "~/types/sy/syFilterOptType";

export const syVendorMdSvc = {
  /** GET /fo/ec/sy/vendor — 상품이 있는 판매업체 */
  getVendors: (): Promise<SyFilterOptType[]> => csrList<SyFilterOptType>("/fo/ec/sy/vendor"),

  /** GET /fo/ec/sy/site — 상품이 있는 사이트 */
  getSites: (): Promise<SyFilterOptType[]> => csrList<SyFilterOptType>("/fo/ec/sy/site"),

  /** GET /fo/ec/sy/md — 상품의 담당MD */
  getMds: (): Promise<SyFilterOptType[]> => csrList<SyFilterOptType>("/fo/ec/sy/md"),
};
