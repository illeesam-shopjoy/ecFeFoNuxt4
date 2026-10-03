<template>
  <!-- 차트 갤러리 — 지원하는 차트 유형 전부(통계·차트·데이터·실시간 탭). 원본 pages/Gallery.js -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 24px">
        <h1 class="section-title">📈 차트 갤러리</h1>
        <p class="section-subtitle">지원하는 모든 차트 유형 한눈에 보기</p>
      </div>

      <div class="tab-bar" role="tablist">
        <button v-for="cat in CATS" :key="cat" type="button" role="tab" class="tab-btn" :class="{ active: activeCat === cat }" :aria-selected="activeCat === cat" @click="activeCat = cat">{{ cat }}</button>
      </div>

      <div v-if="show('통계')" class="panel-section">
        <div class="panel-title">📊 통계 카드</div>
        <div class="grid-4">
          <kpi-widget title="총 방문자" value="128,450" trend="+12.4%" dir="up" icon="👥" color="blue" />
          <kpi-widget title="전환율" value="4.8%" trend="+0.6%" dir="up" icon="🎯" color="green" />
          <kpi-widget title="매출" value="₩84.2M" trend="-2.1%" dir="down" icon="💰" color="orange" />
          <kpi-widget title="활성 사용자" value="3,241" trend="+8.7%" dir="up" icon="🔥" color="purple" />
        </div>
      </div>

      <template v-if="show('차트')">
        <div class="panel-section">
          <div class="panel-title">📈 기본 차트</div>
          <div class="grid-3">
            <line-chart-widget title="라인 차트" :height="200" />
            <bar-chart-widget title="바 차트" :height="200" />
            <area-chart-widget title="에어리어 차트" :height="200" />
          </div>
        </div>
        <div class="panel-section">
          <div class="panel-title">🥧 원형 / 분포 차트</div>
          <div class="grid-3">
            <pie-chart-widget title="파이 차트" :height="220" />
            <pie-chart-widget title="도넛 차트" :height="220" :donut="true" />
            <radar-chart-widget title="레이더 차트" :height="220" />
          </div>
        </div>
        <div class="panel-section">
          <div class="panel-title">✨ 고급 차트</div>
          <div class="grid-3">
            <scatter-chart-widget title="산점도 차트" :height="220" />
            <bubble-chart-widget title="버블 차트" :height="220" />
            <stacked-bar-widget title="스택 바 차트" :height="220" />
          </div>
          <div class="grid-3" style="margin-top: 16px">
            <stacked-bar-widget title="수평 바 차트" :height="220" :horizontal="true" />
            <heatmap-widget title="히트맵 (주간)" :rows="7" :cols="12" />
            <gauge-widget title="게이지 A" label="%" :height="180" />
          </div>
        </div>
      </template>

      <div v-if="show('데이터')" class="panel-section">
        <div class="panel-title">📋 데이터 보기</div>
        <data-table-widget title="데이터 테이블" :rows="12" />
      </div>

      <div v-if="show('실시간')" class="panel-section">
        <div class="panel-title">⚡ 실시간 시계열</div>
        <realtime-scatter-widget title="실시간 시계열 산점도 (1초 간격)" :height="280" :max-pts="90" />
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";
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

useHead({ title: "차트 갤러리" });
const CATS = ["전체", "통계", "차트", "데이터", "실시간"] as const;
const activeCat = ref<(typeof CATS)[number]>("전체");
const show = (cat: string) => activeCat.value === "전체" || activeCat.value === cat;
</script>
