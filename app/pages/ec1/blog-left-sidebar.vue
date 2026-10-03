<template>
  <layout :transparent="true">
    <breadcrumb-area title="소식 & 블로그" subtitle="블로그 기본" />
    <blog-area :left_side="true" />
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/ec1/Layout.vue";
import BreadcrumbArea from "~/components/ec1/common/breadcrumb/BreadcrumbArea.vue";
import BlogArea from "~/components/ec1/blogs/BlogStandardArea.vue";

useHead({
  title: "Blog",
});
</script>
