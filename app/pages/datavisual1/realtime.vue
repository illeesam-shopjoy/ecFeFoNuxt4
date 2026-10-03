<template>
  <!-- 실시간 패널 화면 — 1초 간격 시계열 산점도와 실시간 지표. 원본 pages/Realtime.js -->
  <layout>
    <div class="page-wrap">
      <div class="page-head">
        <div>
          <h1 class="section-title">⚡ 실시간 패널</h1>
          <p class="section-subtitle">1초 간격 시계열 산점도 및 실시간 지표</p>
        </div>
        <div class="rt-badge" style="font-size: 0.82rem; padding: 5px 12px"><div class="rt-dot"></div>실시간 모니터링 중</div>
      </div>
      <realtime-panel />
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";
import RealtimePanel from "~/components/datavisual1/panels/RealtimePanel.vue";

useHead({ title: "실시간" });
</script>
