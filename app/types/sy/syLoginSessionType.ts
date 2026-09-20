import type { MbAuthUserType } from "~/types/mb/mbAuthUserType";

/** 로그인 결과 — 액세스 토큰 + 세션에 보관할 회원 정보 (utils/mapMy.mapLoginRes) */
export interface SyLoginSessionType {
  token: string;
  user: MbAuthUserType;
}
