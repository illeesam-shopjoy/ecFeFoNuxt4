<template>
  <!-- 대시보드 — 기간 선택·레이아웃 편집/위젯 관리 바로가기 + 대시보드 패널. 원본 pages/Dashboard.js -->
  <layout>
    <div class="page-wrap">
      <div class="page-head">
        <div>
          <h1 class="section-title">📊 대시보드</h1>
          <p class="section-subtitle">실시간 비즈니스 지표 한눈에 보기 · {{ PERIODS.find((p) => p.value === period)?.label }}</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
          <select v-model="period" class="form-input" style="width: 120px" aria-label="기간">
            <option v-for="p in PERIODS" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
          <nuxt-link to="/layout" class="btn-outline btn-sm">🖱️ 레이아웃 편집</nuxt-link>
          <nuxt-link to="/manager" class="btn-outline btn-sm">🧩 위젯 관리</nuxt-link>
        </div>
      </div>
      <!-- 기간을 바꾸면 패널을 새로 그린다(예시 데이터라 값만 새로 뽑힌다) -->
      <dashboard-panel :key="period" />
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";
import DashboardPanel from "~/components/datavisual1/panels/DashboardPanel.vue";

useHead({ title: "대시보드" });
const PERIODS = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "90d", label: "최근 90일" },
  { value: "1y", label: "올해" },
];
const period = ref("30d");
</script>
