<template>
  <!-- 2026-09-13(요청사항: "상단에 배너가 있으면 안되고 최소한의 Top만 보여야해") — compact일 때는
       큰 배경이미지/제목 없이 얇은 브레드크럼 줄만 보여준다(쇼핑 목록 페이지 등 데모처럼).
       py-24까지 키웠다가 "무의미한 공간"으로 다시 지적받아 py-15로 되돌림 — 진짜
       문제는 여백 크기가 아니라 아무 콘텐츠 없는 빈 줄 자체였다. -->
  <section v-if="compact" class="page__title-compact py-15">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <nav aria-label="브레드크럼">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><nuxt-link href="/">홈</nuxt-link></li>
          <li class="breadcrumb-item active" aria-current="page">{{ subtitle }}</li>
        </ol>
      </nav>
    </div>
  </section>
  <section v-else class="page__title relative flex items-center" :style="{ backgroundImage: `url(${bg})` }">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <div class="row">
        <div class="col-xl-12">
          <div class="page__title-inner text-center">
            <h1>{{ title }}</h1>
            <div class="page__title-breadcrumb">
              <nav aria-label="브레드크럼">
                <ol class="breadcrumb justify-center">
                  <li class="breadcrumb-item"><nuxt-link href="/">홈</nuxt-link></li>
                  <li class="breadcrumb-item active" aria-current="page">{{ subtitle }}</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('브레드크럼');
const bg = "/cdn/img/page-title/page-title-1.jpg";

withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    compact?: boolean;
  }>(),
  { compact: false }
);
</script>

<style scoped>
.page__title-compact {
  border-bottom: 1px solid #eee;
}
.page__title-compact .breadcrumb {
  display: flex;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.85rem;
  color: #888;
}
.page__title-compact .breadcrumb-item + .breadcrumb-item::before {
  content: "/";
  margin-right: 8px;
  color: #ccc;
}
.page__title-compact .breadcrumb-item.active {
  color: #201f1f;
}
</style>
