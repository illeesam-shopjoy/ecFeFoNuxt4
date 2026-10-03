<template>
  <!-- KPI 카드 — 값·증감(▲▼)·아이콘. 색은 blue | green | orange | purple | teal (테마 변수) -->
  <div class="kpi-card" :style="{ borderTop: `3px solid var(--${color})` }">
    <div class="kpi-icon">{{ icon }}</div>
    <div class="kpi-label">{{ title }}</div>
    <div class="kpi-value" :style="{ color: `var(--${color})` }">{{ value }}</div>
    <div v-if="sub" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px">{{ sub }}</div>
    <div class="kpi-badge" :class="dir === 'up' ? 'up' : 'down'">
      <span>{{ dir === "up" ? "▲" : "▼" }}</span>
      <span>{{ trend }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ title?: string; value?: string; trend?: string; dir?: "up" | "down"; icon?: string; color?: string; sub?: string }>(),
  { title: "KPI 지표", value: "0", trend: "+0%", dir: "up", icon: "📊", color: "blue", sub: "" },
);
</script>
