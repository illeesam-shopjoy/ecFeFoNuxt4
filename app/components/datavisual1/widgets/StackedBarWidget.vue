<template>
  <!-- 스택 바 / 수평 바 — 채널별 유입을 쌓아서(예시 값). horizontal 이면 제품별 가로 막대 -->
  <dv-widget-card :title="title" icon="📊" @refresh="refresh">
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE, DvData } from "~/conts/tenant/datavisual1";
import { dvAxis, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

const props = withDefaults(defineProps<{ title?: string; height?: number; horizontal?: boolean }>(), { title: "스택 바 차트", height: 220, horizontal: false });
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { refresh } = useDvChart(canvasRef, () => {
  const labels = props.horizontal ? ["제품A", "제품B", "제품C", "제품D", "제품E"] : DvData.months.slice(0, 7);
  const datasets = ["직접", "소셜", "검색", "이메일"].map((seg, i) => ({ label: seg, data: DvData.randArr(labels.length, 50, 300), backgroundColor: `${DV_PALETTE[i]}cc` }));
  return {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: props.horizontal ? "y" : "x",
      plugins: { legend: dvLegend() },
      scales: { x: dvAxis({ stacked: true }), y: dvAxis({ stacked: true }) },
    },
  };
});
</script>
