<template>
  <!-- 비어 있음/로딩/로그인 필요 안내 한 덩이 -->
  <div class="dm-empty">
    <i :class="icon" aria-hidden="true"></i>
    <p class="dm-empty__title">{{ title }}</p>
    <p v-if="desc" class="dm-empty__desc">{{ desc }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: { type: String, default: "far fa-inbox" },
  title: { type: String, default: "아직 없어요" },
  desc: { type: String, default: "" },
});
</script>

<style scoped>
.dm-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 56px 24px; text-align: center; color: var(--dm-text-2); }
.dm-empty i { font-size: 40px; color: var(--dm-text-3); margin-bottom: 8px; }
.dm-empty__title { margin: 0; font-size: 16px; font-weight: 700; color: var(--dm-text); }
.dm-empty__desc { margin: 0; font-size: 14px; }
</style>
