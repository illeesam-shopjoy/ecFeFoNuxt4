<template>
  <div class="banner__area-2 pb-60">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div :class="`container-fluid ${style_2 ? '' : 'p-0'}`">
      <div class="row g-0">
        <div v-for="(item, index) in bannerItems" :key="item.prodId" class="col-xl-6 col-lg-6">
          <div :class="`banner__item-2 banner-${index === 0 ? 'right' : 'left'} relative mb-30 p${index === 0 ? 'r' : 'l'}-15`">
            <div class="banner__thumb fix">
              <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="w-img">
                <app-image :src="item.bannerImg" alt="banner" wrap-class="w-img" :skeleton-style="{ width: '100%', aspectRatio: '16/9' }" />
              </nuxt-link>
            </div>
            <div :class="`banner__content-2 ${style_3 ? 'banner__content-4' : ''} ${index !== 0 && style_3 ? 'banner__content-4-right' : ''} absolute transition-3`">
              <span>상품 {{ item.category?.categoryNm }}</span>
              <h4>
                <nuxt-link :to="`/prod-dtl/${item.prodId}`">{{ item.prodNm }}</nuxt-link>
              </h4>
              <p class="sm_desc">
                {{ style_3 ? item.smDesc.slice(0, 50) : item.smDesc }}
              </p>
              <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="os-btn os-btn-2">
                구매하기 /
                <span>{{ formatPrice(item.salePrice) }}</span>
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('쇼핑 배너');
import { useProductsStore } from "~/store/useProductsStore";
import AppImage from "~/components/ui/AppImage.vue";

defineProps<{ style_2?: boolean; style_3?: boolean }>();
const store = useProductsStore();
const { formatPrice } = usePrice();

// 2026-09-13(요청사항: "할인 위에 Bottle With Wooden Cork / Hauteville Plywood Chair 가 있어야 해") —
// product.banner는 ecBeBo 실 스키마에 대응 컬럼이 없어 항상 false라(mapProduct.ts 참조,
// trending/isBest와 같은 사유) 이 섹션이 늘 비어 있었다. banner=true 상품이 없으면 임의의
// 상품 2개로 대체하되, bannerImg도 항상 undefined이므로 실존 CDN 배너 이미지(banner-big-1/2)로
// 채운다(상품ID/이름/가격/설명 등 나머지는 실제 상품 값을 그대로 사용 — 링크·구매 정상 동작).
const { public: { prodCdnBase } } = useRuntimeConfig();
const FALLBACK_BANNER_IMGS = ["banner-big-1.jpg", "banner-big-2.jpg"];
const bannerItems = computed(() => {
  const withBanner = store.products.filter((p) => p.banner);
  const source = (withBanner.length ? withBanner : store.products).slice(0, 2);
  return source.map((item, index) => ({
    ...item,
    bannerImg: item.bannerImg || `${prodCdnBase}/prod/img/shop/banner/${FALLBACK_BANNER_IMGS[index]}`,
  }));
});
</script>

<style scoped>
.banner__area-2 .sm_desc {
  max-width: 450px;
}
.banner__content-4 .sm_desc {
  max-width: 250px;
}
</style>
