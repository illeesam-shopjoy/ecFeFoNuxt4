<template>
  <div class="banner__area-2 pb-60">
    <!-- 2026-09-29(요청사항: "화면늘리면 계속 늘어나는데 원래 이미지의 어느 비율까지만 늘어나면
         좋겠어") — container-fluid는 max-width가 없어(_grid.scss 참조) 초광폭 화면에서 배너
         이미지가 끝없이 커졌다. 사이트의 다른 폭넓은 섹션(TrendingProducts 등)과 동일하게
         max-w-[1840px]로 상한을 두고 그 너머는 가운데 정렬되게 한다. -->
    <div :class="`container-fluid mx-auto max-w-[1840px] ${style_2 ? '' : 'p-0'}`">
      <div class="row g-0">
        <div v-for="(item, index) in bannerItems" :key="item.prodId" class="col-xl-6 col-lg-6">
          <div :class="`banner__item-2 banner-${index === 0 ? 'right' : 'left'} relative mb-30 p${index === 0 ? 'r' : 'l'}-15`">
            <div class="banner__thumb fix">
              <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="w-img">
                <!-- 2026-09-13(요청사항: "우측에 비해 좀 크게 ... height 조정해줘") — 16/9는
                     데모보다 세로로 커 보여 2/1로 낮춤. -->
                <app-image :src="item.bannerImg" alt="banner" wrap-class="w-img" :skeleton-style="{ width: '100%', aspectRatio: '2/1' }" />
              </nuxt-link>
            </div>
            <div :class="`banner__content-2 ${style_3 ? 'banner__content-4' : ''} ${index !== 0 && style_3 ? 'banner__content-4-right' : ''} absolute transition-3`">
              <span>상품 {{ item.category?.categoryNm }}</span>
              <h4>
                <nuxt-link :to="`/prod-dtl/${item.prodId}`">{{ item.prodNm }}</nuxt-link>
              </h4>
              <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — banner__area-2/
                   banner__content-4 조상 여부(=style_3)에 따라 max-width가 갈리던 걸 조건부 클래스로 대체. -->
              <p :class="style_3 ? 'sm_desc max-w-[250px]' : 'sm_desc max-w-[450px]'">
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
import AppImage from "~/components/ec1/ui/AppImage.vue";

defineProps<{ style_2?: boolean; style_3?: boolean }>();
const products = useCacheProducts();
const { formatPrice } = usePrice();

// 2026-09-13(요청사항: "할인 위에 Bottle With Wooden Cork / Hauteville Plywood Chair 가 있어야 해") —
// product.banner는 ecBeBo 실 스키마에 대응 컬럼이 없어 항상 false라(mapProduct.ts 참조,
// trending/isBest와 같은 사유) 이 섹션이 늘 비어 있었다. banner=true 상품이 없으면 임의의
// 상품 2개로 대체하되, bannerImg도 항상 undefined이므로 실존 CDN 배너 이미지(banner-big-1/2)로
// 채운다(상품ID/이름/가격/설명 등 나머지는 실제 상품 값을 그대로 사용 — 링크·구매 정상 동작).
const { public: { prodCdnBase } } = useRuntimeConfig();
const FALLBACK_BANNER_IMGS = ["banner-big-1.jpg", "banner-big-2.jpg"];
const bannerItems = computed(() => {
  return products.value.slice(0, 2).map((item, index) => ({
    ...item,
    bannerImg: item.bannerImg || `${prodCdnBase}/cdn/prod/img/shop/banner/${FALLBACK_BANNER_IMGS[index]}`,
  }));
});
</script>

