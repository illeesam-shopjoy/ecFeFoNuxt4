<template>
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — env-badge/file-path-badge-row
       커스텀 클래스를 Tailwind로 대체. var(--heading-color, #201f1f)는 실제 정의된 곳이 없어
       항상 폴백값만 쓰이므로 그대로 하드코딩. -->
  <ul class="extra-info">
    <li>
      <div class="flex items-center gap-1.5 pt-1.5 px-1 pb-1 text-[0.72rem] text-[#999] border-b border-dashed border-[#e5e5e5] mb-0.5">
        <span>{{ config.public.envNm }}</span>
        <span class="inline-block px-1.5 py-px rounded-[20px] bg-[#f0f0f0] text-[#555] font-semibold text-[0.7rem]">{{ config.public.mode }}</span>
      </div>
      <div v-if="isLocal" class="pt-1.5 px-1 pb-2 border-b border-dashed border-[#e5e5e5] mb-0.5">
        <span class="block text-[0.7rem] text-[#666] mb-1.5 break-all">{{ currentPagePath }}</span>
        <label class="flex items-center gap-1.5 text-[0.72rem] text-[#666] cursor-pointer">
          <input v-model="showFilePathBadge" type="checkbox" class="cursor-pointer" />
          <span>경로 표시</span>
        </label>
      </div>
    </li>
    <li>
      <div class="my-account">
        <div class="extra-title">
          <h5 class="font-bold text-[0.95rem] tracking-[-0.02em] text-[#201f1f]">내 계정</h5>
        </div>
        <ul>
          <li><nuxt-link href="/account">내 계정</nuxt-link></li>
          <li><nuxt-link href="/wishlist">위시리스트</nuxt-link></li>
          <li><nuxt-link href="/cart">장바구니</nuxt-link></li>
          <li><nuxt-link href="/checkout">결제</nuxt-link></li>
          <li><nuxt-link href="/compare">상품비교</nuxt-link></li>
          <li><nuxt-link href="/register">회원가입</nuxt-link></li>
          <!-- 2026-09-14(요청사항: "우측 상단에 설정을클릭하면 env 값 보는페이지 하나
               만들어주고") — 토스/소셜로그인/지도 등 env 값을 확인·수정하는 로컬 전용
               화면. isLocal일 때만 노출(화면 자체도 로컬 모드가 아니면 동작 안 함). -->
          <li v-if="isLocal"><nuxt-link href="/dev/env-settings">설정</nuxt-link></li>
        </ul>
      </div>
    </li>
    <li>
      <div class="lang">
        <div class="extra-title">
          <h5 class="font-bold text-[0.95rem] tracking-[-0.02em] text-[#201f1f]">언어</h5>
        </div>
        <ul>
          <li><a href="#">영어</a></li>
          <li><a href="#">프랑스어</a></li>
          <li><a href="#">독일어</a></li>
          <li><a href="#">벵골어</a></li>
        </ul>
      </div>
    </li>
    <li>
      <div class="currency">
        <div class="extra-title">
          <h5 class="font-bold text-[0.95rem] tracking-[-0.02em] text-[#201f1f]">통화</h5>
        </div>
        <ul>
          <li><a href="#">USD - 미국 달러</a></li>
          <li><a href="#">EUR - 유로</a></li>
          <li><a href="#">GBP - 영국 파운드</a></li>
          <li><a href="#">INR - 인도 루피</a></li>
        </ul>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const isLocal = config.public.mode === "local";

const route = useRoute();
const currentPagePath = computed(() => {
  const path = route.path === "/" ? "/index" : route.path;
  return `app/pages${path}.vue`;
});

const { showFilePathBadge } = useShowFilePathBadge();
</script>

