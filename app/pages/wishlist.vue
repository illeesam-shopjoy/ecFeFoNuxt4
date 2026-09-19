<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="위시리스트" subtitle="위시리스트" />
    <client-only>
      <section class="cart-area pt-100 pb-100">
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
              <td class="text-left">
                <nuxt-link :to="`/prod-dtl/${row.prodId}`"><span v-html="row.prodNm"></span></nuxt-link>
              </td>
            </template>
                  <template #cell-salePrice="{ row }">
                    <td class="text-right"><span class="amount">{{ formatPrice(row.salePrice) }}</span></td>
                  </template>
                  <template #cell-cart="{ row }">
                    <td class="text-center"><button class="os-btn os-btn-black" type="button" @click.prevent="cartState.addStCartProduct(row)">장바구니에 담기</button></td>
                  </template>
                  <template #cell-remove="{ row }">
                    <td class="text-center cursor-pointer" @click.prevent="state.removeStWishlist(row)"><i class="fa fa-times"></i></td>
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
import type { FoGridColumn } from "~/types/foCompType";

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
</script>
