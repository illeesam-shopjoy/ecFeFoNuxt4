<template>
  <!-- 라인 차트 — 기본은 월별 두 해 비교(예시 값) -->
  <dv-widget-card :title="title" icon="📈" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { dvAxis, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

const props = withDefaults(defineProps<{ title?: string; labels?: string[] | null; height?: number }>(), { title: "라인 차트", labels: null, height: 220 });
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { refresh } = useDvChart(canvasRef, () => {
  const labels = props.labels ?? DvData.months;
  return {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "2025", data: DvData.randArr(labels.length, 300, 900), borderColor: DV_PALETTE[0], backgroundColor: "transparent", tension: 0.4, pointRadius: 3 },
        { label: "2026", data: DvData.randArr(labels.length, 400, 1000), borderColor: DV_PALETTE[1], backgroundColor: "transparent", tension: 0.4, pointRadius: 3 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: dvLegend() }, scales: { x: dvAxis(), y: dvAxis() } },
  };
});
</script>
