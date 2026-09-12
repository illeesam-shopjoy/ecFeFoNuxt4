/**
 * foMenuSvc.ts — FO 메뉴 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘"). 폴더 위치(svc/fo/)는 실제
 * 라우트 경로(server/api/fo/menu.get.ts)를 그대로 따른다.
 */
import { axiosSsr } from "~/utils/axiosSsr";
import { type SyMenuTreeType } from "~/types/syMenuTreeType";

export const foMenuSvc = {
  /** GET /api/fo/menu — 상단/사이드 메뉴(정적 목록) */
  getMenus: () => axiosSsr.get<SyMenuTreeType[]>("/api/fo/menu").then((r) => r.data),
};
