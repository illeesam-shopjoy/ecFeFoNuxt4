<template>
  <!-- 블로그 목록 — 기술 인사이트 글 카드. 원본 pages/Blog.js (글은 app/conts/tenant/homepg1.ts 의 HP_BLOG_POSTS) -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 32px">
        <div class="hp-pill hp-pill--blue">블로그</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px">기술 인사이트 &amp; <span class="gradient-text">최신 트렌드</span></h1>
        <p class="section-subtitle">소프트웨어 개발, 클라우드, AI에 대한 전문 지식을 나눕니다.</p>
      </div>
      <div class="grid-3">
        <nuxt-link v-for="post in HP_BLOG_POSTS" :key="post.no" :to="`/blog/${post.no}`" class="blog-card">
          <div class="blog-thumb">{{ post.emoji }}</div>
          <div style="padding: 20px">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px">
              <span class="badge badge-cat" style="font-size: 0.65rem">{{ post.cat }}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted)">{{ post.date }}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted)">· {{ post.read }}</span>
            </div>
            <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; line-height: 1.4">{{ post.title }}</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.65">{{ post.summary }}</p>
          </div>
        </nuxt-link>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_BLOG_POSTS } from "~/conts/tenant/homepg1";

useHead({ title: "블로그" });
</script>
