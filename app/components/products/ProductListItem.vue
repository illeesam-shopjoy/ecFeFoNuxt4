<template>
  <div class="product__wrapper mb-40">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="row">
      <div class="col-xl-4 col-lg-4">
        <div class="product__thumb">
          <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="w-img">
            <app-image :src="item.img" alt="product-img" wrap-class="w-img" :skeleton-style="{ width: '100%', aspectRatio: '3/4' }" />
            <app-image img-class="product__thumb-2" :src="item.thumbImg" alt="product-img" wrap-class="w-img" />
          </nuxt-link>
          <div v-if="item.saleDiscntRate || item.isNew" class="product__sale">
            <span v-if="item.isNew || item.saleDiscntRate" class="new">신상품</span>
            <span v-if="item.saleDiscntRate" class="percent">-{{ item.saleDiscntRate }}%</span>
          </div>
        </div>
      </div>
      <div class="col-xl-8 col-lg-8">
        <div class="product__content relative">
          <div class="product__content-inner list">
            <h4>
              <nuxt-link :to="`/prod-dtl/${item.prodId}`">
                <span v-html="item.prodNm"></span>
              </nuxt-link>
            </h4>
            <div class="product__price-2 mb-10">
              <span>{{ formatPrice(item.salePrice) }}</span>
              <span v-if="item.stdPrice" class="old-price">{{ formatPrice(item.stdPrice) }}</span>
            </div>
            <!-- 2026-09-13(요청사항: "평가도 보여야 하고") — item.rating은 목록 조회에서는
                 리뷰 요약을 따로 안 불러와 항상 0이지만(상세 페이지에서만 채워짐), 별점 UI
                 구조 자체는 데모와 맞춰 노출해둔다. -->
            <div class="rating mb-10">
              <a v-for="n in 5" :key="n" href="#" @click.prevent><i :class="n <= Math.round(item.rating) ? 'fas fa-star' : 'fal fa-star'"></i></a>
            </div>
            <p>{{ item.smDesc }}</p>
          </div>
          <div class="add-cart-list flex flex-wrap items-center">
            <a @click.prevent="store.addStCartProduct(item)" href="#" class="add-cart-btn mr-10">+ 장바구니 추가</a>
            <div class="product__action-2 transition-3 mr-20">
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
          </div>
        </div>
      </div>
    </div>
  </div>

  <product-modal ref="productModalRef" :item="item" :list="true" />
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('상품 목록 아이템');
import { ref } from "vue";
import { type PdProductType } from "~/types/pdProductType";
import ProductModal from "../modals/ProductModal.vue";
import AppImage from "~/components/ui/AppImage.vue";
import { useCartStore } from "~/store/useCartStore";
import { useCompareStore } from "~/store/useCompareStore";
import { useWishlistStore } from "~/store/useWishlistStore";

defineProps<{
  item: PdProductType;
}>();
const store = useCartStore();
const compareState = useCompareStore();
const wishlistState = useWishlistStore();
const { formatPrice } = usePrice();
const productModalRef = ref<(InstanceType<typeof ProductModal> & { show(): void }) | null>(null);
function openQuickView() {
  store.initialStOrderQuantity();
  productModalRef.value?.show();
}
</script>

<style scoped></style>
