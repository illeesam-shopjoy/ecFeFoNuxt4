<template>
  <!-- 버블 차트 — 시장 포지셔닝(성장률×시장규모, 원 크기=점유, 예시 값) -->
  <dv-widget-card :title="title" icon="🫧" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { dvAxis, dvColors, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

withDefaults(defineProps<{ title?: string; height?: number }>(), { title: "버블 차트", height: 220 });
const canvasRef = ref<HTMLCanvasElement | null>(null);
const bubbles = (n: number) => Array.from({ length: n }, () => ({ x: DvData.randFloat(0, 100), y: DvData.randFloat(0, 100), r: DvData.rand(5, 25) }));

const { refresh } = useDvChart(canvasRef, () => {
  const muted = dvColors().muted;
  return {
    type: "bubble",
    data: {
      datasets: [
        { label: "시장 A", data: bubbles(12), backgroundColor: `${DV_PALETTE[0]}88`, borderColor: DV_PALETTE[0] },
        { label: "시장 B", data: bubbles(10), backgroundColor: `${DV_PALETTE[2]}88`, borderColor: DV_PALETTE[2] },
        { label: "시장 C", data: bubbles(8), backgroundColor: `${DV_PALETTE[3]}88`, borderColor: DV_PALETTE[3] },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: dvLegend() },
      scales: {
        x: dvAxis({ title: { display: true, text: "성장률(%)", color: muted } }),
        y: dvAxis({ title: { display: true, text: "시장규모", color: muted } }),
      },
    },
  };
});
</script>
