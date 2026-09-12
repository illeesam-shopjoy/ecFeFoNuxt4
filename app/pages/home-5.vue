<template>
  <layout-five>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <section class="slider__area slider__area-3 tp_hero relative">
      <Carousel :items-to-show="1" :wrap-around="true" class="slider-active">
        <Slide v-for="item in slider_data" :key="item.heroSliderId" class="single-slider single-slider-2 slider__height-5 flex items-center" :style="{ backgroundImage: `url(${item.bgImg})` }">
          <div class="container-fluid">
            <div class="row">
              <div class="col-xl-6 col-lg-7 col-md-10">
                <div class="slider__content slider__content-3 pl-250">
                  <h2 v-html="item.title"></h2>
                  <p v-html="item.subtile"></p>
                  <nuxt-link href="/shop" class="os-btn os-btn-2 hero-slider-btn"> 바로 보기 </nuxt-link>
                </div>
              </div>
            </div>
          </div>
        </Slide>
        <template #addons>
          <Pagination />
        </template>
      </Carousel>
    </section>
    <div class="box-25">
      <trending-products :style_3="true" />
      <shop-banner />
      <subscribe-area />
    </div>
  </layout-five>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import LayoutFive from "~/layout/LayoutFive.vue";
import { reactive } from "vue";
import { Carousel, Slide, Pagination } from "vue3-carousel";
import { type CoHeroSliderDataType } from "~/types/coHeroSliderDataType";
import TrendingProducts from "~/components/products/TrendingProducts.vue";
import ShopBanner from "~/components/shop-banner/ShopBanner.vue";
import SubscribeArea from "~/components/subscribe/SubscribeArea.vue";
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "홈 5",
});
usePageTitle("홈 5");

// 전시 위젯(area_cd=HERO_SLIDER_HOME5)에서 슬라이드 로드 — 미등록/조회실패 시 기본값 폴백
// (2026-09-13, [[ecfefonuxt4-dp-widget-migration]]).
const DEFAULT_SLIDES: CoHeroSliderDataType[] = [
  {
    heroSliderId: "heroSliderId01",
    bgImg: "/cdn/img/slider/slider-1.jpg",
    title: "핸드메이드 <br> 핸드카브 커피",
    subtile: "의도한 커피 원두만큼 풍부하고 독특한 이 작은 스쿱이, 매일 아침을 특별한 순간으로 만들어 드립니다.",
  },
  {
    heroSliderId: "heroSliderId02",
    bgImg: "/cdn/img/slider/slider-2.jpg",
    title: "다르게 생각하고 <br> 다르게 실행하세요",
    subtile: "다르게 생각하고, 독창적으로 실천하세요. 변화하는 트렌드를 따라갑니다.",
  },
  {
    heroSliderId: "heroSliderId03",
    bgImg: "/cdn/img/slider/slider-3.jpg",
    title: "하이빔<br> by 송성일",
    subtile: "하이빔은 각도 조절이 가능한 책상·선반용 조명으로, 다양한 조명 연출이 가능합니다.",
  },
];

const { data: fetchedSlides } = await useAsyncData<CoHeroSliderDataType[] | null>(
  "dp-hero-slider-home5",
  () => dpAreaSvc.getFirstWidgetConfig<CoHeroSliderDataType[]>("HERO_SLIDER_HOME5")
);
const slider_data = reactive<CoHeroSliderDataType[]>(fetchedSlides.value?.length ? fetchedSlides.value : DEFAULT_SLIDES);
</script>
