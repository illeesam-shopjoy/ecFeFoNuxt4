<template>
  <!-- 블로그 상세 스켈레톤 -->
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — skeleton-* 커스텀 클래스를
       Tailwind로 대체. shimmer 애니메이션은 tailwind.config.ts의 animate-shimmer 재사용. -->
  <section class="blog__area pt-55">
    <xdev-file-path-badge file-path="app/components/ui/SkeletonBlogDetail.vue" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <div class="row">
        <div class="col-xl-9 col-lg-8">
          <!-- 제목 영역 -->
          <div class="mb-55">
            <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:70%;height:32px;margin-bottom:12px" />
            <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:40%;height:14px" />
          </div>
          <!-- 메인 이미지 -->
          <div class="w-full aspect-[16/9] rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] mb-40" />
          <!-- 본문 -->
          <div class="mb-40">
            <div
              v-for="n in 5"
              :key="n"
              class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]"
              :style="`width:${90 - n * 5}%;height:14px;margin-bottom:10px`"
            />
          </div>
        </div>
        <!-- 사이드바 -->
        <div class="col-xl-3 col-lg-4">
          <div class="w-full h-[160px] rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] mb-20" />
          <div class="w-full h-[160px] rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('스켈레톤 블로그');
</script>
