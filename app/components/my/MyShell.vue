<template>
  <!-- 마이페이지 공통 틀(신규 화면용): 배너 + 좌측 메뉴 + 본문 슬롯. 목록형 6개 화면은 MyPageFrame 이 같은 좌측 메뉴를 쓴다. -->
  <layout :transparent="true">
    <xdev-file-path-badge v-if="filePath" :file-path="filePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="마이페이지" :subtitle="title" />
    <section class="bg-white pb-24 pt-14">
      <div class="mx-auto max-w-7xl px-4 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
        <my-menu :active="active" />
        <div class="min-w-0">
          <h2 class="m-0 mb-4 text-[1.3rem] font-extrabold text-gray-900">{{ title }}</h2>
          <slot />
        </div>
      </div>
    </section>
    <slot name="modal" />
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import MyMenu from "~/components/my/MyMenu.vue";

defineProps<{ active: string; title: string; filePath?: string | null }>();
</script>
