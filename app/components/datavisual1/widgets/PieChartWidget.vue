<template>
  <!-- 파이 / 도넛 차트 — 트래픽 출처(예시 값). donut 이면 가운데를 비운다 -->
  <dv-widget-card :title="title" :icon="donut ? '🍩' : '🥧'" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { cssVar, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

const props = withDefaults(defineProps<{ title?: string; donut?: boolean; height?: number }>(), { title: "파이 차트", donut: false, height: 220 });
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { refresh } = useDvChart(canvasRef, () => {
  const labels = ["검색", "소셜", "직접", "이메일", "유료", "기타"];
  return {
    type: props.donut ? "doughnut" : "pie",
    data: { labels, datasets: [{ data: DvData.randArr(labels.length, 10, 50), backgroundColor: DV_PALETTE, borderWidth: 2, borderColor: cssVar("--bg-modal", "#fff") }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: props.donut ? "60%" : 0, plugins: { legend: dvLegend("right", 10) } },
  };
});
</script>
