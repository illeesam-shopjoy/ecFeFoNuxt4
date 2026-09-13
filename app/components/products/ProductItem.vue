<template>
  <div class="product__wrapper mb-60">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="product__thumb">
      <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="w-img">
        <!-- AppImage: 스켈레톤 + noImage 내장 -->
        <app-image :src="item.img" alt="product-img" wrap-class="w-img" img-class="" :skeleton-style="{ width: '100%', aspectRatio: '3/4' }" />
        <app-image class="product__thumb-2" :src="item.thumbImg" alt="product-img" wrap-class="product__thumb-2-wrap" img-class="" :skeleton-style="{ width: '100%', aspectRatio: '3/4' }" />
      </nuxt-link>
      <div class="product__action transition-3">
        <a @click.prevent="wishlistState.addStWishlistProduct(item)" href="#" title="위시리스트에 담기">
          <i class="fal fa-heart"></i>
        </a>
        <a @click.prevent="compareState.addStCompareProduct(item)" href="#" title="비교하기">
          <i class="fal fa-sliders-h"></i>
        </a>
        <a @click.prevent="openQuickView" href="#">
          <i class="fal fa-search"></i>
        </a>
      </div>
      <div v-if="item.saleDiscntRate || item.isNew" class="product__sale">
        <span v-if="item.isNew || item.saleDiscntRate" class="new">신상품</span>
        <span v-if="item.saleDiscntRate" class="percent">-{{ item.saleDiscntRate }}%</span>
      </div>
    </div>
    <div class="product__content relative">
      <div class="product__content-inner">
        <!-- 2026-09-13(요청사항: "상품항목정보가 작아보여 크게 보여줘") — 상품명을 h4로 감싸
             테마 CSS(.product__content h4)가 의도한 폰트를 그대로 받게 하고, 아래 스타일에서
             데모 수준으로 크기를 키움. -->
        <h4>
          <nuxt-link :to="`/prod-dtl/${item.prodId}`">
            <span v-html="item.prodNm"></span>
          </nuxt-link>
        </h4>
        <div class="product__price transition-3">
          <span>{{ formatPrice(item.salePrice) }}</span>
          <span v-if="item.stdPrice" class="old-price">{{ formatPrice(item.stdPrice) }}</span>
        </div>
      </div>
      <div class="add-cart absolute transition-3">
        <a @click.prevent="store.addStCartProduct(item)" href="#">+ 장바구니 추가</a>
      </div>
    </div>
  </div>

  <product-modal ref="productModalRef" :item="item" />
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle("상품 아이템");
import { ref } from "vue";
import { type PdProductType } from "~/types/pdProductType";
import { useCartStore } from "~/store/useCartStore";
import { useWishlistStore } from "~/store/useWishlistStore";
import { useCompareStore } from "~/store/useCompareStore";
import ProductModal from "../modals/ProductModal.vue";
import AppImage from "~/components/ui/AppImage.vue";

defineProps<{
  item: PdProductType;
}>();
const store = useCartStore();
const wishlistState = useWishlistStore();
const compareState = useCompareStore();
const { formatPrice } = usePrice();
const productModalRef = ref<(InstanceType<typeof ProductModal> & { show(): void }) | null>(null);
function openQuickView() {
  store.initialStOrderQuantity();
  productModalRef.value?.show();
}
</script>

<style scoped>
/* 2026-09-13(요청사항: "상품항목정보가 작아보여 크게 보여줘") — 테마 기본값(h4 14px, 가격 14px)이
   데모 대비 작아 보여 상품명/가격을 조금 더 키움. */
.product__content h4 {
  font-size: 16px;
}
.product__price span {
  font-size: 16px;
}
</style>
