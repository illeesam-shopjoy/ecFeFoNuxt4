<template>
  <div class="env-mode-badge">{{ modeLabel }} · api {{ apiHost }} · cdn {{ cdnHost }}</div>
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
.env-mode-badge {
  font-size: 10px;
  line-height: 1.4;
  color: #9ca3af;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
