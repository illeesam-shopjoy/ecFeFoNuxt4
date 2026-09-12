<template>
  <section class="slider__area slider__area-2 tp_hero relative pl-15 pr-15">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <Carousel :items-to-show="1" :wrap-around="true" class="slider-active">
      <Slide v-for="item in slider_data" :key="item.heroSliderId" class="single-slider single-slider-2 slider__height-2 flex items-center" :style="{ backgroundImage: `url(${item.bgImg})` }">
        <div class="container-fluid">
          <div class="row">
            <div class="col-xl-6 col-lg-7 col-md-10 col-sm-10 w-full">
              <div :class="`slider__content ${item.isDark ? 'slider__content-black' : ''} slider__content-3`" style="text-align: left; padding-left: 40px;">
                <h2 data-animation="fadeInUp" data-delay=".2s" v-html="item.title"></h2>
                <p data-animation="fadeInUp" data-delay=".4s" v-html="item.subtile"></p>
                <a href="#" :class="`os-btn ${item.isDark ? 'os-btn-white' : 'os-btn-2'} hero-slider-btn`" data-animation="fadeInUp" data-delay=".6s"> 바로 보기 </a>
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
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('히어로 슬라이더 2');
import { reactive } from "vue";
import { Carousel, Slide, Pagination } from "vue3-carousel";
import { type CoHeroSliderDataTypeTwo } from "~/types/coHeroSliderDataTypeTwo";
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";

// 전시 위젯(area_cd=HERO_SLIDER_TWO)에서 슬라이드 로드 — 미등록/조회실패 시 기본값 폴백
// (2026-09-13, [[ecfefonuxt4-dp-widget-migration]]).
const DEFAULT_SLIDES: CoHeroSliderDataTypeTwo[] = [
  {
    heroSliderId: "heroSliderId01",
    bgImg: "/cdn/img/slider/03/slider-01.jpg",
    isDark: true,
    title: "조명 <br /> 크리에이티브 가구",
    subtile: "크리에이티브 가구를 바로 보세요.",
  },
  {
    heroSliderId: "heroSliderId02",
    bgImg: "/cdn/img/slider/03/slider-02.jpg",
    title: "조명 <br /> 크리에이티브 가구",
    subtile: "크리에이티브 가구를 바로 보세요.",
  },
  {
    heroSliderId: "heroSliderId03",
    bgImg: "/cdn/img/slider/03/slider-03.jpg",
    title: "드롭 체어 <br /> 블랙 레더 에디션",
    subtile: "크리에이티브 가구를 바로 보세요.",
  },
];

const { data: fetchedSlides } = await useAsyncData<CoHeroSliderDataTypeTwo[] | null>(
  "dp-hero-slider-two",
  () => dpAreaSvc.getFirstWidgetConfig<CoHeroSliderDataTypeTwo[]>("HERO_SLIDER_TWO")
);
const slider_data = reactive<CoHeroSliderDataTypeTwo[]>(fetchedSlides.value?.length ? fetchedSlides.value : DEFAULT_SLIDES);
</script>
