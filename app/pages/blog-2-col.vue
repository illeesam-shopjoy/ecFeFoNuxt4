<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="블로그 2단" subtitle="블로그 2단" />
    <section class="blog__area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 로딩 중 스켈레톤 -->
        <div v-if="pending" class="row">
          <div v-for="n in 4" :key="n" class="col-xl-6 col-lg-6 col-md-6">
            <skeleton-card />
          </div>
        </div>
        <template v-else>
          <div class="row">
            <div v-for="(blog, i) in cp.rows()" :key="i" class="col-xl-6 col-lg-6 col-md-6">
              <blog-standard-item :blog="blog" :style_2="true" />
            </div>
          </div>
          <div class="row">
            <div class="col-xl-12">
              <fo-pager v-if="cp.pager.pageTotalCount" :pager="cp.pager" :on-set-page="n => handleSelectAction('pager-setPage', n)" :on-size-change="() => handleSelectAction('pager-sizeChange')" />
            </div>
          </div>
        </template>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { ref, reactive, computed } from "vue";
import { useCacheBlogs } from "~/composables/useCacheBlogs";
import { type CmBlogType } from "~/types/cm/cmBlogType";
import FoPager from "~/components/fo/FoPager.vue";
import { useClientPager } from "~/composables/useClientPager";
import BlogStandardItem from "~/components/blogs/BlogStandardItem.vue";
import SkeletonCard from "~/components/ui/SkeletonCard.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "블로그 2단",
});
usePageTitle("블로그 2단");

const { blogs, pending } = useCacheBlogs();
// 2026-09-13 버그수정: blogContent는 실제 블로그 본문 HTML이라 예전 목업 데이터 시절의
// "블로그-스탠다드" 같은 태그 문자열과 절대 일치하지 않아 목록이 항상 비어 있었다 —
// 필터 제거, 전체 블로그 사용.
const standardBlogs = computed(() => blogs.value ?? []);

const cp = useClientPager(() => standardBlogs.value, 4, [4, 8, 16]);

/* handleSelectAction — 선택/페이징 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = (cmd: string, param: unknown = {}) => {
  // 페이지 이동 (param: pageNo)
  if (cmd === "pager-setPage") {
    return cp.setPage(param as number);
    // 페이지 크기 변경
  } else if (cmd === "pager-sizeChange") {
    return cp.sizeChange();
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};
</script>
