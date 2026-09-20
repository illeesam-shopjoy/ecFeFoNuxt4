/**
 * syCodeSvc.ts — 공통코드 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo CoSyCodeController(/api/co/sy/code, 공개) 를 직접 부른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { mapCodes } from "~/utils/mapMaster";
import type { SyCodeType } from "~/types/sy/syCodeType";

export const syCodeSvc = {
  /** GET /co/sy/code — 공통코드 전체 */
  getCodes: async (): Promise<SyCodeType[]> => mapCodes((await axiosCsr.get<SyCodeType[]>("/co/sy/code")).data),

  /** GET /co/sy/code/groups — 지정한 코드그룹만(여러 그룹 한 번에). 화면이 쓰는 그룹만 받아 누적 적재할 때 쓴다 */
  getByGroups: async (codeGrps: string[]): Promise<SyCodeType[]> => mapCodes((await axiosCsr.get<SyCodeType[]>("/co/sy/code/groups", { params: { codeGrps } })).data ?? []),
};
