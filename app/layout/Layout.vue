<template>
  <div>
    <Header :transparent="transparent" :white_bg="white_bg" />
    <slot></slot>
    <Footer />
    <back-to-top />
    <chat-widget />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Header from "./headers/Header.vue";
import Footer from "./footers/Footer.vue";
import BackToTop from "~/components/back-to-top/BackToTop.vue";
import ChatWidget from "~/components/chat/ChatWidget.vue";
import { useProductsStore } from "~/store/useProductsStore";

defineProps({
  transparent: { type: Boolean, default: false },
  white_bg: { type: Boolean, default: false },
});

// 2026-09-17 버그수정: app.vue의 productsStore.loadStProducts() 호출은 앱이 처음 뜰 때
// 딱 한 번만 실행된다 — 그 시점에 백엔드가 일시적으로 느려서/에러여서 실패하면(loaded=false로
// 남음, useProductsStore.ts 참조) 이후 재시도하는 곳이 어디에도 없어서 브라우저 탭을 새로고침
// 하기 전까진 인기상품/할인/쇼핑목록 등 store.products에 기대는 모든 화면이 영구히 빈 채로
// 남았다. 거의 모든 페이지가 이 Layout을 감싸고, 페이지 이동마다(SPA 라우팅) 새로 mount되므로
// 여기서 "아직 못 불러왔으면 다시 시도"를 걸어두면 자연스러운 재시도 지점이 된다.
const productsStore = useProductsStore();
onMounted(() => {
  if (!productsStore.loaded) productsStore.loadStProducts();
});
</script>
