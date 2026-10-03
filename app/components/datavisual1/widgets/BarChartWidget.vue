<template>
  <!-- 바 차트 — 채널별 이번달/저번달(예시 값) -->
  <dv-widget-card :title="title" icon="📊" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { dvAxis, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

const props = withDefaults(defineProps<{ title?: string; labels?: string[] | null; height?: number }>(), { title: "바 차트", labels: null, height: 220 });
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { refresh } = useDvChart(canvasRef, () => {
  const labels = props.labels ?? ["채널 A", "채널 B", "채널 C", "채널 D", "채널 E", "채널 F"];
  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "이번달", data: DvData.randArr(labels.length, 100, 800), backgroundColor: DV_PALETTE.map((c) => `${c}bb`) },
        { label: "저번달", data: DvData.randArr(labels.length, 80, 700), backgroundColor: DV_PALETTE.map((c) => `${c}44`) },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: dvLegend() }, scales: { x: dvAxis(), y: dvAxis() } },
  };
});
</script>
