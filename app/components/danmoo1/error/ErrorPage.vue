<template>
  <!-- danmoo1 오류 화면 — error.vue 가 이 빌드의 모듈 것으로 연결한다. 404 와 그 외를 구분해 짧게 안내 -->
  <layout :tabs="false">
    <template #top><dm-title-bar :title="is404 ? '페이지를 찾을 수 없어요' : '문제가 생겼어요'" :back="false" :close="true" /></template>
    <div class="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
      <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 bg-[var(--dm-primary-soft)] text-[var(--dm-primary)]">
        <i :class="is404 ? 'far fa-map-signs' : 'far fa-exclamation-circle'" aria-hidden="true"></i>
      </div>
      <h1 class="text-[22px] font-extrabold m-0">{{ is404 ? "없는 페이지예요" : "잠시 후 다시 시도해 주세요" }}</h1>
      <p class="muted mt-2 mb-8 text-[14px] break-all">{{ message }}</p>
      <button type="button" class="btn-primary w-full max-w-[320px]" @click="handleBtnAction('error-home')">홈으로</button>
      <button type="button" class="btn-soft w-full max-w-[320px] mt-2" @click="handleBtnAction('error-back')">이전 화면</button>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";

const props = defineProps<{ error?: { statusCode?: number; statusMessage?: string; message?: string } | null }>();
const is404 = computed(() => props.error?.statusCode === 404);
const message = computed(() => (is404.value ? "주소가 바뀌었거나 삭제된 글이에요." : String(props.error?.statusMessage || props.error?.message || "").split("::")[0] || "알 수 없는 오류"));

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "error-home") return clearError({ redirect: "/" });
  if (cmd === "error-back") {
    clearError();
    return import.meta.client && window.history.length > 1 ? window.history.back() : navigateTo("/");
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};
</script>
