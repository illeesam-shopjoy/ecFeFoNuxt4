<template>
  <!-- 히트맵 — 요일×시간대 칸 색(CSS 격자, 낮 시간대가 더 진하게 나오는 예시 값) -->
  <dv-widget-card :title="title" icon="🔥" @refresh="generate">
    <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 6px; display: flex; justify-content: space-between">
      <span>0:00</span><span>6:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
    </div>
    <div class="heatmap-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="heatmap-cell"
        :style="{ background: cellColor(cell.v), paddingBottom: `${Math.floor(100 / rows)}%` }"
        :title="`${ROW_LABELS[cell.r] ?? cell.r}요일 ${cell.hour}시 : ${cell.v}`"
      ></div>
    </div>
    <div style="margin-top: 8px; display: flex; align-items: center; gap: 6px; justify-content: flex-end">
      <span style="font-size: 0.65rem; color: var(--text-muted)">낮음</span>
      <div style="display: flex; gap: 2px">
        <div v-for="s in 8" :key="s" style="width: 12px; height: 8px; border-radius: 2px" :style="{ background: scaleColor(s / 8) }"></div>
      </div>
      <span style="font-size: 0.65rem; color: var(--text-muted)">높음</span>
    </div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";

const props = withDefaults(defineProps<{ title?: string; rows?: number; cols?: number }>(), { title: "히트맵", rows: 7, cols: 24 });
const ROW_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const cells = ref<{ r: number; h: number; hour: number; v: number }[]>([]);

/** 칸 수가 24보다 적으면 한 칸이 여러 시간 — 원본은 칸 번호를 그대로 "시"로 보여 줬다 */
function generate() {
  const arr: { r: number; h: number; hour: number; v: number }[] = [];
  for (let r = 0; r < props.rows; r++) {
    for (let h = 0; h < props.cols; h++) {
      const hour = Math.floor((h * 24) / props.cols);
      const peak = hour >= 9 && hour <= 18 ? 1.8 : 0.6;
      arr.push({ r, h, hour, v: Math.floor(Math.random() * 100 * peak) });
    }
  }
  cells.value = arr;
}

function scaleColor(t: number): string {
  if (t < 0.25) return `rgba(0,153,204,${0.2 + t * 0.8})`;
  if (t < 0.5) return `rgba(0,201,122,${0.3 + t})`;
  if (t < 0.75) return `rgba(245,158,11,${0.4 + t * 0.6})`;
  return `rgba(239,68,68,${0.5 + t * 0.5})`;
}
function cellColor(v: number): string {
  return v < 10 ? "rgba(0,153,204,0.05)" : scaleColor(Math.min(v / 100, 1));
}

onMounted(generate);
</script>
