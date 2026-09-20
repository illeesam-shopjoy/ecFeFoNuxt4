<template>
  <div class="product__wrapper group">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 2026-09-14(요청사항: "마우스 오버하면 리로드 효과로 보여주는데 ... 이미지 좀더 키지는
         효과로 변경해줄수 있어?" → "다른상품목록 이미지들도 이 효과 넣어줘") — ProductItem.vue와
         동일하게 두 번째 이미지 전환 효과 대신 20% 줌인 효과로 통일. -->
    <div class="product__thumb">
      <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="w-img">
        <app-image :src="item.img" alt="product-img" wrap-class="w-img" img-class="transition-transform duration-300 group-hover:scale-[1.2]" :skeleton-style="{ width: '100%', aspectRatio: '3/4' }" />
      </nuxt-link>
      <div class="product__action-3 transition-3">
        <a @click.prevent="store.addStCartProduct(item)" href="#" class="action-btn"> <i class="fal fa-plus"></i>장바구니 담기 </a>
        <a @click.prevent="openQuickView" href="#" class="action-btn">
          <i class="fal fa-eye"></i>
        </a>
      </div>
      <div v-if="item.saleDiscntRate || item.isNew" class="product__sale product__sale-3">
        <span v-if="item.isNew || item.saleDiscntRate" class="new">신상품</span>
        <span v-if="item.saleDiscntRate" class="percent">-{{ item.saleDiscntRate }}%</span>
      </div>
    </div>
    <div class="product__content product__content-2 relative text-center">
      <div class="product__content-inner">
        <div class="rating">
          <a href="#"><i class="fal fa-star"></i></a>
          <a href="#"><i class="fal fa-star"></i></a>
          <a href="#"><i class="fal fa-star"></i></a>
          <a href="#"><i class="fal fa-star"></i></a>
          <a href="#"><i class="fal fa-star"></i></a>
        </div>
        <h4>
          <nuxt-link :to="`/prod-dtl/${item.prodId}`">
            <span v-html="item.prodNm"></span>
          </nuxt-link>
        </h4>
        <div class="product__price-3">
          <span>{{ formatPrice(item.salePrice) }}</span>
          <span v-if="item.stdPrice" class="old-price"
            ><del>{{ formatPrice(item.stdPrice) }}</del></span
          >
        </div>
      </div>
    </div>
  </div>

  <product-modal ref="productModalRef" :item="item" />
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('상품 아이템 2');
import { ref } from "vue";
import { type PdProdType } from "~/types/pd/pdProdType";
import { useCartStore } from "~/store/useCartStore";
import ProductModal from "../modals/ProductModal.vue";
import AppImage from "~/components/ui/AppImage.vue";

defineProps<{
  item: PdProdType;
}>();
const store = useCartStore();
const { formatPrice } = usePrice();
const productModalRef = ref<(InstanceType<typeof ProductModal> & { show(): void }) | null>(null);
function openQuickView() {
  store.initialStOrderQuantity();
  productModalRef.value?.show();
}
</script>
