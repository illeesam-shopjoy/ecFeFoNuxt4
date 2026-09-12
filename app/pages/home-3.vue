<template>
  <layout-three>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <main class="box-25">
      <home-two-hero-slider />
      <category-area :style_2="true" />
      <trending-product-three />
      <shop-banner :style_2="true" />
      <sale-off-product />
      <section class="testimonial__area box-m-15 pt-100 pb-140" :style="{ backgroundImage: `url(${testimonialBg})` }">
        <div class="max-w-7xl mx-auto px-4">
          <div class="row">
            <div class="col-xl-8 offset-xl-2 col-lg-8 offset-lg-2">
              <Carousel :items-to-show="3" :wrap-around="true" v-model="currentSlide" ref="carousel" class="testimonial__nav">
                <Slide v-for="item in nav_data" :key="item.id">
                  <div @click="slideTo(item.id - 1)" class="testimonial__nav-thumb item-1">
                    <app-image
                      :src="item.img"
                      alt="person"
                      :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', display: 'block' }"
                      :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }"
                    />
                  </div>
                </Slide>
              </Carousel>

              <Carousel class="testimonial__wrapper mt-40" :items-to-show="1" :wrap-around="false" v-model="currentSlide">
                <Slide v-for="item in testimonial_data" :key="item.id" class="testimonial__item item-1">
                  <div class="avater__info mb-15">
                    <h6>{{ item.title }}</h6>
                    <span>{{ item.name }}</span>
                  </div>
                  <p>
                    {{ item.desc }}
                  </p>
                </Slide>

                <template #addons>
                  <Pagination />
                </template>
              </Carousel>
            </div>
          </div>
        </div>
      </section>
      <offer-products-slider />
      <client-brand-slider :style_2="true" />
      <subscribe-area :style_2="true" />
      <blog-area :style_2="true" />
    </main>
  </layout-three>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import LayoutThree from "~/layout/LayoutThree.vue";
import { ref } from "vue";
import { Carousel, Slide, Pagination } from "vue3-carousel";
import CategoryArea from "~/components/category/CategoryArea.vue";
import HomeTwoHeroSlider from "~/components/hero-banner/HomeTwoHeroSlider.vue";
import TrendingProductThree from "~/components/products/TrendingProductThree.vue";
import ShopBanner from "~/components/shop-banner/ShopBanner.vue";
import SaleOffProduct from "~/components/products/SaleOffProduct.vue";
import AppImage from "~/components/ui/AppImage.vue";
import OfferProductsSlider from "~/components/products/OfferProductsSlider.vue";
import ClientBrandSlider from "~/components/client-brands/ClientBrandSlider.vue";
import SubscribeArea from "~/components/subscribe/SubscribeArea.vue";
import BlogArea from "~/components/blogs/BlogArea.vue";
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "Home Three",
});
usePageTitle("홈 3");

const testimonialBg = "/cdn/img/testimonial/testimonial-bg.jpg";
const currentSlide = ref(0);

// 후기 — 전시 위젯(area_cd=TESTIMONIAL_HOME3)에서 로드, 미등록/조회실패 시 기본값 폴백
// (2026-09-13, [[ecfefonuxt4-dp-widget-migration]]). nav_data(썸네일)/testimonial_data(내용)는
// 템플릿을 그대로 두기 위해 병합된 원본 배열에서 파생시킨다.
interface TestimonialHome3Item {
  id: number;
  name: string;
  title: string;
  desc: string;
  img: string;
}
const DEFAULT_TESTIMONIALS: TestimonialHome3Item[] = [
  { id: 1, img: "/cdn/img/testimonial/person-1.jpg", name: "Mason Robinson", title: "UX 디자이너", desc: "명확한 가독성과 사용자 경험을 고려한 디자인이 인상적이었습니다. 많은 조사가 독자들이 더 나은 경험을 선호한다는 것을 보여줍니다." },
  { id: 2, img: "/cdn/img/testimonial/person-2.jpg", name: "David Cruso", title: "웹 개발자", desc: "구조가 분명하고 유지보수가 쉽습니다. 실제 사용자 조사 결과도 긍정적이었고, 서비스 품질에 만족합니다." },
  { id: 3, img: "/cdn/img/testimonial/person-3.jpg", name: "Naim Ahmed", title: "웹 개발자", desc: "직관적인 구성과 빠른 반응 속도가 좋았습니다. 재방문률이 높은 이유를 체험으로 이해했습니다." },
  { id: 4, img: "/cdn/img/testimonial/person-4.jpg", name: "Salim Rana", title: "워드프레스 전문가", desc: "전문성과 세심한 배려가 돋보이는 서비스였습니다. 추천할 만한 퀄리티라고 자신 있게 말씀드립니다." },
];
const { data: fetchedTestimonials } = await useAsyncData<TestimonialHome3Item[] | null>(
  "dp-testimonial-home3",
  () => dpAreaSvc.getFirstWidgetConfig<TestimonialHome3Item[]>("TESTIMONIAL_HOME3")
);
const testimonialSource = fetchedTestimonials.value?.length ? fetchedTestimonials.value : DEFAULT_TESTIMONIALS;
const nav_data = testimonialSource.map((t) => ({ id: t.id, img: t.img }));
const testimonial_data = testimonialSource.map((t) => ({ id: t.id, name: t.name, title: t.title, desc: t.desc }));

function slideTo(val: number) {
  currentSlide.value = val;
}
</script>

<style scoped lang="scss">
.carousel__track {
  transform-style: preserve-3d;
}

.testimonial__area {
  & .testimonial__nav {
    & .carousel__slide--active {
      & .testimonial__nav-thumb {
        & :deep(img) {
          opacity: 1;
          transform: scale(1);
        }
      }
    }
  }
}
</style>
