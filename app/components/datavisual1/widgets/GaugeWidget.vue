<template>
  <!-- 게이지 — 반원 도넛 + 가운데 값·상태 문구(예시 값, ↻ 로 새 값) -->
  <dv-widget-card :title="title" icon="⏱️" body-style="align-items:center;justify-content:center;" @refresh="randomize">
    <div style="position: relative; width: 100%" :style="{ height: `${height}px` }">
      <canvas ref="canvasRef"></canvas>
      <div style="position: absolute; bottom: 18px; left: 0; right: 0; text-align: center">
        <div class="gauge-value">{{ value }}{{ label }}</div>
        <div class="gauge-label">{{ status }}</div>
      </div>
    </div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import type { Chart } from "chart.js";
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DvData } from "~/conts/tenant/datavisual1";
import { dvColors, useDvChart } from "~/layout/datavisual1/dvChart";

withDefaults(defineProps<{ title?: string; label?: string; height?: number }>(), { title: "게이지", label: "%", height: 180 });
const canvasRef = ref<HTMLCanvasElement | null>(null);
const value = ref(DvData.rand(30, 95));
const status = computed(() => (value.value < 30 ? "⚠️ 주의 필요" : value.value < 60 ? "🟡 보통" : value.value < 85 ? "🟢 양호" : "🔵 최고"));
const colorOf = (v: number) => (v < 30 ? "#f59e0b" : v < 70 ? "#0099cc" : "#00c97a");

const { chart } = useDvChart(canvasRef, () => ({
  type: "doughnut",
  data: { datasets: [{ data: [value.value, 100 - value.value], backgroundColor: [colorOf(value.value), dvColors().track], borderWidth: 0, circumference: 180, rotation: 270 }] },
  options: { responsive: true, maintainAspectRatio: false, cutout: "72%", plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { duration: 600 } },
}));

function randomize() {
  value.value = DvData.rand(10, 98);
  const c = chart() as Chart<"doughnut"> | null;
  if (!c) return;
  const ds = c.data.datasets[0]!;
  ds.data = [value.value, 100 - value.value];
  ds.backgroundColor = [colorOf(value.value), dvColors().track];
  c.update();
}
</script>
