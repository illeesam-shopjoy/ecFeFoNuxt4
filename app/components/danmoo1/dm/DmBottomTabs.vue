<template>
  <!-- 하단 탭 — 당근 하단 메뉴 5개. 채팅 탭에는 안 읽은 알림 수 대신 로그인 상태만 표시(채팅 미읽음 API 없음) -->
  <nav class="dm-tabs" aria-label="하단 메뉴">
    <nuxt-link v-for="t in DM_TABS" :key="t.key" :to="t.to" class="dm-tab" :class="{ on: isOn(t) }">
      <i :class="t.icon" aria-hidden="true"></i>
      <span>{{ t.label }}</span>
    </nuxt-link>
  </nav>
</template>

<script setup lang="ts">
import { DM_TABS } from "~/conts/tenant/danmoo1";

const route = useRoute();
const isOn = (t: (typeof DM_TABS)[number]) => (t.to === "/" ? route.path === "/" : route.path === t.to || route.path.startsWith(`${t.to}/`));
</script>

<style scoped>
.dm-tabs {
  position: fixed; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 100%; max-width: 640px; height: 64px; padding-bottom: env(safe-area-inset-bottom);
  display: grid; grid-template-columns: repeat(5, 1fr);
  background: var(--dm-bg); border-top: 1px solid var(--dm-line); z-index: 40;
}
.dm-tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 11px; color: var(--dm-text-2); }
.dm-tab i { font-size: 20px; }
.dm-tab.on { color: var(--dm-text); font-weight: 700; }
</style>
