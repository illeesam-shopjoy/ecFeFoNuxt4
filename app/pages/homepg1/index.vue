<template>
  <!-- 홈 — 히어로·실적 숫자·주요 제품(솔루션 4)·추천 상품(3)·상담 배너. 원본 pages/Home.js -->
  <layout>

    <section class="hero-section" style="padding: 72px 32px 64px; z-index: 1">
      <div style="max-width: 700px; margin: 0 auto; text-align: center; position: relative">
        <div class="hero-badge"><span>🚀</span><span>소프트웨어 개발 &amp; 솔루션 전문기업</span></div>
        <h1 style="font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 900; line-height: 1.15; margin-bottom: 20px">
          <span class="gradient-text">디지털 혁신</span>을<br />함께 만들어갑니다
        </h1>
        <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.75; margin: 0 auto 36px; max-width: 520px">
          AI, ERP, 클라우드, 모바일 앱 개발까지 — 기업의 디지털 전환을 위한 최적의 솔루션을 제공합니다.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap">
          <nuxt-link to="/solution" class="btn-blue" style="padding: 13px 30px; font-size: 0.95rem">솔루션 보기 →</nuxt-link>
          <nuxt-link to="/contact" class="btn-outline" style="padding: 13px 30px; font-size: 0.95rem">무료 상담 신청</nuxt-link>
        </div>
      </div>
    </section>

    <!-- 실적 -->
    <div style="padding: 0 32px; margin: -28px auto 0; max-width: 900px; position: relative; z-index: 2">
      <div class="grid-4">
        <div v-for="(s, i) in STATS" :key="s.label" class="stat-card fade-up" :style="{ animationDelay: `${i * 0.1}s` }">
          <div class="stat-number gradient-text">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- 주요 제품(솔루션) -->
    <div class="page-wrap" style="margin-top: 48px">
      <div class="section-head">
        <div>
          <h2 class="section-title">주요 제품</h2>
          <p class="section-subtitle">기업 디지털 전환을 위한 핵심 제품</p>
        </div>
        <nuxt-link to="/solution" class="btn-outline btn-sm">전체 보기 →</nuxt-link>
      </div>
      <div class="grid-2" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))">
        <div v-for="s in HP_SOLUTIONS.slice(0, 4)" :key="s.solutionId" class="solution-card">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px">
            <span style="font-size: 2rem">{{ s.emoji }}</span>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary)">{{ s.solutionName }}</div>
              <span v-if="s.badge === 'NEW'" class="badge badge-new">NEW</span>
              <span v-else-if="s.badge === '인기'" class="badge badge-hot">인기</span>
            </div>
          </div>
          <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 14px">{{ s.desc }}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 5px">
            <span v-for="t in s.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 추천 상품 -->
    <div class="page-wrap" style="padding-top: 0; margin-top: 8px">
      <div class="section-head">
        <div>
          <h2 class="section-title">추천 상품</h2>
          <p class="section-subtitle">바로 도입 가능한 SaaS 솔루션</p>
        </div>
        <nuxt-link to="/products" class="btn-outline btn-sm">전체 상품 →</nuxt-link>
      </div>
      <div class="grid-3">
        <div v-for="p in featured" :key="p.productId" class="product-card" style="padding: 24px">
          <div style="font-size: 2.4rem; margin-bottom: 12px">{{ p.emoji }}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap">
            <span style="font-weight: 700; color: var(--text-primary)">{{ p.productName }}</span>
            <span class="badge badge-cat">{{ hpCategoryLabel(p) }}</span>
          </div>
          <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px">{{ p.desc }}</p>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--blue); margin-bottom: 14px">{{ p.price }}</div>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <div style="display: flex; gap: 8px">
              <nuxt-link :to="`/products/${p.productId}`" class="btn-blue btn-sm">상세보기</nuxt-link>
              <button type="button" class="btn-outline btn-sm" @click="handleBtnAction('product-demo', p)">데모 보기</button>
            </div>
            <nuxt-link :to="`/order?pid=${p.productId}`" class="btn-blue btn-sm" style="width: 100%">주문하기</nuxt-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 상담 배너 -->
    <div class="page-wrap" style="padding-top: 0; margin-top: 8px; padding-bottom: 60px">
      <div style="background: linear-gradient(135deg, var(--blue-dim), var(--green-dim)); border: 1px solid var(--border); border-radius: 20px; padding: 48px 40px; text-align: center">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin-bottom: 12px">지금 바로 시작하세요</h2>
        <p style="color: var(--text-secondary); margin-bottom: 28px; font-size: 0.9rem">무료 상담을 통해 최적의 솔루션을 찾아드립니다.</p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap">
          <nuxt-link to="/contact" class="btn-blue">무료 상담 신청</nuxt-link>
          <nuxt-link to="/products" class="btn-outline">상품 목록 보기</nuxt-link>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_FEATURED_IDS, HP_SOLUTIONS, hpCategoryLabel, hpProductById, type HpProduct } from "~/conts/tenant/homepg1";
import { useHpDemo } from "~/layout/homepg1/hpUi";

useHead({ title: "소프트웨어 개발 & 솔루션" });
const openDemo = useHpDemo();

const STATS = [
  { value: "20+", label: "완료 프로젝트" },
  { value: "98%", label: "고객 만족도" },
  { value: "30+", label: "구축사이트" },
  { value: "24h", label: "응답 시간" },
];
const featured = HP_FEATURED_IDS.map((id) => hpProductById(id)).filter((p): p is HpProduct => !!p);

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string, p?: HpProduct) => {
  if (cmd === "product-demo" && p) return openDemo(p);
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
