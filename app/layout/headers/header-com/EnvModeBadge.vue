<template>
  <div class="env-mode-badge">
    <div>{{ modeLabel }} · api {{ apiHost }}</div>
    <div>cdn {{ cdnHost }}</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 2026-09-13 요청사항: "Outstock 아래 작게 모드표시해줘 prod, dev, local 중이겠지
 * api url, cd url 도 작게 표시해줘" — 로고 아래에 현재 접속 환경(prod/dev/local)과
 * 실제 호출 대상 백엔드(api)/CDN 호스트를 작은 글씨로 표시한다.
 * 실제 서버↔백엔드 통신은 여전히 server/utils/beApi.ts(runtimeConfig.apiBaseUrl,
 * server-only)로만 이뤄지고, 여기서 쓰는 apiBaseUrlDisplay는 그 값을 화면표시용으로
 * 그대로 미러링한 것 — 호스트명일 뿐 비밀값이 아니라 노출해도 무해하다.
 */
import { computed } from "vue";

const { public: pub } = useRuntimeConfig();

const modeLabel = computed(() => {
  switch (pub.mode) {
    case "production":
    case "prod":
      return "prod";
    case "development":
    case "dev":
      return "dev";
    case "local":
      return "local";
    default:
      return pub.mode || "prod";
  }
});

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
const apiHost = computed(() => hostOf(pub.apiBaseUrlDisplay as string));
const cdnHost = computed(() => hostOf(pub.prodCdnBase as string));
</script>

<style scoped>
/* 2026-09-13(요청사항: "마우스 좌우로 움직이면 하단에 스크롤 생기는데... 다른 메뉴도 다
   마찬가지야") — 이 배지는 로고 아래(헤더) 모든 페이지에 공통으로 떠서, "cdn
   22400.illeesam.synology.me" 같은 긴 호스트명이 white-space:nowrap로 줄바꿈 없이 늘어나면
   여기 자체에는 폭 제한이 없어 헤더 전체가 뷰포트보다 넓어져 모든 페이지에서 가로 스크롤이
   생겼다(부모가 flex 아이템이라 min-content 기준으로 이 배지의 실제 컨텐츠 너비만큼 늘어남).
   자기 자신에 뷰포트 기준 max-width를 줘 부모 flex 계산과 무관하게 항상 좁은 화면 폭 안에서만
   차지하게 하고, 그 안에서 ellipsis(…)로 잘라 보여준다. */
.env-mode-badge {
  font-size: 10px;
  line-height: 1.4;
  color: #9ca3af;
  text-align: center;
  max-width: 45vw;
  margin: 0 auto;
}
.env-mode-badge div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
