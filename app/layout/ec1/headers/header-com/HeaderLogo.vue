<template>
  <!-- 2026-09-20(요청사항: "shopjoy 로고부분 글씨 작게하고 ecFeBo 처럼 로고 표시") — ecFeBo(foAppHeader.js)의 로고와 같은 구성:
       야자수 아이콘 + 이름 + 태그라인 + 환경(prod/dev/local) 배지 + api/cdn 호스트. 예전 EnvModeBadge(로고 아래 2줄)를 이 컴포넌트가 대신한다. -->
  <div class="flex" :class="align === 'center' ? 'justify-center' : 'justify-start'">
    <!-- 2026-09-22(요청사항: "ShopJoy 좌측 CI 쪽으로 공백줄이고 더 붙여줘") — 아이콘과 글자 사이 gap을 줄여 더 붙임 -->
    <!-- 2026-09-29(요청사항: "PC에서 볼때 기본값이 너무 작긴하네 — 반응형은 유지하되 PC에서
         정상적으로 볼때는 좀 더 크면 좋겠어") — 예전엔 sm(640px) 이후로는 더 안 커져서 1920px
         데스크탑에서도 폰과 거의 같은 크기였다. 모바일/태블릿 크기는 그대로 두고 lg(1024px)
         이상에서만 로고 아이콘·글자를 한 단계 더 키운다. -->
    <nuxt-link href="/" class="inline-flex items-center gap-0.5 lg:gap-1.5 min-w-0 no-underline" aria-label="ShopJoy 홈">
      <!-- <img> 로 둬야 다크모드(html invert 필터, app/assets/<모듈>/theme-dark.css)에서 img 규칙으로 색이 되돌려진다 -->
      <img src="/logo/shopjoy-palm.svg" alt="" width="36" height="36" class="shrink-0 w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11" />
      <span class="flex flex-col min-w-0 leading-[1.1] text-left">
        <!-- 2026-09-22(요청사항: "ShopJoy 글씨 더 작게 — width 최소한으로") — 폭을 최대한 덜 차지하도록 더 줄임 -->
        <span class="text-[0.68rem] sm:text-[0.8rem] lg:text-[1.05rem] font-extrabold tracking-[-0.3px] text-[#2b2b2b]">ShopJoy</span>
        <span class="flex flex-wrap items-center gap-1 text-[0.6rem] sm:text-[0.6rem] lg:text-[0.78rem] font-medium tracking-[0.08em] text-[#8a8a8a]">
          <!-- 2026-09-21(요청사항: 폰에서 로고 폭 줄이기) — 좁은 화면(<sm)에선 "쇼핑의 즐거움" 문구를 빼고 그 자리에 환경 배지(prod)만 보인다 -->
          <span class="max-sm:hidden">쇼핑의 즐거움</span>
          <span class="px-[5px] lg:px-[6px] rounded-[3px] border font-mono text-[9px] lg:text-[10px] font-bold" :class="chipClass">{{ modeLabel }}</span>
        </span>
        <span class="hidden lg:block text-[0.68rem] text-[#a3a3a3] opacity-75 whitespace-nowrap overflow-hidden text-ellipsis max-w-[45vw]">api {{ apiHost }} · cdn {{ cdnHost }}</span>
        <!-- 2026-10-02(요청사항: "상단에 ShopJoy 있는곳에 사이트id 모듈 값 표시해줘") — 이 배포가 고정된 사이트(sy_site.site_id)와 FO 모듈. 비밀값 아님 -->
        <span class="hidden lg:block text-[0.68rem] text-[#a3a3a3] opacity-75 whitespace-nowrap overflow-hidden text-ellipsis max-w-[45vw]">site {{ tenant.siteId }} · <b class="font-mono text-[#7c3aed]">{{ tenant.moduleId }}</b></span>
      </span>
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
/**
 * HeaderLogo — 헤더 로고(아이콘 + 이름 + 태그라인 + 환경 배지 + api/cdn 호스트).
 * 환경 표시값은 예전 EnvModeBadge 와 같은 출처(runtimeConfig.public: mode/apiBaseUrlDisplay/prodCdnBase)이며 호스트명일 뿐 비밀값이 아니다.
 * 2026-09-19 교훈: baseConst 의 process.env 는 빌드된 앱(브라우저/서버 런타임)에서 비어 항상 "prod" 가 나오므로 runtimeConfig.public 을 쓴다.
 * 긴 호스트명이 헤더를 뷰포트보다 넓히지 않도록(2026-09-13 가로 스크롤 버그) max-w + ellipsis 로 자른다.
 */
import { computed } from "vue";

withDefaults(defineProps<{ align?: "start" | "center" }>(), { align: "start" });

const { public: pub } = useRuntimeConfig();
const tenant = useTenant(); // 사이트ID · 모듈 (멀티테넌트, 2026-10-02)
const RUN_MODE = String(pub.mode ?? "");
const API_URL = String(pub.apiBaseUrlDisplay ?? "");
const CDN_URL = String(pub.prodCdnBase ?? "");

const modeLabel = computed(() => {
  switch (RUN_MODE) {
    case "production":
    case "prod":
      return "prod";
    case "development":
    case "dev":
      return "dev";
    case "local":
      return "local";
    default:
      return RUN_MODE || "prod";
  }
});

// ecFeBo 와 같은 색: prod=빨강, dev=파랑, local=노랑
const chipClass = computed(() => {
  switch (modeLabel.value) {
    case "prod":
      return "text-white bg-[#e53935] border-[#c62828]";
    case "dev":
      return "text-[#1565c0] bg-[#e3f0fb] border-[#90caf9]";
    case "local":
      return "text-[#7a5800] bg-[#fff59d] border-[#f9a825]";
    default:
      return "text-[#555] bg-[#f0f0f0] border-[#ccc]";
  }
});

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
const apiHost = computed(() => hostOf(API_URL));
const cdnHost = computed(() => hostOf(CDN_URL));
</script>
