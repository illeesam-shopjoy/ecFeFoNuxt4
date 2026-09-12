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
                <div class="table-content table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th class="product-thumbnail">이미지</th>
                        <th class="cart-product-name">상품</th>
                        <th class="product-price">단가</th>
                        <th class="product-quantity">수량</th>
                        <th class="product-subtotal">합계</th>
                        <th class="product-remove">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, i) in state.wishlists" :key="i">
                        <td class="product-thumbnail">
                          <nuxt-link :to="`/prod-dtl/${item.prodId}`">
                            <app-image :src="item.img" :alt="item.prodNm" :img-style="{ width: '80px', height: '100px', objectFit: 'cover' }" :skeleton-style="{ width: '80px', height: '100px' }" />
                          </nuxt-link>
                        </td>
                        <td class="product-name">
                          <nuxt-link :to="`/prod-dtl/${item.prodId}`">
                            <span v-html="item.prodNm"></span>
                          </nuxt-link>
                        </td>
                        <td class="product-price">
                          <span class="amount">{{ formatPrice(item.salePrice) }}</span>
                        </td>
                        <td class="product-quantity" @click.prevent="cartState.addStCartProduct(item)">
                          <button class="os-btn os-btn-black" type="submit">장바구니에 담기</button>
                        </td>
                        <td class="product-subtotal">
                          <span class="amount">{{ formatPrice(item.salePrice) }}</span>
                        </td>
                        <td class="product-remove" @click.prevent="state.removeStWishlist(item)">
                          <a href="#">
                            <i class="fa fa-times"></i>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "위시리스트",
});
usePageTitle("위시리스트");

const state = useWishlistStore();
const cartState = useCartStore();
const { formatPrice } = usePrice();
onMounted(() => {
  state.getStWishlistProducts;
});
</script>
