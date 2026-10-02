<template>
  <!-- 오류 화면은 모듈마다 모양이 다르다 — 본문은 app/components/<모듈>/error/ErrorPage.vue (멀티테넌트). 여기는 이 빌드의 모듈 것으로 연결만 한다. -->
  <error-page :error="error" />
</template>

<script lang="ts" setup>
import ErrorPage from "#tenant-components/error/ErrorPage.vue";

defineProps(["error"]);
</script>
