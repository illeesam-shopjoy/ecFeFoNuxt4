<template>
  <div class="features__product-wrapper flex mb-20 group">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 2026-09-14(요청사항: "다른상품목록 이미지들도 이 효과 넣어줘") — ProductItem.vue와
         동일한 20% 줌인 호버 효과. overflow-hidden을 직접 부여해(부모 .features__product-thumb는
         테마 CSS에 overflow:hidden이 없음) 확대된 이미지가 카드 밖으로 넘치지 않게 한다. -->
    <div class="features__product-thumb mr-15 overflow-hidden">
      <nuxt-link :to="`/prod-dtl/${prd.prodId}`">
        <app-image
          :src="prd.img"
          alt="pro-sm-1"
          :img-style="{ width: '86px', height: '110px', objectFit: 'cover' }"
          img-class="transition-transform duration-300 group-hover:scale-[1.2]"
          :skeleton-style="{ width: '86px', height: '110px' }"
        />
      </nuxt-link>
    </div>
    <div class="features__product-content">
      <h5>
        <nuxt-link :to="`/prod-dtl/${prd.prodId}`">
          <span v-html="prd.prodNm"></span>
        </nuxt-link>
      </h5>
      <div v-if="prd.topRated" class="rating rating-shop mb-5">
        <ul>
          <li>
            <span><i class="fas fa-star"></i></span>
          </li>
          <li>
            <span><i class="fas fa-star"></i></span>
          </li>
          <li>
            <span><i class="fas fa-star"></i></span>
          </li>
          <li>
            <span><i class="fas fa-star"></i></span>
          </li>
          <li>
            <span><i class="fal fa-star"></i></span>
          </li>
        </ul>
      </div>
      <div class="price">
        <span>{{ formatPrice(prd.salePrice) }}</span>
        <span v-if="prd.saleDiscntRate" class="price-old">
          {{ formatPrice(prd.salePrice - (prd.salePrice * prd.saleDiscntRate) / 100) }}
        </span>
        <div class="add-cart absolute transition-3">
          <a @click.prevent="state.addStCartProduct(prd)" href="#">+ 장바구니 추가</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('상품 아이템 (소)');
import { useCartStore } from "~/store/useCartStore";
import { type PdProductType } from "~/types/pdProductType";
import AppImage from "~/components/ui/AppImage.vue";

defineProps<{
  prd: PdProductType;
}>();
const state = useCartStore();
const { formatPrice } = usePrice();
</script>
