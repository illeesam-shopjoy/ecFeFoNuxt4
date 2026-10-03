<template>
  <!-- 실시간 패널 — 3초마다 바뀌는 KPI 4 + 실시간 시계열(1초) 3개 + 서버 게이지 4. 실시간 화면·패널 보기 화면이 같이 쓴다 -->
  <div>
    <div class="grid-4 panel-row">
      <kpi-widget title="동시 접속자" :value="activeUsers.toLocaleString()" trend="실시간" dir="up" icon="👥" color="blue" />
      <kpi-widget title="초당 요청" :value="`${rps}req/s`" trend="실시간" dir="up" icon="⚡" color="green" />
      <kpi-widget title="오류율" :value="`${errorRate}%`" :dir="errorRate > 2 ? 'down' : 'up'" :trend="errorRate > 2 ? '주의' : '정상'" icon="🔴" color="orange" />
      <kpi-widget title="응답시간" :value="`${respTime}ms`" :dir="respTime > 500 ? 'down' : 'up'" trend="실시간" icon="⏱️" color="purple" />
    </div>
    <div class="panel-row">
      <realtime-scatter-widget title="실시간 시계열 산점도 (1초 간격)" :height="280" :max-pts="90" :interval="1000" />
    </div>
    <div class="grid-2 panel-row">
      <realtime-scatter-widget title="채널 A 신호" :height="200" :max-pts="60" :interval="1000" />
      <realtime-scatter-widget title="채널 B 신호" :height="200" :max-pts="60" :interval="1500" />
    </div>
    <div class="grid-4 panel-row">
      <gauge-widget title="CPU 사용률" label="%" :height="180" />
      <gauge-widget title="메모리" label="%" :height="180" />
      <gauge-widget title="디스크 I/O" label="%" :height="180" />
      <gauge-widget title="네트워크" label="Mbps" :height="180" />
    </div>
  </div>
</template>

<script setup lang="ts">
import KpiWidget from "~/components/datavisual1/widgets/KpiWidget.vue";
import RealtimeScatterWidget from "~/components/datavisual1/widgets/RealtimeScatterWidget.vue";
import GaugeWidget from "~/components/datavisual1/widgets/GaugeWidget.vue";
import { DvData } from "~/conts/tenant/datavisual1";

const activeUsers = ref(0);
const rps = ref(0);
const errorRate = ref(0);
const respTime = ref(0);

function refresh() {
  activeUsers.value = DvData.rand(800, 2400);
  rps.value = DvData.rand(120, 980);
  errorRate.value = DvData.randFloat(0.1, 4.5);
  respTime.value = DvData.rand(80, 620);
}

refresh();
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => (timer = setInterval(refresh, 3000)));
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
