<template>
  <!-- 상품 상세 페이지 스켈레톤 -->
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — skeleton-* 커스텀 클래스를
       Tailwind로 대체. shimmer 애니메이션은 tailwind.config.ts의 animate-shimmer 재사용
       (AppImage/Skeleton*.vue 4곳이 공유하던 중복 정의 제거). -->
  <section class="shop__area pb-65">
    <xdev-file-path-badge file-path="app/components/ui/SkeletonProductDetail.vue" :absolute="true" />
    <div class="shop__top pt-100 pb-90 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <!-- 이미지 갤러리 영역 -->
          <div class="col-xl-6 col-lg-6">
            <div class="grid grid-cols-[auto_1fr] gap-4 items-start">
              <!-- 썸네일 목록 -->
              <div class="flex flex-col gap-2">
                <div v-for="n in 3" :key="n" class="w-[95px] h-[120px] rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" />
              </div>
              <!-- 메인 이미지 -->
              <div class="w-full aspect-[3/4] rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" />
            </div>
          </div>
          <!-- 상품 정보 영역 -->
          <div class="col-xl-6 col-lg-6">
            <div class="py-2 flex flex-col">
              <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:60%;height:28px;margin-bottom:16px" />
              <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:40%;height:20px;margin-bottom:12px" />
              <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:80%;height:14px;margin-bottom:8px" />
              <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:75%;height:14px;margin-bottom:8px" />
              <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:55%;height:14px;margin-bottom:24px" />
              <div class="rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" style="width:30%;height:44px;border-radius:4px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('스켈레톤 상품 상세');
</script>

