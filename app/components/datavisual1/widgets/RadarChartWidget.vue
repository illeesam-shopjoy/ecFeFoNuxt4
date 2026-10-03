<template>
  <!-- 레이더 차트 — 제품 A/B 지표 비교(예시 값) -->
  <dv-widget-card :title="title" icon="🕸️" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { dvColors, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

withDefaults(defineProps<{ title?: string; height?: number }>(), { title: "레이더 차트", height: 220 });
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { refresh } = useDvChart(canvasRef, () => {
  const c = dvColors();
  return {
    type: "radar",
    data: {
      labels: ["속도", "정확도", "안정성", "확장성", "보안", "UX"],
      datasets: [
        { label: "제품 A", data: DvData.randArr(6, 50, 100), borderColor: DV_PALETTE[0], backgroundColor: `${DV_PALETTE[0]}33`, pointBackgroundColor: DV_PALETTE[0] },
        { label: "제품 B", data: DvData.randArr(6, 40, 95), borderColor: DV_PALETTE[1], backgroundColor: `${DV_PALETTE[1]}33`, pointBackgroundColor: DV_PALETTE[1] },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: dvLegend() },
      scales: {
        r: {
          ticks: { color: c.muted, font: { size: 9 }, backdropColor: "transparent" },
          grid: { color: c.grid },
          pointLabels: { color: c.text, font: { size: 11 } },
          angleLines: { color: c.grid },
        },
      },
    },
  };
});
</script>
