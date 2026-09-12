/**
 * pdProductSvc.ts — 상품 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘") —
 * shop.vue/useProductsStore.ts/prod-dtl/*.vue/adminEc/products/*.vue가 각자
 * "/api/fo/ec/pd/prod/..." 문자열을 그대로 axios/$fetch에 박아 호출하던 걸 한 곳으로 모음.
 * 폴더 위치(svc/fo/ec/pd/)는 실제 라우트 경로(server/api/fo/ec/pd/*)를 그대로 따른다.
 * SSR/CSR 어느 쪽에서 불러도 되도록 axiosSsr을 쓴다(SSR은 절대경로, CSR은 상대경로로
 * 자동 처리 — server/utils/axiosSsr.ts 참조).
 */
import { axiosSsr } from "~/utils/axiosSsr";
import { type PdProductType } from "~/types/pdProductType";

export const pdProductSvc = {
  /** GET /api/fo/ec/pd/prod/page — 상품 목록 */
  getPage: () => axiosSsr.get<PdProductType[]>("/api/fo/ec/pd/prod/page").then((r) => r.data),

  /** GET /api/fo/ec/pd/prod/{id} — 상품 단건 */
  getById: (id: string) => axiosSsr.get<PdProductType>(`/api/fo/ec/pd/prod/${id}`).then((r) => r.data),
};
