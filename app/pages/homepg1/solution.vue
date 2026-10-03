<template>
  <!-- 솔루션 안내 — 6가지 솔루션 카드, "도입 문의"는 고객센터로 관심 서비스를 골라 둔 채 이동. 원본 pages/Solution.js -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 32px">
        <div class="hp-pill hp-pill--green">솔루션 안내</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px">비즈니스를 위한<br /><span class="gradient-text">스마트 솔루션</span></h1>
        <p class="section-subtitle">{{ HP_SOLUTIONS.length }}가지 핵심 솔루션으로 기업의 모든 디지털 니즈를 충족합니다.</p>
      </div>
      <div class="grid-3">
        <div v-for="s in HP_SOLUTIONS" :key="s.solutionId" class="solution-card">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px">
            <span style="font-size: 2.4rem">{{ s.emoji }}</span>
            <span v-if="s.badge === 'NEW'" class="badge badge-new">NEW</span>
            <span v-else-if="s.badge === '인기'" class="badge badge-hot">인기</span>
          </div>
          <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px">{{ s.solutionName }}</div>
          <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 16px">{{ s.desc }}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px">
            <span v-for="t in s.tags" :key="t" class="tag">{{ t }}</span>
          </div>
          <nuxt-link :to="{ path: '/contact', query: { service: serviceOf(s.solutionName) } }" class="btn-outline btn-sm">도입 문의 →</nuxt-link>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_CONTACT_SERVICES, HP_SOLUTIONS } from "~/conts/tenant/homepg1";

useHead({ title: "솔루션 안내" });

/** 솔루션 이름 → 고객센터 "관심 서비스" 값(같은 이름이 있으면 그것, 비슷하면 그것, 없으면 기타) */
function serviceOf(name: string): string {
  const head = name.split(" ")[0] ?? name;
  return HP_CONTACT_SERVICES.find((c) => c === name) ?? HP_CONTACT_SERVICES.find((c) => c.startsWith(head)) ?? "기타·복합 문의";
}
</script>
