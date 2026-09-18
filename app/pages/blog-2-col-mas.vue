<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="블로그 2단 메이슨리" subtitle="블로그 2단 메이슨리" />
    <section class="blog__area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 로딩 중 스켈레톤 (최초 1페이지) -->
        <div v-if="pending" class="row">
          <div v-for="n in 4" :key="n" class="col-xl-6 col-lg-6 col-md-6">
            <skeleton-card />
          </div>
        </div>
        <div v-else class="row grid">
          <masonry-wall :items="blogs" :gap="30">
            <template #default="{ item }">
              <div class="blog__wrapper">
                <div class="blog__item mb-60">
                  <div class="blog__thumb fix">
                    <nuxt-link :to="`/blog-dtl/${item.blogId}`" class="w-img">
                      <app-image
                        :src="item.img"
                        alt="blog"
                        wrap-class="w-img"
                        :skeleton-style="{ width: '100%', aspectRatio: '16/10' }"
                        defer-until-visible
                      />
                    </nuxt-link>
                  </div>
                  <div class="blog__content">
                    <h4>
                      <nuxt-link :to="`/blog-dtl/${item.blogId}`">
                        <span v-html="item.blogTitle"></span>
                      </nuxt-link>
                    </h4>
                    <div class="blog__meta">
                      <span
                        >By <a href="#">{{ item.blogAuthor }}</a></span
                      >
                      <span>/ {{ item.regDate }}</span>
                    </div>
                    <p>{{ item.blogSummary }} [...]</p>
                    <nuxt-link :to="`/blog-dtl/${item.blogId}`" class="os-btn">더 보기</nuxt-link>
                  </div>
                </div>
              </div>
            </template>
          </masonry-wall>
        </div>
        <!-- 2026-09-17(요청사항: "블로그 목록 20개씩 스크롤 내려가면 20개조회") — 이 div가 뷰포트
             근처에 들어오면 다음 20개를 자동으로 더 받아온다. 목록이 남아있을 때만 렌더. -->
        <div v-if="!pending && hasMore" ref="sentinelRef" class="row">
          <div class="col-xl-12 text-center py-20">
            <span v-if="loadingMore" class="text-sm text-gray-400">불러오는 중...</span>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { type CoBlogType } from "~/types/coBlogType";
import AppImage from "~/components/ui/AppImage.vue";
import SkeletonCard from "~/components/ui/SkeletonCard.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "블로그 2단 메이슨리",
});
usePageTitle("블로그 2단 메이슨리");

// 2026-09-17 버그수정/개선: 예전엔 useBlogs()(전체 최대 200건 공유캐시)를 통째로 받아와
// 마소너리에 다 흩뿌렸다 — 목록이 길어질수록 처음 화면 뜨는 속도가 느려지고 안 보이는
// 이미지까지 전부 받아오는 낭비가 있었다. 이 화면만 20개씩 실제 서버 페이징으로 바꾸고,
// 목록 끝에 다다르면(IntersectionObserver) 자동으로 다음 20개를 더 불러온다.
const PAGE_SIZE = 20;
const pageNo = ref(1);
const blogs = ref<CoBlogType[]>([]);
const pending = ref(true);
const loadingMore = ref(false);
const hasMore = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

async function loadFirstPage() {
  pending.value = true;
  try {
    const res = await coBlogSvc.getPaged(1, PAGE_SIZE);
    blogs.value = res.items;
    hasMore.value = res.hasMore;
    pageNo.value = 1;
  } finally {
    pending.value = false;
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  try {
    const res = await coBlogSvc.getPaged(pageNo.value + 1, PAGE_SIZE);
    blogs.value.push(...res.items);
    hasMore.value = res.hasMore;
    pageNo.value = res.pageNo;
  } finally {
    loadingMore.value = false;
  }
}

onMounted(async () => {
  await loadFirstPage();
  await nextTick(); // v-if="hasMore"로 방금 그려진 sentinelRef가 DOM에 실제로 붙을 때까지 대기
  if (typeof IntersectionObserver === "undefined" || !sentinelRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { rootMargin: "400px 0px" }
  );
  observer.observe(sentinelRef.value);
});

onUnmounted(() => observer?.disconnect());
</script>
