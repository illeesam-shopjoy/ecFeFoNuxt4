<template>
  <!-- 실시간 시계열 산점도 — interval(ms)마다 두 신호의 점을 더하고 maxPts 개만 남긴다. 일시정지·지우기, 현재/최대/평균 -->
  <dv-widget-card :title="title" icon="⚡" :refreshable="false">
    <template #actions>
      <div class="rt-badge"><div class="rt-dot"></div>LIVE</div>
      <span style="font-size: 0.7rem; color: var(--text-muted); margin: 0 4px">{{ ptCount }}pts</span>
      <button type="button" class="widget-btn" :title="paused ? '다시 시작' : '일시정지'" :aria-label="paused ? '다시 시작' : '일시정지'" @click="paused = !paused">{{ paused ? "▶" : "⏸" }}</button>
      <button type="button" class="widget-btn" title="지우기" aria-label="지우기" @click="clearData">✕</button>
    </template>
    <div class="chart-wrap" :style="{ height: `${height}px` }"><canvas ref="canvasRef"></canvas></div>
    <div style="margin-top: 8px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px">
      <div class="rt-stat" style="background: var(--blue-dim)"><div class="rt-stat-label">현재값</div><div class="rt-stat-value" style="color: var(--blue)">{{ lastVal.toFixed(1) }}</div></div>
      <div class="rt-stat" style="background: var(--green-dim)"><div class="rt-stat-label">최대</div><div class="rt-stat-value" style="color: var(--green)">{{ maxVal.toFixed(1) }}</div></div>
      <div class="rt-stat" style="background: var(--purple-dim)"><div class="rt-stat-label">평균</div><div class="rt-stat-value" style="color: var(--purple)">{{ avgVal.toFixed(1) }}</div></div>
    </div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import type { Chart } from "chart.js";
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DV_PALETTE } from "~/conts/tenant/datavisual1";
import { dvAxis, dvLegend, useDvChart } from "~/layout/datavisual1/dvChart";

const props = withDefaults(defineProps<{ title?: string; maxPts?: number; interval?: number; height?: number }>(), {
  title: "실시간 시계열 산점도",
  maxPts: 60,
  interval: 1000,
  height: 240,
});

type Pt = { x: number; y: number };
const canvasRef = ref<HTMLCanvasElement | null>(null);
const paused = ref(false);
const ptCount = ref(0);
const lastVal = ref(0);
const maxVal = ref(0);
const avgVal = ref(0);
// 점 목록은 차트를 새로 그려도(테마 변경) 이어지도록 컴포넌트에 둔다
const signalA: Pt[] = [];
const signalB: Pt[] = [];
let allVals: number[] = [];
let t = 0;
let timer: ReturnType<typeof setInterval> | null = null;

/** 여러 주기를 섞은 신호 + 잡음 */
const nextA = (): Pt => ({ x: Date.now(), y: +(50 + 30 * Math.sin(t * 0.15) + 10 * Math.cos(t * 0.4) + (Math.random() - 0.5) * 14).toFixed(2) });
const nextB = (): Pt => ({ x: Date.now(), y: +(30 + 20 * Math.cos(t * 0.1) + 8 * Math.sin(t * 0.5) + (Math.random() - 0.5) * 10).toFixed(2) });

const { chart } = useDvChart(
  canvasRef,
  () => {
    const line = (label: string, color: string, data: Pt[]) => ({ label, data, backgroundColor: `${color}aa`, borderColor: color, pointRadius: 3, showLine: true, tension: 0.3, borderWidth: 1.5 });
    return {
      type: "scatter",
      data: { datasets: [line("신호 A", DV_PALETTE[0]!, signalA), line("신호 B", DV_PALETTE[2]!, signalB)] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: dvLegend() },
        scales: {
          x: dvAxis({ type: "time", time: { unit: "second", displayFormats: { second: "HH:mm:ss" } }, ticks: { ...dvAxis().ticks, font: { size: 9 }, maxRotation: 0, maxTicksLimit: 6 } }),
          y: dvAxis({ min: 0, max: 120 }),
        },
      },
    };
  },
  { delay: 100, onDraw: () => startTimer() },
);

function startTimer() {
  if (!timer) timer = setInterval(tick, props.interval);
}

function tick() {
  const c = chart() as Chart<"scatter", Pt[]> | null;
  if (!c || paused.value) return;
  t++;
  const a = nextA();
  signalA.push(a);
  signalB.push(nextB());
  while (signalA.length > props.maxPts) signalA.shift();
  while (signalB.length > props.maxPts) signalB.shift();
  allVals.push(a.y);
  if (allVals.length > 200) allVals.shift();
  lastVal.value = a.y;
  maxVal.value = Math.max(...signalA.map((d) => d.y));
  avgVal.value = allVals.reduce((s, v) => s + v, 0) / allVals.length;
  ptCount.value = signalA.length;
  c.update("none");
}

function clearData() {
  signalA.length = 0;
  signalB.length = 0;
  allVals = [];
  ptCount.value = 0;
  chart()?.update("none");
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  timer = null;
});
</script>
