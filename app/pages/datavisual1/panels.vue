<template>
  <!-- 패널 보기 — 대시보드·분석·그리드·실시간 패널 탭. 원본 pages/Panels.js + 분석/그리드 패널(AnalyticsPanel·GridPanel 은 이 화면에서만 써서 여기에 합쳤다) -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 20px">
        <h1 class="section-title">🔲 패널 보기</h1>
        <p class="section-subtitle">다양한 레이아웃으로 위젯을 배치한 패널</p>
      </div>

      <div class="tab-bar" role="tablist">
        <button v-for="t in TABS" :key="t.id" type="button" role="tab" class="tab-btn" :class="{ active: activeTab === t.id }" :aria-selected="activeTab === t.id" @click="handleSelectAction('tab-select', t.id)">{{ t.label }}</button>
      </div>

      <dashboard-panel v-if="activeTab === 'dashboard'" />

      <!-- 분석 패널 -->
      <div v-else-if="activeTab === 'analytics'">
        <div class="grid-4 panel-row">
          <kpi-widget title="세션수" value="42,180" trend="+5.2%" dir="up" icon="📱" color="blue" />
          <kpi-widget title="이탈률" value="38.4%" trend="-3.1%" dir="down" icon="🚪" color="orange" />
          <kpi-widget title="페이지뷰" value="317K" trend="+18.9%" dir="up" icon="👁️" color="teal" />
          <kpi-widget title="체류시간" value="3분42초" trend="+0.5분" dir="up" icon="⏱️" color="purple" />
        </div>
        <div class="grid-2 panel-row">
          <stacked-bar-widget title="채널별 유입 추이 (월)" :height="230" />
          <radar-chart-widget title="지표 종합 비교" :height="230" />
        </div>
        <div class="grid-3 panel-row">
          <scatter-chart-widget title="사용자 분포 (산점도)" :height="220" />
          <bubble-chart-widget title="시장 포지셔닝" :height="220" />
          <heatmap-widget title="요일×시간대 히트맵" :rows="7" :cols="12" />
        </div>
        <div class="panel-row">
          <data-table-widget title="세부 지표" :rows="10" />
        </div>
      </div>

      <!-- 그리드 패널 — 배치 모양 고르기 -->
      <div v-else-if="activeTab === 'grid'">
        <div class="card" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 14px">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); align-self: center">레이아웃 선택:</span>
          <button v-for="opt in GRID_OPTS" :key="opt.id" type="button" class="btn-outline btn-sm" :class="{ 'is-on': gridLayout === opt.id }" @click="gridLayout = opt.id">{{ opt.label }}</button>
        </div>

        <div v-if="gridLayout === '2col'" class="grid-2 panel-row">
          <line-chart-widget title="방문자 추이" :height="220" />
          <bar-chart-widget title="채널별 매출" :height="220" />
          <area-chart-widget title="누적 수익" :height="220" />
          <radar-chart-widget title="성과 비교" :height="220" />
        </div>
        <div v-else-if="gridLayout === '3col'" class="grid-3 panel-row">
          <line-chart-widget title="라인" :height="200" />
          <bar-chart-widget title="바" :height="200" />
          <pie-chart-widget title="파이" :height="200" />
          <area-chart-widget title="에어리어" :height="200" />
          <radar-chart-widget title="레이더" :height="200" />
          <scatter-chart-widget title="산점도" :height="200" />
        </div>
        <div v-else-if="gridLayout === 'mixed'" class="panel-row">
          <div class="grid-4 panel-row">
            <kpi-widget title="방문자" value="128K" trend="+12%" dir="up" icon="👥" color="blue" />
            <kpi-widget title="전환율" value="4.8%" trend="+0.6%" dir="up" icon="🎯" color="green" />
            <kpi-widget title="매출" value="₩84M" trend="-2%" dir="down" icon="💰" color="orange" />
            <kpi-widget title="신규" value="3,241" trend="+8%" dir="up" icon="🔥" color="purple" />
          </div>
          <div class="grid-2-1 panel-row">
            <line-chart-widget title="메인 지표" :height="230" />
            <div style="display: flex; flex-direction: column; gap: 12px">
              <gauge-widget title="부하율" label="%" :height="140" />
              <pie-chart-widget title="분포" :donut="true" :height="140" />
            </div>
          </div>
          <div class="grid-3">
            <stacked-bar-widget title="스택 바" :height="200" />
            <bubble-chart-widget title="버블" :height="200" />
            <heatmap-widget title="히트맵" :rows="7" :cols="12" />
          </div>
        </div>
        <div v-else class="panel-row">
          <realtime-scatter-widget title="실시간 시계열 (풀)" :height="420" :max-pts="120" />
        </div>
      </div>

      <realtime-panel v-else />
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";
import DashboardPanel from "~/components/datavisual1/panels/DashboardPanel.vue";
import RealtimePanel from "~/components/datavisual1/panels/RealtimePanel.vue";
import KpiWidget from "~/components/datavisual1/widgets/KpiWidget.vue";
import LineChartWidget from "~/components/datavisual1/widgets/LineChartWidget.vue";
import BarChartWidget from "~/components/datavisual1/widgets/BarChartWidget.vue";
import AreaChartWidget from "~/components/datavisual1/widgets/AreaChartWidget.vue";
import PieChartWidget from "~/components/datavisual1/widgets/PieChartWidget.vue";
import RadarChartWidget from "~/components/datavisual1/widgets/RadarChartWidget.vue";
import ScatterChartWidget from "~/components/datavisual1/widgets/ScatterChartWidget.vue";
import BubbleChartWidget from "~/components/datavisual1/widgets/BubbleChartWidget.vue";
import StackedBarWidget from "~/components/datavisual1/widgets/StackedBarWidget.vue";
import HeatmapWidget from "~/components/datavisual1/widgets/HeatmapWidget.vue";
import GaugeWidget from "~/components/datavisual1/widgets/GaugeWidget.vue";
import DataTableWidget from "~/components/datavisual1/widgets/DataTableWidget.vue";
import RealtimeScatterWidget from "~/components/datavisual1/widgets/RealtimeScatterWidget.vue";

useHead({ title: "패널 보기" });
const route = useRoute();

const TABS = [
  { id: "dashboard", label: "📊 대시보드 패널" },
  { id: "analytics", label: "🔍 분석 패널" },
  { id: "grid", label: "🔲 그리드 패널" },
  { id: "realtime", label: "⚡ 실시간 패널" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const GRID_OPTS = [
  { id: "2col", label: "2컬럼" },
  { id: "3col", label: "3컬럼" },
  { id: "mixed", label: "혼합" },
  { id: "single", label: "실시간 단일" },
];

/** 탭은 주소(?tab=)에 남겨 새로고침·뒤로가기에도 유지 */
const activeTab = ref<TabId>(TABS.some((t) => t.id === route.query.tab) ? (route.query.tab as TabId) : "dashboard");
const gridLayout = ref("mixed");

/* handleSelectAction — 선택 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = (cmd: string, id: TabId) => {
  if (cmd === "tab-select") {
    activeTab.value = id;
    return navigateTo({ query: id === "dashboard" ? {} : { tab: id } }, { replace: true });
  }
  console.warn("[handleSelectAction] 알 수 없는 명령:", cmd);
};
</script>
