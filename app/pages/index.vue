<template>
  <layout>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <!-- 멀티테넌트(2026-10-02) 확장 지점: 홈 본문은 사이트 모듈 레이어(tenants/<모듈>/app/components/tenant/TenantHome.vue)가 채운다.
         ec1 = 기존 쇼핑몰 홈 그대로, ec2 = 별도 홈. core 는 이 이름의 컴포넌트를 두지 않는다(레이어보다 프로젝트가 우선이라 두면 모듈이 덮을 수 없다). -->
    <tenant-home />
  </layout>
</template>

<script setup lang="ts">
// 2026-09-23: nuxt.config.ts app.keepalive.include 매칭용 이름 (뒤로가기 시 스크롤·상태 복원)
defineOptions({ name: "HomePage" });
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: useTenant().name, // 모듈이 정한 이름(ec1=ShopJoy, ec2=ShopJoy EC2)
});
usePageTitle("홈");
</script>
