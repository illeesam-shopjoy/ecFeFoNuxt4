<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="상품 상세" subtitle="상품 상세" />

    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-product-detail v-if="pending" />

    <!-- 상품 상세 -->
    <shop-details-area v-else-if="item" :item="item" />

    <!-- 상품 없음 fallback -->
    <div v-else class="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">상품을 찾을 수 없습니다.</div>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import ShopDetailsArea from "~/components/shop-details/ShopDetailsArea.vue";
import SkeletonProductDetail from "~/components/ui/SkeletonProductDetail.vue";
import { axiosSsr } from "~/utils/axiosSsr";
import { useProductsStore } from "~/store/useProductsStore";
import { type PdProductType } from "~/types/pdProductType";

const route = useRoute();
const id = route.params.id as string;
// ecBeBo prodId는 문자열(예: "PR2607070656371295")이라 숫자 검증은 더 이상 의미가 없다 —
// 대신 URL에 점(.)이 들어간 경우(.css.map 등 정적 리소스 오요청)만 걸러낸다(2026-09 BFF 전환).
const isValidProdId = Boolean(id) && !id.includes(".");

const { data: item, pending } = await useAsyncData<PdProductType | null>(
  `product-${id}`,
  () => (isValidProdId ? axiosSsr.get<PdProductType>(`/api/fo/ec/pd/prod/${id}`).then((r) => r.data) : Promise.resolve(null)),
  { default: () => null }
);

// 전체 상품 목록은 CSR에서 별도 로드 (관련 상품 등 활용)
const store = useProductsStore();
if (import.meta.client && !store.loaded) {
  store.loadStProducts();
}

import { usePageTitle } from "~/composables/usePageTitle";
import { useGa } from "~/composables/useGa";
useSeoMeta({
  title: item.value ? `${item.value.prodNm} | Outstock` : "상품 상세",
  ogTitle: item.value?.prodNm ?? "상품 상세",
  description: item.value?.smDesc,
  ogDescription: item.value?.smDesc,
  ogImage: item.value?.img,
});
// 상품 구조화 데이터(JSON-LD) — 검색결과에 가격/재고/평점이 노출될 수 있게(2026-09 SEO 보강).
useHead(() => ({
  link: item.value ? [{ rel: "canonical", href: `https://shopjoy-ecfefonuxt4.netlify.app/prod-dtl/${id}` }] : [],
  script: item.value
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: item.value.prodNm,
            description: item.value.smDesc,
            image: item.value.img ? [item.value.img] : undefined,
            brand: item.value.brand?.brandNm ? { "@type": "Brand", name: item.value.brand.brandNm } : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "KRW",
              price: item.value.salePrice,
              availability: item.value.prodStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `https://shopjoy-ecfefonuxt4.netlify.app/prod-dtl/${id}`,
            },
            ...(item.value.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: item.value.rating, reviewCount: item.value.reviews?.length ?? 1 } } : {}),
          }),
        },
      ]
    : [],
}));
usePageTitle("상품 상세");

// GA4: 상세 조회 데이터 기준으로 page_view 전송
const { sendPageView } = useGa();
watch(
  item,
  (v) => {
    if (v?.prodNm) sendPageView(`${v.prodNm} | Outstock`);
  },
  { immediate: true }
);
</script>
