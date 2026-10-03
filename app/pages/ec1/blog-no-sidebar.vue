<template>
  <layout :transparent="true">
    <breadcrumb-area title="소식 & 블로그" subtitle="블로그 기본" />
    <section class="blog__area pt-[16px] md:pt-[100px] pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row flex justify-center">
          <div class="col-xl-8 col-lg-8 col-12 mx-auto">
            <div class="blog__wrapper">
              <blog-standard-item v-for="(blog, i) in cp.rows()" :key="i" :blog="blog" />
              <div class="row">
                <div class="col-xl-12">
                  <fo-pager v-if="cp.pager.pageTotalCount" :pager="cp.pager" :on-set-page="n => handleSelectAction('pager-setPage', n)" :on-size-change="() => handleSelectAction('pager-sizeChange')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/ec1/Layout.vue";
import BreadcrumbArea from "~/components/ec1/common/breadcrumb/BreadcrumbArea.vue";
import { ref, reactive, computed } from "vue";
import { useCacheBlogs } from "~/composables/useCacheBlogs";
import FoPager from "~/components/ec1/fo/FoPager.vue";
import { useClientPager } from "~/composables/useClientPager";
import { type CmBlogType } from "~/types/cm/cmBlogType";
import BlogStandardItem from "~/components/ec1/blogs/BlogStandardItem.vue";

useHead({
  title: "블로그",
});

const { blogs } = useCacheBlogs();
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
