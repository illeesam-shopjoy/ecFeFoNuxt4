<template>
  <layout :transparent="true">
    <breadcrumb-area title="소식 & 블로그" subtitle="블로그 기본" />
    <blog-standard-area />
  </layout>
</template>

<script setup lang="ts">
// 2026-09-23: nuxt.config.ts app.keepalive.include 매칭용 이름 (뒤로가기 시 스크롤·상태 복원)
defineOptions({ name: "BlogListPage" });
import Layout from "~/layout/ec1/Layout.vue";
import BreadcrumbArea from "~/components/ec1/common/breadcrumb/BreadcrumbArea.vue";
import BlogStandardArea from "~/components/ec1/blogs/BlogStandardArea.vue";

useHead({
  title: "블로그",
});
</script>
