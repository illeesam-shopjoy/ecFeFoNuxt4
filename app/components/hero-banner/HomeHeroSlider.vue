<template>
  <section :class="`slider__area ${style_2 ? 'slider__area-2' : ''} relative tp_hero`">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <Carousel :items-to-show="1" :wrap-around="true" class="slider-active">
      <Slide v-for="item in slider_data" :key="item.heroSliderId" :class="`single-slider slider__height ${style_2 ? 'single-slider-2 slider__height-5' : ''} flex items-center`" :style="{ backgroundImage: `url(${item.bgImg})` }">
        <div class="max-w-7xl mx-auto px-4">
          <div class="row flex justify-center">
            <div class="col-xl-6 col-lg-6 col-md-8 col-sm-10 w-full mx-auto">
              <div class="slider__content text-center">
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
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('히어로 슬라이더');
import { computed } from "vue";
import { Carousel, Slide, Pagination } from "vue3-carousel";
import { type CoHeroSliderDataType } from "~/types/coHeroSliderDataType";
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";
defineProps({
  style_2: { type: Boolean, default: false },
});

// 전시 위젯(area_cd=HERO_SLIDER_MAIN)에서 슬라이드 로드 — 관리자가 "전시패널관리"에서 수정 가능.
// 미등록/조회실패 시 아래 기본값(DEFAULT_SLIDES)으로 폴백(2026-09-13, [[ecfefonuxt4-dp-widget-migration]]).
const DEFAULT_SLIDES: CoHeroSliderDataType[] = [
  {
    heroSliderId: "heroSliderId01",
    bgImg: "/cdn/img/slider/slider-1.jpg",
    title: "핸드메이드 <br /> 핸드카브 커피",
    subtile: "의도한 커피 원두만큼 풍부하고 독특한 이 작은 스쿱이, 매일 아침을 특별한 순간으로 만들어 드립니다.",
  },
  {
    heroSliderId: "heroSliderId02",
    bgImg: "/cdn/img/slider/slider-2.jpg",
    title: "다르게 생각하고 <br /> 다르게 실행하세요",
    subtile: "다르게 생각하고, 독창적으로 실천하세요. 변화하는 트렌드를 따라갑니다.",
  },
  {
    heroSliderId: "heroSliderId03",
    bgImg: "/cdn/img/slider/slider-3.jpg",
    title: "하이빔<br /> by  태희",
    subtile: "하이빔은 각도 조절이 가능한 책상·선반용 조명으로, 다양한 조명 연출이 가능합니다.",
  },
];

// 2026-09-13(성능 개선): lazy:true — 화면 마운트를 블로킹하지 않는다. 기존엔 reactive()로
// fetchedSlides.value를 한 번만 복사해서, lazy로 바꾸면 늦게 도착한 실제 데이터가 화면에
// 절대 반영되지 않는 문제가 있었다 — computed로 바꿔 fetchedSlides.value가 나중에 채워져도
// slider_data가 자동으로 갱신되게 한다.
const { data: fetchedSlides } = useAsyncData<CoHeroSliderDataType[] | null>(
  "dp-hero-slider-main",
  () => dpAreaSvc.getFirstWidgetConfig<CoHeroSliderDataType[]>("HERO_SLIDER_MAIN"),
  { lazy: true }
);
const slider_data = computed<CoHeroSliderDataType[]>(() => fetchedSlides.value?.length ? fetchedSlides.value : DEFAULT_SLIDES);
</script>
