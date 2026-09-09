<template>
  <layout :white_bg="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-blog-detail v-if="pending" />

    <!-- 블로그 상세 -->
    <blog-details-area v-else-if="item" :item="item" />
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BlogDetailsArea from "~/components/blog-dtl/BlogDetailsArea.vue";
import SkeletonBlogDetail from "~/components/ui/SkeletonBlogDetail.vue";
import { axiosSsr } from "~/utils/axiosSsr";
import { type CoBlogType } from "~/types/coBlogType";

// ecBeBo blogId는 문자열이라 고정 ID로 바로 조회할 수 없어 목록에서 첫 건을 가져와
// 그 blogId로 상세를 다시 조회한다(2026-09 BFF 전환, prod-dtl/index.vue와 동일 패턴).
const { data: item, pending } = useAsyncData<CoBlogType | null>("blog-details-preview", async () => {
  const list = await axiosSsr.get<CoBlogType[]>("/api/fo/ec/cm/bltn/page").then((r) => r.data);
  const first = list[0];
  if (!first) return null;
  return axiosSsr.get<CoBlogType>(`/api/fo/ec/cm/bltn/${first.blogId}`).then((r) => r.data);
});

import { usePageTitle } from "~/composables/usePageTitle";
useHead({ title: "블로그 상세" });
usePageTitle("블로그 상세");
</script>
