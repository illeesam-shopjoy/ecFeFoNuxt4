<template>
  <div class="product__wrapper mb-60 group">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 2026-09-14(요청사항: "마우스 오버하면 리로드 효과로 보여주는데 비니, 원피스, 팔찌
         처럼 이미지 좀더 키지는 효과로 변경해줄수 있어?") — 기존엔 호버 시 두 번째 이미지
         (thumbImg)가 겹쳐 나타나는 "이미지 전환" 효과였는데, 카테고리 배너(CategoryArea.vue,
         _banner.scss .banner__item:hover img{transform:scale(1.1)})처럼 같은 이미지가 살짝
         확대되는 줌인 효과로 통일. 두 번째 이미지 오버레이는 제거하고 메인 이미지에
         group-hover:scale-[1.2](20%) 적용(.product__thumb가 overflow:hidden이라 확대된 부분은
         잘려서 카드 밖으로 넘치지 않음). -->
    <div class="product__thumb">
      <nuxt-link :to="`/prod-dtl/${item.prodId}`" class="w-img">
        <!-- AppImage: 스켈레톤 + noImage 내장 -->
        <app-image
          :src="item.img"
          alt="product-img"
          wrap-class="w-img"
          img-class="transition-transform duration-300 group-hover:scale-[1.2]"
          :skeleton-style="{ width: '100%', aspectRatio: '3/4' }"
        />
      </nuxt-link>
      <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — 테마 CSS(_shop.scss
           .product__action)가 opacity:0·visibility:hidden·scaleX(0)로 기본 숨김 처리하는 걸
           덮어쓰는 부분이라(요청사항: "default 다 보였으면 좋겠어"), 순서 상관없이 이기도록
           !important 변형 사용. -->
      <!-- 2026-09-20(요청사항: "좋아요, 상품비교, 상품상세 아이콘란 우측면에 더 배치하고 바탕색은 가급적 없으면") — product__action--bare:
             흰 배경·패딩·구분선을 없애고 오른쪽 가장자리로 붙였다(_shop.scss). 배경이 없어도 사진 위에서 보이도록 아이콘에 흰색 글로우. -->
      <div class="product__action product__action--bare transition-3 !visible !opacity-100 !scale-x-100">
        <!-- 2026-09-14(요청사항: "좋아요 클릭했는데 하드 좀더 분홍색으로 변경해줘") — 클릭해도
             하트 아이콘이 그대로라 담겼는지 눈으로 구분이 안 됐다. 위시리스트에 담긴 상태면
             채워진 하트(fas)로 바꾸고 분홍색을 입혀 클릭 결과가 바로 보이게 한다. -->
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
      <div v-if="item.saleDiscntRate || item.isNew" class="product__sale">
        <span v-if="item.isNew || item.saleDiscntRate" class="new">신상품</span>
        <span v-if="item.saleDiscntRate" class="percent">-{{ item.saleDiscntRate }}%</span>
      </div>
    </div>
    <div class="product__content relative">
      <div class="product__content-inner">
        <!-- 2026-09-13(요청사항: "상품항목정보가 작아보여 크게 보여줘") — 테마 기본값(h4/가격 14px)이
             데모 대비 작아 보여 text-base(16px)로 키움. -->
        <h4 class="!text-base">
          <nuxt-link :to="`/prod-dtl/${item.prodId}`">
            <span v-html="item.prodNm"></span>
          </nuxt-link>
        </h4>
        <!-- 2026-09-20(요청사항: "상품항목에 상품번호, 상품유형(단품, 옵션상품..), 상품카테고리 표시" — 카테고리는 번호가 아니라 이름) -->
        <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] mb-2">
          <span class="text-[#a3a3a3]">#{{ item.prodId }}</span>
          <span v-if="prodTypeNm" class="px-2 py-px rounded-full border border-[#d4d4d4] text-[#737373] leading-tight">{{ prodTypeNm }}</span>
          <span v-if="item.category?.categoryNm" class="px-2 py-px rounded-full bg-[#f1f1f1] text-[#525252] leading-tight">{{ item.category.categoryNm }}</span>
        </div>
        <!-- 2026-09-14(요청사항: "브랜드정보 사이즈, 색상, 상품유형 표시해주면좋겠어") -->
        <div v-if="item.brand?.brandNm" class="text-[12px] text-[#a3a3a3] mb-2">{{ item.brand.brandNm }}</div>
        <div v-if="item.optionSizes?.length || item.optionColors?.length" class="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#c2c2c2] mb-2">
          <span v-if="item.optionSizes?.length">{{ item.optionSizes.map((o) => o.optionNm).join('/') }}</span>
          <span v-if="item.optionSizes?.length && item.optionColors?.length">|</span>
          <span v-if="item.optionColors?.length">{{ item.optionColors.map((o) => o.optionNm).join('/') }}</span>
        </div>
        <div class="product__price transition-3">
          <span class="!text-base">{{ formatPrice(item.salePrice) }}</span>
          <span v-if="item.stdPrice" class="old-price !text-base">{{ formatPrice(item.stdPrice) }}</span>
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
import { ref, computed } from "vue";
import { type PdProductType } from "~/types/pdProductType";
import { useCartStore } from "~/store/useCartStore";
import { useWishlistStore } from "~/store/useWishlistStore";
import { useCompareStore } from "~/store/useCompareStore";
import ProductModal from "../modals/ProductModal.vue";
import AppImage from "~/components/ui/AppImage.vue";
import { prodTypeLabel } from "~/conts/pdConst";

const props = defineProps<{
  item: PdProductType;
}>();
const prodTypeNm = computed(() => prodTypeLabel(props.item.prodTypeCd));
const store = useCartStore();
const wishlistState = useWishlistStore();
const compareState = useCompareStore();
const { formatPrice } = usePrice();
// 2026-09-14(요청사항: "좋아요 클릭했는데 하드 좀더 분홍색으로 변경해줘")
const isWishlisted = computed(() => wishlistState.wishlists.some((p) => p.prodId === props.item.prodId));
const productModalRef = ref<(InstanceType<typeof ProductModal> & { show(): void }) | null>(null);
function openQuickView() {
  store.initialStOrderQuantity();
  productModalRef.value?.show();
}
</script>

