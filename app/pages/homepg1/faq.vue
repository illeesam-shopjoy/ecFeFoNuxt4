<template>
  <!-- FAQ — 자주 묻는 질문 펼침 목록 + 1:1 문의 바로가기. 원본 pages/Faq.js -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 32px">
        <div class="hp-pill hp-pill--purple">FAQ</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px">자주 묻는 <span class="gradient-text">질문</span></h1>
        <p class="section-subtitle">{{ HP_SITE.name }} 서비스에 대해 자주 문의하시는 내용을 정리했습니다.</p>
      </div>
      <div class="card card--static" style="padding: 8px 28px; margin-bottom: 24px">
        <div v-for="(faq, idx) in HP_FAQS" :key="idx" class="faq-item">
          <button type="button" class="faq-question" :aria-expanded="openFaq === idx" @click="openFaq = openFaq === idx ? null : idx">
            <span style="flex: 1">{{ faq.q }}</span>
            <span class="chevron" :class="{ open: openFaq === idx }">▼</span>
          </button>
          <div v-show="openFaq === idx" class="faq-answer">{{ faq.a }}</div>
        </div>
      </div>
      <div style="text-align: center; padding: 24px 0">
        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 16px">원하시는 답변을 찾지 못하셨나요?</p>
        <nuxt-link to="/contact" class="btn-blue">1:1 문의하기</nuxt-link>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_FAQS, HP_SITE } from "~/conts/tenant/homepg1";

useHead({ title: "FAQ" });
const openFaq = ref<number | null>(null);
</script>
