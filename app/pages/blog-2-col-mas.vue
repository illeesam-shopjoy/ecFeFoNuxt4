<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="블로그 2단 메이슨리" subtitle="블로그 2단 메이슨리" />
    <section class="blog__area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 로딩 중 스켈레톤 -->
        <div v-if="pending" class="row">
          <div v-for="n in 4" :key="n" class="col-xl-6 col-lg-6 col-md-6">
            <skeleton-card />
          </div>
        </div>
        <div v-else class="row grid">
          <masonry-wall :items="masonryBlogs" :gap="30">
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
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { computed } from "vue";
import { useBlogs } from "~/composables/useBlogs";
import AppImage from "~/components/ui/AppImage.vue";
import SkeletonCard from "~/components/ui/SkeletonCard.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "블로그 2단 메이슨리",
});
usePageTitle("블로그 2단 메이슨리");

const { blogs, pending } = useBlogs();
// 2026-09-13 버그수정: blogContent는 실제 블로그 본문 HTML(예: "<article>...</article>")이라
// 예전 목업 데이터 시절의 "블로그-메이슨리" 같은 태그 문자열과 절대 일치하지 않아 목록이 항상
// 비어 있었다 — 필터 제거, 전체 블로그 사용.
const masonryBlogs = computed(() => blogs.value ?? []);
</script>
