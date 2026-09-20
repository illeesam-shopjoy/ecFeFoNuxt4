/**
 * syCodeSvc.ts — 공통코드 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo CoSyCodeController(/api/co/sy/code, 공개) 를 직접 부른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { type SyCodeType } from "~/types/sy/syCodeType";

export const syCodeSvc = {
  /** GET /co/sy/code — 공통코드 전체 */
  getCodes: async (): Promise<SyCodeType[]> => {
    const rows = (await axiosCsr.get<SyCodeType[]>("/co/sy/code")).data;
    return rows.map((r) => ({ codeId: r.codeId, codeGrp: r.codeGrp, codeValue: r.codeValue, codeLabel: r.codeLabel }));
  },
};
