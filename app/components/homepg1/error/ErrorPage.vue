<template>
  <!-- homepg1 오류 화면 — error.vue 가 이 빌드의 모듈 것으로 연결한다. 홈페이지 틀 안에서 404 와 그 외를 구분해 안내 -->
  <layout>
    <div class="page-wrap" style="text-align: center; padding-top: 72px; padding-bottom: 72px">
      <div style="font-size: 3.2rem; margin-bottom: 18px">{{ is404 ? "🧭" : "⚠️" }}</div>
      <h1 class="section-title" style="font-size: 1.8rem; margin-bottom: 12px">
        <span class="gradient-text">{{ is404 ? "페이지를 찾을 수 없습니다" : "잠시 후 다시 시도해 주세요" }}</span>
      </h1>
      <p class="section-subtitle" style="margin-bottom: 32px; word-break: break-all">{{ message }}</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap">
        <button type="button" class="btn-blue" @click="handleBtnAction('error-home')">홈으로</button>
        <button type="button" class="btn-outline" @click="handleBtnAction('error-contact')">고객센터 문의</button>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";

const props = defineProps<{ error?: { statusCode?: number; statusMessage?: string; message?: string } | null }>();
const is404 = computed(() => props.error?.statusCode === 404);
const message = computed(() =>
  is404.value ? "주소가 바뀌었거나 없는 페이지입니다." : String(props.error?.statusMessage || props.error?.message || "").split("::")[0] || "알 수 없는 오류",
);

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "error-home") return clearError({ redirect: "/" });
  if (cmd === "error-contact") return clearError({ redirect: "/contact" });
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
