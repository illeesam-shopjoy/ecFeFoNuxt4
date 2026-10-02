<template>
  <!-- ec2 전용 페이지 — 모듈 폴더(app/pages/ec2)가 자기만의 주소를 가질 수 있음을 보이는 예(/ec2-intro). ec1 빌드에는 이 라우트가 없다. -->
  <layout :transparent="true">
    <breadcrumb-area title="EC2 소개" subtitle="EC2 소개" />
    <section class="pt-[16px] md:pt-[80px] pb-100">
      <div class="max-w-3xl mx-auto px-4">
        <h2 class="mt-0">{{ tenant.name }}</h2>
        <p>이 페이지는 <b>app/pages/ec2</b> 에만 있는 화면입니다. 사이트 <b>{{ tenant.siteId }}</b> · 모듈 <b>{{ tenant.moduleId }}</b>.</p>
        <ul>
          <li v-for="(on, key) in tenant.features" :key="key">{{ key }}: {{ on ? "사용" : "사용 안 함" }}</li>
        </ul>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/ec2/Layout.vue";
import BreadcrumbArea from "~/components/ec2/common/breadcrumb/BreadcrumbArea.vue";

const tenant = useTenant();
useHead({ title: `${tenant.name} - 소개` });
</script>
