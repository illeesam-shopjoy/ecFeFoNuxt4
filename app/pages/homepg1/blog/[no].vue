<template>
  <!-- 블로그 상세 — 주소 /blog/:글번호. 원본 Blog.js 의 blogDetail 화면(요약 본문) + 이전/다음 글·상담 안내 -->
  <layout>
    <div v-if="post" class="page-wrap">
      <nuxt-link to="/blog" class="hp-back" style="font-size: 0.95rem; margin-bottom: 18px">← 블로그로</nuxt-link>
      <div style="margin-bottom: 28px">
        <div style="font-size: 2rem; line-height: 1; margin-bottom: 10px">{{ post.emoji }}</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px">{{ post.title }}</h1>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
          <span class="badge badge-cat" style="font-size: 0.75rem">{{ post.cat }}</span>
          <span style="color: var(--text-muted); font-size: 0.8rem">{{ post.date }} · {{ post.read }}</span>
        </div>
      </div>
      <div class="card card--static" style="padding: 28px; white-space: pre-line; line-height: 1.8; color: var(--text-secondary); font-size: 0.92rem">{{ post.summary }}</div>

      <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; flex-wrap: wrap">
        <nuxt-link v-if="prev" :to="`/blog/${prev.no}`" class="btn-outline btn-sm">← {{ prev.title }}</nuxt-link>
        <span v-else></span>
        <nuxt-link v-if="next" :to="`/blog/${next.no}`" class="btn-outline btn-sm">{{ next.title }} →</nuxt-link>
      </div>

      <div style="margin-top: 36px; padding: 28px; border-radius: 16px; text-align: center; background: linear-gradient(135deg, var(--blue-dim), var(--green-dim)); border: 1px solid var(--border)">
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px">글과 관련해 도입을 고민 중이신가요?</p>
        <nuxt-link to="/contact" class="btn-blue">무료 상담 신청</nuxt-link>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_BLOG_POSTS } from "~/conts/tenant/homepg1";

const route = useRoute();
const idx = computed(() => HP_BLOG_POSTS.findIndex((p) => p.no === Number(route.params.no)));
const post = computed(() => HP_BLOG_POSTS[idx.value]);
if (!post.value) showError({ statusCode: 404, statusMessage: "글을 찾을 수 없습니다" });
const prev = computed(() => (idx.value > 0 ? HP_BLOG_POSTS[idx.value - 1] : undefined));
const next = computed(() => (idx.value >= 0 && idx.value < HP_BLOG_POSTS.length - 1 ? HP_BLOG_POSTS[idx.value + 1] : undefined));
useHead({ title: () => post.value?.title ?? "블로그" });
</script>
