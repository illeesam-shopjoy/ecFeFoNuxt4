<template>
  <layout-seven>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <!-- 히어로 슬라이더 7 -->
    <section class="slider__area slider__area-3 tp_hero relative">
      <div class="slider-active-3">
        <Carousel :items-to-show="1" :wrap-around="true" ref="heroSliderRef">
          <Slide v-for="item in heroSliderData" :key="item.heroSliderId" class="single-slider single-slider-2 slider__height-6 flex items-center" :style="{ backgroundImage: `url(${item.bgImg})` }">
            <div class="container custom-container-2">
              <div class="row">
                <div class="col-xl-7 col-lg-7 col-md-10">
                  <div class="slider__content slider__content-5">
                    <span :class="`${item.meta ? 'meta' : ''}`">{{ item.sm_title }}</span>
                    <h2 v-html="item.title"></h2>
                    <p v-html="item.subtitle"></p>
                    <nuxt-link href="/shop" class="os-btn-4 hero-slider-btn">쇼핑하기</nuxt-link>
                  </div>
                </div>
              </div>
            </div>
          </Slide>
          <template #addons>
            <Pagination />
          </template>
        </Carousel>
        <div>
          <button @click="handleHeroPrev" type="button" class="slick-prev slick-arrow">
            <i class="fal fa-angle-left"></i>
          </button>
          <button @click="handleHeroNext" type="button" class="slick-next slick-arrow">
            <i class="fal fa-angle-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- 카테고리 2 -->
    <div class="banner__area-df mt-10">
      <div v-for="item in categoryItems" :key="item.categoryId" class="banner__item-3 mb-30">
        <div class="banner__item-3-image m-img">
          <app-image
            :src="item.img"
            :alt="item.parentTitle"
            wrap-class="m-img"
            :skeleton-style="{ width: '100%', aspectRatio: '4/3' }"
          />
        </div>
        <div class="banner__content-5">
          <h5>{{ item.parentTitle }}</h5>
          <p>{{ item.smDesc }}</p>
          <nuxt-link href="/shop" class="os-btn-5">쇼핑하기</nuxt-link>
        </div>
      </div>
    </div>

    <!-- 베스트 상품 -->
    <div class="product__view-area pt-60 pb-60">
      <div class="container custom-container-2">
        <div class="row">
          <div class="col-xl-12">
            <div class="section__wrapper text-center">
              <h3 class="section__title-2"><span>베스트셀러 상품</span></h3>
              <p>베스트셀러 상품을 만나보세요.</p>
            </div>
          </div>
        </div>
        <div class="row mt-40">
          <div class="col-xl-6 col-lg-6">
            <div class="row">
              <div class="col-lg-12">
                <div class="row">
                  <div v-for="(item, i) in smBestPrd.slice(0, 2)" :key="i" class="col-xl-6 col-lg-12 col-md-6">
                    <div class="product__item mb-40">
                      <product-item-two :item="item" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="bigPrd1" class="col-lg-12">
                <div class="product__big-image effectThree mb-40">
                  <nuxt-link :to="`/prod-dtl/${bigPrd1.prodId}`">
                    <app-image :src="bigPrd1.bigImg" alt="product img" wrap-class="w-img" :skeleton-style="{ width: '100%', aspectRatio: '4/3' }" />
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 col-lg-6">
            <div class="row">
              <div v-if="bigPrd2" class="col-lg-12">
                <div class="product__big-image effectThree mb-40">
                  <nuxt-link :to="`/prod-dtl/${bigPrd2.prodId}`">
                    <app-image :src="bigPrd2.bigImg" alt="product img" wrap-class="w-img" :skeleton-style="{ width: '100%', aspectRatio: '4/3' }" />
                  </nuxt-link>
                </div>
              </div>
              <div class="col-lg-12">
                <div class="row">
                  <div v-for="(item, i) in smBestPrd.slice(2, 4)" :key="i" class="col-xl-6 col-lg-12 col-md-6">
                    <div class="product__item mb-40">
                      <product-item-two :item="item" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 동영상 -->
    <div class="video__area-df" :style="{ backgroundImage: `url(${videoBg})` }">
      <div class="max-w-7xl mx-auto px-4">
        <div class="video__content text-center">
          <div class="video__button mb-60">
            <a @click.prevent="handleVideoPopup" href="#">
              <i class="fas fa-play"></i>
            </a>
          </div>
          <h5 class="video__title">영상 라이트박스</h5>
          <p>영상 라이트박스는 영상을 보여주는 라이트박스입니다.</p>
        </div>
      </div>
    </div>
    <!-- 비디오 모달 시작 -->
    <video-modal ref="video_modal" video-url="https://www.youtube.com/embed/7e90gBu4pas" />
    <!-- 비디오 모달 끝 -->

    <!-- 추천 상품 -->
    <div class="product__slider-area pt-95 pb-60">
      <div class="container custom-container-2 mx-auto">
        <div class="row flex justify-center">
          <div class="col-xl-12">
            <div class="section__wrapper text-center">
              <h3 class="section__title-2"><span>추천 상품</span></h3>
              <p>Claritas est etiam processus dynamicus, qui sequitur.</p>
            </div>
          </div>
        </div>
        <div class="row flex justify-center mt-40">
          <div class="col-lg-12">
            <div class="product__slider-active relative">
              <Carousel
                ref="featuredSliderRef"
                :items-to-show="3"
                :wrap-around="true"
                :breakpoints="{
                  1200: {
                    itemsToShow: 3,
                  },
                  992: {
                    itemsToShow: 3,
                  },
                  700: {
                    itemsToShow: 2,
                  },
                  0: {
                    itemsToShow: 1,
                  },
                }"
              >
                <Slide v-for="(item, i) in featuredProducts" :key="i" class="product__slider-item">
                  <div class="product__item mb-40">
                    <product-item-two :item="item" />
                  </div>
                </Slide>
              </Carousel>
              <div class="owl-nav">
                <div @click="handleFeaturedPrev" class="owl-prev">
                  <button><i class="fal fa-angle-left"></i></button>
                </div>
                <div @click="handleFeaturedNext" class="owl-next">
                  <button><i class="fal fa-angle-right"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 추천 후기 -->
    <div class="testimonial__area bg-gray-100 pt-95 pb-95">
      <div class="container custom-container-2 mx-auto">
        <div class="row flex justify-center">
          <div class="col-lg-12">
            <div class="row flex justify-center">
              <div class="col-xl-12">
                <div class="section__wrapper text-center mb-40">
                  <h3 class="section__title-2">추천 상품</h3>
                  <p class="sub-title">당신의 하루를 조금 더 특별하게 만들어 줄 단 하나의 선택, 바로 이 상품입니다. 작은 차이가 큰 만족으로 이어지는 순간을 경험해보세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row flex justify-center">
          <div class="col-lg-12">
            <Carousel :items-to-show="1" :wrap-around="true" ref="testimonialSliderRef" class="testimonial__slider-active">
              <Slide v-for="item in testimonialData" :key="item.id" class="testimonail__slider-item">
                <div class="testimonial__image text-center mb-50">
                  <app-image
                    :src="item.img"
                    alt=""
                    :img-style="{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto' }"
                    :skeleton-style="{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto' }"
                  />
                </div>
                <div class="testimonial__content">
                  <p v-html="item.desc"></p>
                </div>
              </Slide>
              <template #addons>
                <Pagination />
              </template>
            </Carousel>
          </div>
        </div>
      </div>
    </div>

    <!-- 블로그 영역 2 -->
    <div class="blog__slider-area pt-100 pb-100">
      <div class="container custom-container-2 mx-auto">
        <div class="row flex justify-center">
          <div class="col-xl-12">
            <div class="row flex justify-center">
              <div class="col-xl-12">
                <div class="section__wrapper text-center">
                  <h3 class="section__title-2"><span> 블로그에서 </span></h3>
                  <p>세계 최신 패션 트렌드를 만나보세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row flex justify-center mt-40">
          <div class="col-xl-12">
            <div class="blog__slider-active relative">
              <Carousel :items-to-show="2" :wrap-around="false" ref="blogSliderRef">
                <Slide v-for="item in homeBlogs" :key="item.blogId" class="blog__slider-item">
                  <div class="blog-thumb m-img">
                    <app-image
                      :src="item.img"
                      alt="blog-img"
                      wrap-class="w-img"
                      :skeleton-style="{ width: '100%', aspectRatio: '16/10' }"
                    />
                    <nuxt-link :to="`/blog-dtl/${item.blogId}`" class="btn">
                      <i class="fa fa-link"></i>
                    </nuxt-link>
                  </div>
                  <div class="blog__post-content">
                    <div class="blog__wrapper">
                      <h5 class="blog__post-title">
                        <nuxt-link :to="`/blog-dtl/${item.blogId}`">
                          <span v-html="item.blogTitle"></span>
                        </nuxt-link>
                      </h5>
                      <div class="article-meta flex justify-center">
                        <span class="article-author"> <span>By</span> Theme_pure Admin</span>
                        <span> /</span>
                        <span class="article-publish">
                          <i class="fa fa-calendar-o"></i>
                          {{ item.regDate }}
                        </span>
                      </div>
                    </div>
                  </div>
                </Slide>
              </Carousel>
              <div class="owl-nav">
                <div class="owl-prev" @click="handleBlogPrev">
                  <button><i class="fal fa-angle-left"></i></button>
                </div>
                <div class="owl-next" @click="handleBlogNext">
                  <button><i class="fal fa-angle-right"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 브랜드 슬라이더 2 -->
    <div class="brand__area pb-90">
      <div class="container custom-container-2">
        <div class="brand__slider-active relative">
          <Carousel
            ref="brandSliderRef"
            :items-to-show="5"
            :wrap-around="true"
            :snapAlign="'center'"
            :breakpoints="{
              1200: {
                itemsToShow: 5,
              },
              992: {
                itemsToShow: 3,
              },
              700: {
                itemsToShow: 2,
              },
              0: {
                itemsToShow: 1,
              },
            }"
          >
            <Slide v-for="(brand, i) in brandImages" :key="i" class="brand__slider-item">
              <div class="brand__image">
                <app-image
                  :src="brand"
                  alt="client"
                  :img-style="{ maxWidth: '160px', height: '60px', objectFit: 'contain', display: 'block', margin: '0 auto' }"
                  :skeleton-style="{ width: '160px', height: '60px', margin: '0 auto' }"
                />
              </div>
            </Slide>
          </Carousel>
          <div class="owl-nav">
            <div @click="handleBrandPrev" class="owl-prev">
              <button><i class="fal fa-angle-left"></i></button>
            </div>
            <div @click="handleBrandNext" class="owl-next">
              <button><i class="fal fa-angle-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </layout-seven>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import LayoutSeven from "~/layout/LayoutSeven.vue";
import { ref, reactive, computed } from "vue";
import { Carousel, Slide, Pagination } from "vue3-carousel";
import { type CoHeroSliderDataTypeThree } from "~/types/coHeroSliderDataTypeThree";
import AppImage from "~/components/ui/AppImage.vue";
import { pdCategorySvc, type CategoryTreeResponse } from "~/svc/fo/ec/pd/pdCategorySvc";
import { useProductsStore } from "~/store/useProductsStore";
import ProductItemTwo from "~/components/products/ProductItemTwo.vue";
import VideoModal from "~/components/modals/VideoModal.vue";
import { useBlogs } from "~/composables/useBlogs";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "홈 7",
});
usePageTitle("홈 7");

// 히어로 슬라이더 7
const heroSliderRef = ref<{ next(): void; prev(): void } | null>(null);
const heroSliderData = reactive<CoHeroSliderDataTypeThree[]>([
  {
    heroSliderId: "heroSliderId01",
    bgImg: "/cdn/img/slider/05/slide111.webp",
    sm_title: "최대 50% 할인",
    meta: true,
    title: "당신에게 필요한 <br/>라이프스타일.",
    subtitle: "다양한 라이프스타일을 경험해 보세요.",
  },
  {
    heroSliderId: "heroSliderId02",
    bgImg: "/cdn/img/slider/05/slide112.webp",
    sm_title: "빠른 배송",
    title: "크리에이티브 테마 <br/>어썸.",
    subtitle: "다양한 라이프스타일을 경험해 보세요.",
  },
  {
    heroSliderId: "heroSliderId03",
    bgImg: "/cdn/img/slider/05/slide113.webp",
    sm_title: "빠른 배송",
    title: "세상은<br/>만들어 갑니다.",
    subtitle: "다양한 라이프스타일을 경험해 보세요.",
  },
]);
function handleHeroNext() {
  heroSliderRef.value?.next();
}
function handleHeroPrev() {
  heroSliderRef.value?.prev();
}

// 카테고리 2
const { data: catData } = useAsyncData<CategoryTreeResponse>(
  "category-tree",
  () => pdCategorySvc.getCategoryTree(),
  { default: () => ({ categoryTree: [], categoryIdToName: {} }) }
);
const categoryItems = computed(() => (catData.value?.categoryTree ?? []).slice(3, 6));

// 베스트 상품 + 추천 상품 (같은 스토어 공유)
const productsStore = useProductsStore();
const bestSaleProducts = computed(() => productsStore.products.filter((p) => p.isBest));
const bigPrd1 = computed(() => bestSaleProducts.value.filter((p) => p.bigImg)[0]);
const bigPrd2 = computed(() => bestSaleProducts.value.filter((p) => p.bigImg)[1]);
const smBestPrd = computed(() => bestSaleProducts.value.filter((p) => !p.bigImg));
const featuredProducts = computed(() => productsStore.products.filter((p) => p.isBest).filter((p) => !p.bigImg));

// 동영상
const videoBg = "/cdn/img/bg/bg-video.webp";
const video_modal = ref<InstanceType<typeof VideoModal> | null>(null);
function handleVideoPopup() {
  video_modal.value?.playVideo();
}

// 추천 상품 슬라이더
const featuredSliderRef = ref<{ next(): void; prev(): void } | null>(null);
function handleFeaturedNext() {
  featuredSliderRef.value?.next();
}
function handleFeaturedPrev() {
  featuredSliderRef.value?.prev();
}

// 추천 후기
const testimonialSliderRef = ref<{ next(): void; prev(): void } | null>(null);
interface TestimonialDataType {
  id: number;
  img: string;
  desc: string;
}
const testimonialData = reactive<TestimonialDataType[]>([
  {
    id: 1,
    img: "/cdn/img/testimonial/testi1.webp",
    desc: "당신의 하루를 조금 더 특별하게 만들어 줄 단 하나의 선택, 바로 이 상품입니다. 작은 차이가 큰 만족으로 이어지는 순간을 경험해보세요.",
  },
  {
    id: 2,
    img: "/cdn/img/testimonial/testi2.webp",
    desc: "지금 이 상품은 단순한 제품이 아니라, 당신의 시간을 아끼고 삶의 질을 높여주는 해결책입니다. 꼭 필요한 순간에 가장 든든한 동반자가 되어줄 거예요",
  },
  {
    id: 3,
    img: "/cdn/img/testimonial/testi3.webp",
    desc: "많은 분들이 찾고 계신 바로 그 상품, 지금 이 순간에만 만나실 수 있습니다. 놓치면 다시는 같은 조건으로 만나기 어려울지도 모릅니다",
  },
]);

// 블로그 영역 2
const { blogs } = useBlogs();
const homeBlogs = computed(() => (blogs.value ?? []).filter((b) => b.blogContent === "홈-7"));
const blogSliderRef = ref<{ next(): void; prev(): void } | null>(null);
function handleBlogNext() {
  blogSliderRef.value?.next();
}
function handleBlogPrev() {
  blogSliderRef.value?.prev();
}

// 브랜드 슬라이더 2
const brandSliderRef = ref<{ next(): void; prev(): void } | null>(null);
const brandImages = [
  "/cdn/img/client/client-1.jpg",
  "/cdn/img/client/client-2.jpg",
  "/cdn/img/client/client-3.jpg",
  "/cdn/img/client/client-4.jpg",
  "/cdn/img/client/client-5.jpg",
  "/cdn/img/client/client-2.jpg",
];
function handleBrandNext() {
  brandSliderRef.value?.next();
}
function handleBrandPrev() {
  brandSliderRef.value?.prev();
}
</script>

<style scoped>
.carousel__slide {
  display: block;
}
.product__slider-area .carousel__slide.product__slider-item {
  padding: 0 15px;
}
.blog__slider-area .carousel__slide.blog__slider-item {
  padding: 0 15px;
}
</style>
