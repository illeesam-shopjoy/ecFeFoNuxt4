/**
 * hydrate-local-stores.client.ts
 *
 * 2026-09-14(요청사항: "1행4,5 항목 위시리스트 추가했어 추가된 위시리스트의 하드가
 * 토글활성화가되어야해 개선해줘") — 위시리스트/장바구니/비교 상태는 localStorage에
 * 저장되지만, 각 store의 getSt-/loadSt- 류 getter를 실제로 "읽어야" localStorage →
 * Pinia state로 동기화되는 lazy 방식이라(useWishlistStore.ts 등 참조), 그동안은
 * 해당 전용 페이지(위시리스트/장바구니/비교 페이지)에 들어가야만 그 접근이 일어났다.
 * 그래서 다른 페이지를 새로 열거나 새로고침하면 실제로는 담겨있는데도 하트 아이콘이
 * 계속 비활성(테두리)으로 보였다 — 앱이 클라이언트에서 뜰 때 한 번 세 store를 모두
 * 동기화해서, 어느 페이지에서 시작하든 정확한 상태가 바로 보이게 한다.
 */
import { useWishlistStore } from "~/store/useWishlistStore";
import { useCartStore } from "~/store/useCartStore";
import { useCompareStore } from "~/store/useCompareStore";

export default defineNuxtPlugin(() => {
  useWishlistStore().getStWishlistProducts;
  useCartStore().loadStCartProducts;
  useCompareStore().getStCompareProducts;
});
