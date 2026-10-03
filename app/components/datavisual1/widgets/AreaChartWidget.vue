<template>
  <!-- 에어리어 차트 — 월별 수익·비용(예시 값) -->
  <dv-widget-card :title="title" icon="🌊" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { dvAxis, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

withDefaults(defineProps<{ title?: string; height?: number }>(), { title: "에어리어 차트", height: 220 });
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { refresh } = useDvChart(canvasRef, () => ({
  type: "line",
  data: {
    labels: DvData.months,
    datasets: [
      { label: "수익", data: DvData.randArr(12, 200, 900), borderColor: DV_PALETTE[0], backgroundColor: `${DV_PALETTE[0]}33`, fill: true, tension: 0.4, pointRadius: 3 },
      { label: "비용", data: DvData.randArr(12, 100, 600), borderColor: DV_PALETTE[4], backgroundColor: `${DV_PALETTE[4]}22`, fill: true, tension: 0.4, pointRadius: 3 },
    ],
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: dvLegend() }, scales: { x: dvAxis(), y: dvAxis() } },
}));
</script>
