/**
 * coMapSvc — 지도 SDK 공개키 조회 (ecBeBo GET /api/co/cm/map/keys, permitAll).
 * 카카오 JS 키 / 네이버 Client ID 는 브라우저 노출 가능한 공개키만 내려온다. 값이 비어 있으면 미설정.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import type { SyMapKeysType } from "~/types/sy/syMapKeysType";

export const coMapSvc = {
  getKeys: async (appTypeCd: "FO" | "BO" = "FO"): Promise<SyMapKeysType> => (await axiosCsr.get<SyMapKeysType>("/co/cm/map/keys", { params: { appTypeCd } })).data ?? {},
};
