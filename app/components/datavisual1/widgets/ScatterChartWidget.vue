<template>
  <!-- 산점도 — 두 그룹의 무작위 점(예시 값) -->
  <dv-widget-card :title="title" icon="✨" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { dvAxis, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

const props = withDefaults(defineProps<{ title?: string; height?: number; n?: number }>(), { title: "산점도 차트", height: 220, n: 50 });
const canvasRef = ref<HTMLCanvasElement | null>(null);
const points = (n: number) => Array.from({ length: n }, () => ({ x: DvData.randFloat(-10, 10), y: DvData.randFloat(-10, 10) }));

const { refresh } = useDvChart(canvasRef, () => ({
  type: "scatter",
  data: {
    datasets: [
      { label: "그룹 A", data: points(props.n), backgroundColor: `${DV_PALETTE[0]}aa`, pointRadius: 5 },
      { label: "그룹 B", data: points(props.n), backgroundColor: `${DV_PALETTE[2]}aa`, pointRadius: 5 },
    ],
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: dvLegend() }, scales: { x: dvAxis(), y: dvAxis() } },
}));
</script>
