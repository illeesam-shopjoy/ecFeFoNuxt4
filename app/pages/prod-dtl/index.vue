<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="상품 상세" subtitle="상품 상세" />

    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-product-detail v-if="pending" />

    <!-- 상품 상세 -->
    <shop-details-area v-else-if="item" :item="item" />

    <!-- 상품 없음 fallback -->
    <div v-else class="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
      상품을 찾을 수 없습니다.
    </div>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import ShopDetailsArea from "~/components/shop-details/ShopDetailsArea.vue";
import SkeletonProductDetail from "~/components/ui/SkeletonProductDetail.vue";
import { type PdProductType } from "~/types/pdProductType";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";

// SSR: 첫 번째 상품 조회 — ecBeBo prodId는 문자열이라 고정 ID로 바로 조회할 수 없어
// 목록에서 첫 건을 가져와 그 prodId로 상세를 다시 조회한다(2026-09 BFF 전환).
const { data: item, pending } = await useAsyncData<PdProductType | null>("product-detail-index", async () => {
  const list = await pdProductSvc.getPage();
  const first = list[0];
  if (!first) return null;
  return pdProductSvc.getById(first.prodId);
});

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "상품 상세",
});
usePageTitle("상품 상세");
</script>
