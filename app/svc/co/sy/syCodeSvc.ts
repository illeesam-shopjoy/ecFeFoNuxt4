/**
 * syCodeSvc.ts — 공통코드 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘") —
 * useCodeStore.ts(axiosCsr)/adminSy/codes/index.vue($fetch)가 각자 다른 클라이언트로
 * "/api/co/sy/code"를 부르던 걸 한 곳으로 모음. 폴더 위치(svc/co/sy/)는 실제 라우트 경로
 * (server/api/co/sy/code/*)를 그대로 따른다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { type SyCodeType } from "~/types/syCodeType";

export const syCodeSvc = {
  /** GET /api/co/sy/code — 공통코드 전체 목록 */
  getCodes: () => axiosCsr.get<SyCodeType[]>("/api/co/sy/code").then((r) => r.data),
};
