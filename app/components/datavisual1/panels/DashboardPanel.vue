<template>
  <!-- 대시보드 패널 — KPI 4 + 방문자 추이/트래픽 출처 + 채널별 매출/누적 수익 + 게이지 2/상품 현황. 대시보드 화면·패널 보기 화면이 같이 쓴다 -->
  <div>
    <div class="grid-4 panel-row">
      <kpi-widget title="총 방문자" value="128,450" trend="+12.4%" dir="up" icon="👥" color="blue" />
      <kpi-widget title="전환율" value="4.8%" trend="+0.6%" dir="up" icon="🎯" color="green" />
      <kpi-widget title="매출" value="₩84.2M" trend="-2.1%" dir="down" icon="💰" color="orange" />
      <kpi-widget title="활성 사용자" value="3,241" trend="+8.7%" dir="up" icon="🔥" color="purple" />
    </div>
    <div class="grid-2-1 panel-row">
      <line-chart-widget title="월별 방문자 추이" :height="230" />
      <pie-chart-widget title="트래픽 출처" :donut="true" :height="230" />
    </div>
    <div class="grid-2 panel-row">
      <bar-chart-widget title="채널별 매출" :height="210" />
      <area-chart-widget title="누적 수익 추이" :height="210" />
    </div>
    <div class="grid-1-2 panel-row">
      <div style="display: flex; flex-direction: column; gap: 16px">
        <gauge-widget title="서버 부하율" label="%" :height="160" />
        <gauge-widget title="목표 달성률" label="%" :height="160" />
      </div>
      <data-table-widget title="상품별 현황" :rows="8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import KpiWidget from "~/components/datavisual1/widgets/KpiWidget.vue";
import LineChartWidget from "~/components/datavisual1/widgets/LineChartWidget.vue";
import PieChartWidget from "~/components/datavisual1/widgets/PieChartWidget.vue";
import BarChartWidget from "~/components/datavisual1/widgets/BarChartWidget.vue";
import AreaChartWidget from "~/components/datavisual1/widgets/AreaChartWidget.vue";
import GaugeWidget from "~/components/datavisual1/widgets/GaugeWidget.vue";
import DataTableWidget from "~/components/datavisual1/widgets/DataTableWidget.vue";
</script>
