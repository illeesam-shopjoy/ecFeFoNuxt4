<template>
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — env-mode-badge 커스텀 클래스를
       Tailwind로 대체. -->
  <div class="text-[10px] leading-[1.4] text-gray-400 text-center max-w-[45vw] mx-auto">
    <!-- 2026-09-13(요청사항: "마우스 좌우로 움직이면 하단에 스크롤 생기는데... 다른 메뉴도 다
         마찬가지야") — "cdn 22400.illeesam.synology.me" 같은 긴 호스트명이 white-space:nowrap로
         줄바꿈 없이 늘어나면 헤더 전체가 뷰포트보다 넓어져 가로 스크롤이 생겼다(부모가 flex
         아이템이라 min-content 기준으로 이 배지의 실제 컨텐츠 너비만큼 늘어남). 위 max-w로 항상
         좁은 화면 폭 안에서만 차지하게 하고, 아래에서 ellipsis(…)로 잘라 보여준다. -->
    <div class="whitespace-nowrap overflow-hidden text-ellipsis">{{ modeLabel }} · api {{ apiHost }}</div>
    <div class="whitespace-nowrap overflow-hidden text-ellipsis">cdn {{ cdnHost }}</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 2026-09-13 요청사항: "Outstock 아래 작게 모드표시해줘 prod, dev, local 중이겠지
 * api url, cd url 도 작게 표시해줘" — 로고 아래에 현재 접속 환경(prod/dev/local)과
 * 실제 호출 대상 백엔드(api)/CDN 호스트를 작은 글씨로 표시한다.
 * 실제 서버↔백엔드 통신은 여전히 server/utils/beApi.ts(runtimeConfig.apiBaseUrl,
 * server-only)로만 이뤄지고, 여기서 쓰는 값들은 화면표시용 미러 — 호스트명일 뿐
 * 비밀값이 아니라 노출해도 무해하다.
 * 2026-09-14: RUN_MODE/API_URL/CDN_URL(app/conts/baseConst.ts)로 값 출처 통일.
 * 2026-09-19 버그수정(요청사항: "netlify 는 prod, synology 는 dev 로 표시되어야") — baseConst 의 process.env.NUXT_PUBLIC_MODE 는
 * nuxt.config.ts 를 읽는 빌드 시점에만 값이 있고, 빌드된 앱(브라우저/서버 런타임)에서는 process.env 가 비어 항상 기본값 "prod" 가
 * 표시됐다(synology dev 도 prod 로 보임). 빌드 때 nuxt.config.ts 가 주입해 둔 runtimeConfig.public(mode/apiBaseUrlDisplay/prodCdnBase)을 쓴다:
 * synology dev = .env.development 로 빌드 → dev, Netlify = 순수 nuxt build(모드 미지정) → 기본 prod.
 */
import { computed } from "vue";

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
