<template>
  <!-- 2026-09-20(요청사항: "상단정보 알림, 로그인정보, 좋아요, 장바구니, 테마, 설정" — 첨부이미지 기준) — 설정(⚙) 버튼 + 드롭다운.
       상품비교 / 다크 모드 전환 / 링크 공유 · 카카오톡 공유 · PDF 다운로드 / 환경 정보. 이전 ExtraInfo(내 계정·언어·통화)를 대체한다. -->
  <div ref="wrapRef" class="relative inline-flex">
    <button
      type="button"
      class="w-10 h-10 rounded-xl inline-flex items-center justify-center border cursor-pointer transition"
      :class="open ? 'bg-[#fdf6ee] border-theme text-theme' : 'bg-white border-[#e5e7eb] text-gray-500 hover:border-gray-400'"
      aria-label="설정"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      <i class="fas fa-cog text-[15px]"></i>
    </button>

    <div v-show="open" class="absolute top-[calc(100%+10px)] right-0 w-[248px] bg-white rounded-xl border border-[#eee] shadow-[0_10px_35px_rgba(0,0,0,0.14)] py-2 z-[9999] text-left" @click="onMenuClick">
      <nuxt-link href="/compare" class="hs-item"><span class="hs-ico">⚖️</span>상품비교</nuxt-link>
      <button type="button" class="hs-item" data-keep-open @click="theme.toggle()"><span class="hs-ico">{{ theme.dark.value ? "☀️" : "🌙" }}</span>{{ theme.dark.value ? "라이트 모드로 전환" : "다크 모드로 전환" }}</button>

      <div class="my-1.5 border-t border-[#f0f0f0]"></div>
      <div class="px-4"><share-tools-buttons variant="menu" /></div>

      <!-- 로컬 모드 전용: 경로 배지 / env 설정 -->
      <template v-if="isLocal">
        <div class="my-1.5 border-t border-[#f0f0f0]"></div>
        <div class="px-4 py-1.5">
          <span class="block text-[0.7rem] text-[#666] mb-1.5 break-all">{{ currentPagePath() }}</span>
          <label class="flex items-center gap-1.5 text-[0.75rem] text-[#666] cursor-pointer">
            <input v-model="showFilePathBadge" type="checkbox" class="cursor-pointer" />
            <span>경로 표시</span>
          </label>
        </div>
        <nuxt-link href="/dev/env-settings" class="hs-item"><span class="hs-ico">🛠️</span>env 설정</nuxt-link>
      </template>

      <!-- 환경 정보 -->
      <div class="mt-1.5 pt-2 px-4 pb-1 border-t border-[#f0f0f0] text-[10.5px] leading-[1.5] text-gray-400">
        <div>{{ modeLabel }}</div>
        <div class="break-all">api {{ apiHost }}</div>
        <div class="break-all">cdn {{ cdnHost }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import ShareToolsButtons from "~/components/common/ShareToolsButtons.vue";

const config = useRuntimeConfig();
const isLocal = config.public.mode === "local";
const route = useRoute();
const theme = useTheme();
const { showFilePathBadge } = useShowFilePathBadge();

const open = ref(false);
const wrapRef = ref<HTMLElement | null>(null);

// 화면 표시용 환경 정보 (EnvModeBadge 와 같은 출처: runtimeConfig.public)
const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};
const MODE_LABEL: Record<string, string> = { production: "prod", prod: "prod", development: "dev", dev: "dev", local: "local" };
const modeLabel = MODE_LABEL[String(config.public.mode ?? "")] ?? String(config.public.mode ?? "prod");
const apiHost = hostOf(String(config.public.apiBaseUrlDisplay ?? ""));
const cdnHost = hostOf(String(config.public.prodCdnBase ?? ""));

// 현재 페이지 소스 경로(로컬 모드 표시용) — 렌더 시 호출
const currentPagePath = () => `app/pages${route.path === "/" ? "/index" : route.path}.vue`;

// 링크/버튼 항목을 누르면 메뉴를 닫는다(data-keep-open 이 있는 테마 전환은 열어 둔 채 즉시 반영을 확인)
function onMenuClick(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest<HTMLElement>("a, button");
  if (el && el.dataset.keepOpen === undefined) open.value = false;
}

function handleOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) open.value = false;
}
onMounted(() => document.addEventListener("click", handleOutside));
onUnmounted(() => document.removeEventListener("click", handleOutside));
</script>

<style scoped>
.hs-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 16px;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 0.85rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.hs-item:hover {
  color: #bc8246;
  background: #faf6f1;
}
.hs-ico {
  width: 18px;
  text-align: center;
}
</style>
