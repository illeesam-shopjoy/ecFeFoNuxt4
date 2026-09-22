<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="위시리스트" subtitle="위시리스트" />
    <client-only>
      <section class="cart-area pt-[16px] md:pt-[100px] pb-100">
        <div class="max-w-7xl mx-auto px-4">
          <div class="row">
            <div class="col-12">
              <div v-if="state.wishlists.length === 0" class="text-center">
                <h3>위시리스트에 담긴 상품이 없습니다</h3>
                <nuxt-link class="os-btn os-btn-black mt-20" to="/shop"> 쇼핑하기 </nuxt-link>
              </div>
              <form v-if="state.wishlists.length > 0" action="#">
                <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — 위시리스트 표를 <fo-grid> 로 교체(셀은 슬롯으로 커스텀) -->
                <fo-grid bare min-width="640px" empty-text="위시리스트에 담긴 상품이 없습니다" :columns="columns" :rows="state.wishlists">
            <template #cell-img="{ row }">
              <td class="text-center">
                <nuxt-link :to="`/prod-dtl/${row.prodId}`">
                  <app-image :src="row.img" :alt="row.prodNm" :img-style="{ width: '80px', height: '100px', objectFit: 'cover' }" :skeleton-style="{ width: '80px', height: '100px' }" />
                </nuxt-link>
              </td>
            </template>
            <template #cell-prodNm="{ row }">
              <!-- 2026-09-22(요청사항: "위시리스트,장바구니목록,상품비교 옵션상품의 경우도 있으면 표시해주고") -->
              <td class="text-left">
                <span v-if="prodTypeLabel(row.prodTypeCd)" class="mr-1.5 rounded-full bg-[#f1f1f1] px-2 py-px text-[11px] font-medium leading-tight text-[#525252]">{{ prodTypeLabel(row.prodTypeCd) }}</span>
                <nuxt-link :to="`/prod-dtl/${row.prodId}`"><span v-html="row.prodNm"></span></nuxt-link>
              </td>
            </template>
                  <template #cell-salePrice="{ row }">
                    <td class="text-right"><span class="amount">{{ formatPrice(row.salePrice) }}</span></td>
                  </template>
                  <template #cell-cart="{ row }">
                    <td class="text-center"><button class="os-btn os-btn-black" type="button" @click.prevent="handleBtnAction('wish-addCart', row)">장바구니에 담기</button></td>
                  </template>
                  <template #cell-remove="{ row }">
                    <td class="text-center cursor-pointer" @click.prevent="handleBtnAction('wish-remove', row)"><i class="fa fa-times"></i></td>
                  </template>
                </fo-grid>
              </form>
            </div>
          </div>
        </div>
      </section>
    </client-only>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { onMounted } from "vue";
import { useCartStore } from "~/store/useCartStore";
import { useWishlistStore } from "~/store/useWishlistStore";
import AppImage from "~/components/ui/AppImage.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import { prodTypeLabel } from "~/conts/pdConst";
import type { FoGridColumn } from "~/types/fo/foCompType";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "위시리스트",
});
usePageTitle("위시리스트");

const state = useWishlistStore();
const columns: FoGridColumn[] = [
  { key: "img", label: "이미지", width: "110px" },
  { key: "prodNm", label: "상품", align: "left" },
  { key: "salePrice", label: "단가", width: "130px", align: "right" },
  { key: "cart", label: "장바구니", width: "170px", align: "center" },
  { key: "remove", label: "삭제", width: "70px", align: "center" },
];
const cartState = useCartStore();
const { formatPrice } = usePrice();
onMounted(() => {
  state.getStWishlistProducts;
});

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ wishlist.vue : handleBtnAction -> ", cmd, param);
  // 장바구니에 담기 (param: 상품)
  if (cmd === "wish-addCart") {
    return cartState.addStCartProduct(param as never);
  // 위시리스트에서 삭제 (param: 상품)
  } else if (cmd === "wish-remove") {
    return state.removeStWishlist(param as never);
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
