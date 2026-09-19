<template>
  <section class="blog__area pt-100 pb-100">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <div class="row flex justify-center">
        <div v-if="left_side" class="col-xl-3 col-lg-4">
          <blog-sidebar />
        </div>
        <div :class="`col-xl-${left_side ? '9' : '8'} col-lg-8`">
          <div class="blog__wrapper">
            <!-- 로딩 중 스켈레톤 -->
            <template v-if="pending">
              <skeleton-card v-for="n in 3" :key="n" />
            </template>
            <template v-else>
              <blog-standard-item v-for="(blog, i) in cp.rows()" :key="i" :blog="blog" />
            </template>
            <div class="row">
              <div class="col-xl-12">
                <fo-pager v-if="cp.pager.pageTotalCount" :pager="cp.pager" :on-set-page="n => handleSelectAction('pager-setPage', n)" :on-size-change="() => handleSelectAction('pager-sizeChange')" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="!left_side" class="col-xl-3 col-lg-4">
          <blog-sidebar />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('블로그');
import { ref, reactive, computed } from "vue";
import { useBlogs } from "~/composables/useBlogs";
import BlogSidebar from "../common/sidebar/BlogSidebar.vue";
import FoPager from "~/components/fo/FoPager.vue";
import { useClientPager } from "~/composables/useClientPager";
import { type CoBlogType } from "~/types/coBlogType";
import BlogStandardItem from "./BlogStandardItem.vue";
import SkeletonCard from "~/components/ui/SkeletonCard.vue";

defineProps({
  left_side: { type: Boolean, default: false },
});

const { blogs, pending } = useBlogs();
// 2026-09-13 버그수정: blogContent는 실제 블로그 본문 HTML이라 예전 목업 데이터 시절의
// "블로그-스탠다드" 같은 태그 문자열과 절대 일치하지 않아 목록이 항상 비어 있었다 —
// 필터 제거, 전체 블로그 사용.
const standardBlogs = computed(() => blogs.value ?? []);

const cp = useClientPager(() => standardBlogs.value, 9, [9, 18, 36]);

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
