/**
 * dvChart — datavisual1 차트 공통(Chart.js 4 + 시간축 date-fns 어댑터). 원본은 CDN 전역 window.Chart 를 썼다.
 * 이 파일은 datavisual1 위젯만 import 하므로 chart.js 는 이 모듈 빌드에만 들어간다.
 */
import { Chart, registerables, type ChartConfiguration } from "chart.js";
import "chartjs-adapter-date-fns";
import { onBeforeUnmount, onMounted, watch, type Ref } from "vue";
import { useDvTheme } from "~/layout/datavisual1/dvUi";

Chart.register(...registerables);

// 차트 종류마다 옵션 모양이 달라 위젯이 만든 설정을 그대로 넘긴다
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DvChartConfig = ChartConfiguration<any, any, any>;

/** 테마 CSS 변수의 실제 색 */
export function cssVar(name: string, fallback = "#8090b0"): string {
  if (!import.meta.client) return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * 축·범례·격자 색 — 캔버스는 CSS 변수를 못 읽으므로 지금 테마의 실제 색으로 바꿔 넘긴다.
 * (원본은 'var(--text-muted)' 문자열을 그대로 넘겨 캔버스가 기본 회색으로 그렸고, 테마를 바꿔도 차트 색이 그대로였다)
 */
export function dvColors() {
  return { text: cssVar("--text-secondary"), muted: cssVar("--text-muted"), grid: cssVar("--border", "rgba(128,128,128,0.15)"), track: cssVar("--track", "rgba(0,0,0,0.06)") };
}
export function dvLegend(position: "top" | "right" | "bottom" = "top", size = 11) {
  return { position, labels: { color: dvColors().text, boxWidth: position === "right" ? 10 : 12, font: { size } } };
}
export function dvAxis(extra: Record<string, unknown> = {}, size = 10) {
  const c = dvColors();
  return { ticks: { color: c.muted, font: { size } }, grid: { color: c.grid }, ...extra };
}

/**
 * useDvChart — canvas 에 차트를 그린다. 마운트 후 delay(ms) 뒤(카드 크기가 잡힌 다음, 원본과 같은 50ms), 테마가 바뀌면 색을 다시 읽어 새로 그리고, 화면을 떠나면 지운다.
 * refresh() 는 데이터를 새로 만들어 다시 그린다(위젯의 ↻ 버튼).
 */
export function useDvChart(canvas: Ref<HTMLCanvasElement | null>, build: () => DvChartConfig, opt: { delay?: number; onDraw?: (c: Chart) => void } = {}) {
  let chart: Chart | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const theme = useDvTheme();

  function draw() {
    if (!canvas.value) return;
    chart?.destroy();
    chart = new Chart(canvas.value, build());
    opt.onDraw?.(chart);
  }
  onMounted(() => {
    timer = setTimeout(draw, opt.delay ?? 50);
  });
  watch(theme, () => {
    if (chart) draw();
  });
  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer);
    chart?.destroy();
    chart = null;
  });
  return { refresh: draw, chart: () => chart };
}
