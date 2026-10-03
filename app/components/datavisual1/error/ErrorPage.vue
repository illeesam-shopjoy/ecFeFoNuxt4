<template>
  <!-- datavisual1 오류 화면 — error.vue 가 이 빌드의 모듈 것으로 연결한다. 대시보드 틀 안에서 404 와 그 외를 구분해 안내 -->
  <layout>
    <div class="page-wrap" style="text-align: center; padding-top: 72px; padding-bottom: 72px; margin: 0 auto">
      <div style="font-size: 3rem; margin-bottom: 16px">{{ is404 ? "🧭" : "⚠️" }}</div>
      <h1 class="section-title" style="margin-bottom: 10px"><span class="gradient-text">{{ is404 ? "페이지를 찾을 수 없습니다" : "잠시 후 다시 시도해 주세요" }}</span></h1>
      <p class="section-subtitle" style="margin-bottom: 28px; word-break: break-all">{{ message }}</p>
      <button type="button" class="btn-primary" @click="handleBtnAction('error-home')">대시보드로</button>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";

const props = defineProps<{ error?: { statusCode?: number; statusMessage?: string; message?: string } | null }>();
const is404 = computed(() => props.error?.statusCode === 404);
const message = computed(() =>
  is404.value ? "주소가 바뀌었거나 없는 페이지입니다." : String(props.error?.statusMessage || props.error?.message || "").split("::")[0] || "알 수 없는 오류",
);

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "error-home") return clearError({ redirect: "/" });
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
