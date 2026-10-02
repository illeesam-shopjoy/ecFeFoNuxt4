<template>
  <!-- 글쓰기 플로팅 버튼 — 홈/커뮤니티에서 노출. 스크롤 내리면 "+" 만 남긴다(당근 동작) -->
  <nuxt-link :to="to" class="dm-fab" :class="{ mini: scrolled }" aria-label="글쓰기">
    <i class="fas fa-plus" aria-hidden="true"></i>
    <span v-if="!scrolled">글쓰기</span>
  </nuxt-link>
</template>

<script setup lang="ts">
defineProps({ to: { type: String, default: "/write" } });

const scrolled = ref(false);
const onScroll = () => { scrolled.value = window.scrollY > 80; };
onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<style scoped>
.dm-fab {
  position: fixed; right: max(16px, calc(50% - 320px + 16px)); bottom: calc(80px + env(safe-area-inset-bottom)); z-index: 41;
  display: inline-flex; align-items: center; gap: 6px; height: 48px; padding: 0 18px; border-radius: 24px;
  background: var(--dm-primary); color: #fff; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(255, 111, 15, 0.35);
  transition: padding 0.2s ease;
}
.dm-fab.mini { padding: 0; width: 48px; justify-content: center; }
</style>
