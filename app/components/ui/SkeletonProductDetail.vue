<template>
  <!-- 상품 상세 페이지 스켈레톤 -->
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — skeleton-* 커스텀 클래스를
       Tailwind로 대체. shimmer 애니메이션은 tailwind.config.ts의 animate-shimmer 재사용
       (AppImage/Skeleton*.vue 4곳이 공유하던 중복 정의 제거). -->
  <!-- 2026-09-22(요청사항: "Skeleton UI 가 실제 표시되는 이미지와 맞지 않아 — 상단에 큰 이미지, 하단에 썸네일 목록란처럼 보여야 해") —
       예전엔 좌측에 세로 썸네일 3개 + 우측에 큰 이미지(grid-cols-[auto_1fr]) 였는데, 실제 ProdGallery.vue는 위에 큰 이미지 하나,
       그 아래 가로로 늘어선 작은 썸네일 줄이다. 순서·배치를 실제와 맞췄다. pt-100/pb-90 도 실제 페이지(prod-dtl/[id].vue
       shop__top)가 쓰는 pt-16(폰)/md:pt-60, pb-60 으로 맞춰서 로딩→실제 전환 시 배너 아래 여백이 갑자기 바뀌지 않게 했다. -->
  <section class="shop__area pb-65">
    <xdev-file-path-badge file-path="app/components/ui/SkeletonProductDetail.vue" :absolute="true" />
    <div class="shop__top pt-[16px] pb-60 md:pt-[60px] bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <!-- 이미지 갤러리 영역 — 큰 이미지(위) + 가로 썸네일 줄(아래) -->
          <div class="col-xl-6 col-lg-6">
            <div class="flex flex-col gap-2.5">
              <!-- 메인 이미지 -->
              <div class="w-full aspect-[3/4] rounded-xl animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" />
              <!-- 썸네일 줄 -->
              <div class="flex flex-row gap-2">
                <div v-for="n in 5" :key="n" class="h-[72px] w-[72px] shrink-0 rounded-lg animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" />
              </div>
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
