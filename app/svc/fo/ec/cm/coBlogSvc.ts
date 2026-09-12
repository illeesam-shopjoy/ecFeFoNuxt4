/**
 * coBlogSvc.ts — 블로그 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘") —
 * useBlogs.ts/BlogDetailsArea.vue/blog-dtl/index.vue/blog-dtl/[id].vue가 각자
 * "/api/fo/ec/cm/bltn/..." 문자열을 그대로 axiosSsr에 박아 호출하던 걸 한 곳으로 모음.
 * 폴더 위치(svc/fo/ec/cm/)는 실제 라우트 경로(server/api/fo/ec/cm/*)를 그대로 따른다.
 */
import { axiosSsr } from "~/utils/axiosSsr";
import { type CoBlogType } from "~/types/coBlogType";

export const coBlogSvc = {
  /** GET /api/fo/ec/cm/bltn/page — 블로그 목록 */
  getPage: () => axiosSsr.get<CoBlogType[]>("/api/fo/ec/cm/bltn/page").then((r) => r.data),

  /** GET /api/fo/ec/cm/bltn/{id} — 블로그 단건 */
  getById: (id: string) => axiosSsr.get<CoBlogType>(`/api/fo/ec/cm/bltn/${id}`).then((r) => r.data),
};
