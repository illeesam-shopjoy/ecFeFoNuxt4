<template>
  <!-- 2026-09-13(요청사항: "상단에 배너가 있으면 안되고 최소한의 Top만 보여야해") — compact일 때는
       큰 배경이미지/제목 없이 얇은 브레드크럼 줄만 보여준다(쇼핑 목록 페이지 등 데모처럼).
       py-24까지 키웠다가 "무의미한 공간"으로 다시 지적받아 py-15로 되돌림 — 진짜
       문제는 여백 크기가 아니라 아무 콘텐츠 없는 빈 줄 자체였다. -->
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — page__title-compact/breadcrumb-item
       커스텀 클래스를 Tailwind로 대체. "/" 구분자는 li가 정확히 2개뿐이라 두 번째 li에
       before:content-['/']를 직접 부여(형제선택자 대체). -->
  <section v-if="compact" class="page__title-compact py-15 border-b border-[#eee]">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <nav aria-label="브레드크럼">
        <ol class="flex gap-2 list-none m-0 p-0 text-[0.85rem] text-[#888]">
          <li class="breadcrumb-item"><nuxt-link href="/">홈</nuxt-link></li>
          <li v-if="parentTitle" class="breadcrumb-item before:content-['/'] before:mr-2 before:text-[#ccc]"><nuxt-link :href="parentLink || '#'">{{ parentTitle }}</nuxt-link></li>
          <li class="breadcrumb-item text-[#201f1f] before:content-['/'] before:mr-2 before:text-[#ccc]" aria-current="page">{{ subtitle }}</li>
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
            <!-- headingTag="div": 상세 화면은 글/상품 제목이 페이지의 유일한 <h1> 이어야 해서(SEO) 배너 제목은 h1 을 쓰지 않는다. 모양은 h1 과 동일하게 유지 -->
            <component :is="headingTag" :class="headingTag === 'h1' ? '' : 'text-[36px] font-medium leading-[1.2] text-[#323232] mb-[25px] capitalize'">{{ title }}</component>
            <div class="page__title-breadcrumb">
              <nav aria-label="브레드크럼">
                <ol class="breadcrumb justify-center">
                  <li class="breadcrumb-item"><nuxt-link href="/">홈</nuxt-link></li>
                  <li v-if="parentTitle" class="breadcrumb-item"><nuxt-link :href="parentLink || '#'">{{ parentTitle }}</nuxt-link></li>
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
import { CDN_URL } from "~/conts/baseConst";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('브레드크럼');
const bg = `${CDN_URL}/cdn/prod/img/page-title/page-title-1.jpg`;

withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    compact?: boolean;
    /** 2026-09-20: 중간 단계(예: 홈 / 상품 목록 / 상품 상세) — 상세 화면에서 목록으로 돌아가는 링크 */
    parentTitle?: string;
    parentLink?: string;
    headingTag?: "h1" | "div";
  }>(),
  { compact: false, headingTag: "h1" }
);
</script>

