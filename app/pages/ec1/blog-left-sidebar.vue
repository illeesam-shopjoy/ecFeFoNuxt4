<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="소식 & 블로그" subtitle="블로그 기본" />
    <blog-area :left_side="true" />
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/ec1/Layout.vue";
import BreadcrumbArea from "~/components/ec1/common/breadcrumb/BreadcrumbArea.vue";
import BlogArea from "~/components/ec1/blogs/BlogStandardArea.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "Blog",
});
usePageTitle("블로그 좌사이드");
</script>
