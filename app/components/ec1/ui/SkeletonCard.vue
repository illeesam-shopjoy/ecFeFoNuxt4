<template>
  <!-- 상품 카드 목록용 스켈레톤 -->
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — skeleton-* 커스텀 클래스를
       Tailwind로 대체. shimmer 애니메이션은 tailwind.config.ts의 animate-shimmer 재사용. -->
  <div class="flex flex-col gap-3 mb-60">
    <xdev-file-path-badge file-path="app/components/ui/SkeletonCard.vue" :absolute="true" />
    <!-- 이미지 영역 -->
    <div class="w-full aspect-[3/4] rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" />
    <!-- 텍스트 영역 -->
    <div class="px-1">
      <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width: 70%; height: 14px; margin-bottom: 8px;" />
      <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width: 40%; height: 14px;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('스켈레톤 카드');
</script>
