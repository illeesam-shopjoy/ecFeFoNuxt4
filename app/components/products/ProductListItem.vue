<template>
  <div class="product__wrapper mb-40 group">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="row">
      <div class="col-xl-4 col-lg-4">
        <!-- 2026-09-14(요청사항: "마우스 오버하면 리로드 효과로 보여주는데 비니, 원피스, 팔찌
             처럼 이미지 좀더 키지는 효과로 변경해줄수 있어?") — ProductItem.vue와 동일하게
             두 번째 이미지 전환 효과 대신 줌인 효과로 통일. -->
        <div class="product__thumb">
          <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="w-img">
            <app-image :src="item.img" alt="product-img" wrap-class="w-img" img-class="transition-transform duration-300 group-hover:scale-[1.2]" :skeleton-style="{ width: '100%', aspectRatio: '3/4' }" />
          </nuxt-link>
          <span v-if="prodTypeNm" class="pointer-events-none absolute left-2 top-2 z-[2] rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium leading-none text-white backdrop-blur-[2px]">{{ prodTypeNm }}</span>
          <prod-opt-chips :item="item" />
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
            <!-- 2026-09-20(요청사항: "상품항목에 상품번호, 상품유형(단품, 옵션상품..), 상품카테고리 표시" — 카테고리는 번호가 아니라 이름) -->
            <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] mb-2">
              <span class="text-[#a3a3a3]">#{{ item.prodId }}</span>
              <span v-if="item.category?.categoryNm" class="px-2 py-px rounded-full bg-[#f1f1f1] text-[#525252] leading-tight">{{ item.category.categoryNm }}</span>
            </div>
            <!-- 2026-09-14(요청사항: "브랜드정보 사이즈, 색상, 상품유형 표시해주면좋겠어") -->
            <div v-if="item.brand?.brandNm" class="text-[13px] text-[#a3a3a3] mb-1">{{ item.brand.brandNm }}</div>
            <div class="product__price-2 mb-10">
              <span>{{ formatPrice(item.salePrice) }}</span>
              <span v-if="item.stdPrice" class="old-price">{{ formatPrice(item.stdPrice) }}</span>
            </div>
            <!-- 2026-09-13(요청사항: "평가도 보여야 하고") — item.rating은 목록 조회에서는
                 리뷰 요약을 따로 안 불러와 항상 0이지만(상세 페이지에서만 채워짐), 별점 UI
                 구조 자체는 데모와 맞춰 노출해둔다. -->
            <div class="rating mb-10">
              <a v-for="n in 5" :key="n" href="#" @click.prevent><i class="text-[#f5a623]" :class="n <= Math.round(item.rating) ? 'fas fa-star' : 'fal fa-star'"></i></a>
            </div>
            <p>{{ item.smDesc }}</p>
          </div>
          <div class="add-cart-list flex flex-wrap items-center">
            <a @click.prevent="store.addStCartProduct(item)" href="#" class="add-cart-btn mr-10">+ 장바구니 추가</a>
            <div class="product__action-2 transition-3 mr-20">
              <!-- 2026-09-14(요청사항: "좋아요 클릭했는데 하드 좀더 분홍색으로 변경해줘") -->
              <a @click.prevent="wishlistState.addStWishlistProduct(item)" href="#" title="위시리스트에 담기">
                <i :class="[isWishlisted ? 'fas fa-heart !text-pink-500' : 'fal fa-heart']"></i>
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
import { ref, computed } from "vue";
import { type PdProdType } from "~/types/pd/pdProdType";
import ProductModal from "../modals/ProductModal.vue";
import AppImage from "~/components/ui/AppImage.vue";
import ProdOptChips from "~/components/products/ProdOptChips.vue";
import { prodTypeLabel } from "~/conts/pdConst";
import { useCartStore } from "~/store/useCartStore";
import { useCompareStore } from "~/store/useCompareStore";
import { useWishlistStore } from "~/store/useWishlistStore";

const props = defineProps<{
  item: PdProdType;
}>();
const prodTypeNm = computed(() => prodTypeLabel(props.item.prodTypeCd));
const store = useCartStore();
const compareState = useCompareStore();
const wishlistState = useWishlistStore();
const { formatPrice } = usePrice();
// 2026-09-14(요청사항: "좋아요 클릭했는데 하드 좀더 분홍색으로 변경해줘")
const isWishlisted = computed(() => wishlistState.wishlists.some((p) => p.prodId === props.item.prodId));
const productModalRef = ref<(InstanceType<typeof ProductModal> & { show(): void }) | null>(null);
function openQuickView() {
  store.initialStOrderQuantity();
  productModalRef.value?.show();
}
</script>

