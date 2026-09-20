<template>
  <!-- 2026-09-20(요청사항: "shopjoy 로고부분 글씨 작게하고 ecFeBo 처럼 로고 표시") — ecFeBo(foAppHeader.js)의 로고와 같은 구성:
       야자수 아이콘 + 이름 + 태그라인 + 환경(prod/dev/local) 배지 + api/cdn 호스트. 예전 EnvModeBadge(로고 아래 2줄)를 이 컴포넌트가 대신한다. -->
  <div class="flex" :class="align === 'center' ? 'justify-center' : 'justify-start'">
    <nuxt-link href="/" class="inline-flex items-center gap-2 min-w-0 no-underline" aria-label="ShopJoy 홈">
      <!-- <img> 로 둬야 다크모드(html invert 필터, assets/theme-dark.css)에서 img 규칙으로 색이 되돌려진다 -->
      <img src="/logo/shopjoy-palm.svg" alt="" width="36" height="36" class="shrink-0 w-9 h-9" />
      <span class="flex flex-col min-w-0 leading-[1.1] text-left">
        <span class="text-[0.95rem] font-extrabold tracking-[-0.3px] text-[#2b2b2b]">ShopJoy</span>
        <span class="flex flex-wrap items-center gap-1 text-[0.6rem] font-medium tracking-[0.08em] text-[#8a8a8a]">
          쇼핑의 즐거움
          <span class="px-[5px] rounded-[3px] border font-mono text-[9px] font-bold" :class="chipClass">{{ modeLabel }}</span>
        </span>
        <span class="text-[0.58rem] text-[#a3a3a3] opacity-75 whitespace-nowrap overflow-hidden text-ellipsis max-w-[45vw]">api {{ apiHost }} · cdn {{ cdnHost }}</span>
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
