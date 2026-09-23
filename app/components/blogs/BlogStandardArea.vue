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
            <!-- 2026-09-23(요청사항: "모바일에서 볼때는 무한스크롤로 적용해달라고했는데") — 모바일(<sm)은
                 스크롤 끝에 닿으면 자동으로 더 보여주는 무한스크롤, 데스크톱은 기존 숫자 페이징(fo-pager) 그대로. -->
            <template v-else>
              <blog-standard-item v-for="(blog, i) in infiniteRows" :key="`m-${i}`" :blog="blog" class="sm:hidden" />
              <blog-standard-item v-for="(blog, i) in cp.rows()" :key="`d-${i}`" :blog="blog" class="hidden sm:block" />
            </template>
            <div ref="loadMoreSentinel" class="sm:hidden text-center mt-20">
              <span v-if="hasMoreInfinite" class="text-gray-400 text-sm">불러오는 중…</span>
              <span v-else-if="infiniteRows.length" class="text-gray-300 text-sm">마지막 글입니다.</span>
            </div>
            <div class="row hidden sm:block">
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, onActivated, onDeactivated, watch } from "vue";
import { useCacheBlogs } from "~/composables/useCacheBlogs";
import BlogSidebar from "../common/sidebar/BlogSidebar.vue";
import FoPager from "~/components/fo/FoPager.vue";
import { useClientPager } from "~/composables/useClientPager";
import { type CmBlogType } from "~/types/cm/cmBlogType";
import BlogStandardItem from "./BlogStandardItem.vue";
import SkeletonCard from "~/components/ui/SkeletonCard.vue";

defineProps({
  left_side: { type: Boolean, default: false },
});

const { blogs, pending } = useCacheBlogs();
// 2026-09-13 버그수정: blogContent는 실제 블로그 본문 HTML이라 예전 목업 데이터 시절의
// "블로그-스탠다드" 같은 태그 문자열과 절대 일치하지 않아 목록이 항상 비어 있었다 —
// 필터 제거, 전체 블로그 사용.
const standardBlogs = computed(() => blogs.value ?? []);

const cp = useClientPager(() => standardBlogs.value, 9, [9, 18, 36]);

// 2026-09-23(요청사항: "모바일에서 볼때는 무한스크롤로 적용해달라고했는데") — 데이터는 이미 전부
// 로드돼 있어(useCacheBlogs) 서버 재조회 없이 "몇 건까지 보여줄지"만 늘려가면 된다. shop.vue의
// 자동 스크롤(IntersectionObserver) 패턴과 동일 — KeepAlive로 이 컴포넌트가 다시 비활성화(뒤로가기로
// 상세 진입)/재활성화(뒤로가기)될 때도 observer를 그때마다 정리/재연결해 중복 관찰을 막는다.
const infiniteCount = ref(cp.pager.pageSize);
const infiniteRows = computed(() => standardBlogs.value.slice(0, infiniteCount.value));
const hasMoreInfinite = computed(() => infiniteCount.value < standardBlogs.value.length);
const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
function connectObserver() {
  if (typeof IntersectionObserver === "undefined" || !loadMoreSentinel.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMoreInfinite.value) infiniteCount.value += cp.pager.pageSize;
    },
    { rootMargin: "200px" }
  );
  observer.observe(loadMoreSentinel.value);
}
function disconnectObserver() {
  observer?.disconnect();
  observer = null;
}
onMounted(connectObserver);
onBeforeUnmount(disconnectObserver);
onActivated(connectObserver); // KeepAlive로 다시 보일 때 재연결
onDeactivated(disconnectObserver); // KeepAlive로 숨겨질 때 정리(중복 관찰 방지)

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
