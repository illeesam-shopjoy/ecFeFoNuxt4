<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="장바구니" subtitle="장바구니" />
    <client-only>
      <section class="cart-area pt-100 pb-100">
        <div class="max-w-7xl mx-auto px-4">
          <div class="row">
            <div class="col-12">
              <div v-if="state.cartProducts.length === 0" class="text-center">
                <h3>장바구니에 상품이 없습니다</h3>
                <nuxt-link class="os-btn os-btn-black mt-20" to="/shop"> 쇼핑하기 </nuxt-link>
              </div>
              <form v-if="state.cartProducts.length > 0" action="#">
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
                      <tr v-for="(item, i) in state.cartProducts" :key="i">
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
                        <td class="product-quantity">
                          <div class="cart-plus-minus">
                            <input type="text" v-model="item.orderQuantity" />
                            <div @click="state.setStQuantityDecrement(item)" class="dec qtybutton">-</div>
                            <div @click="state.addStCartProduct(item)" class="inc qtybutton">+</div>
                          </div>
                        </td>
                        <td class="product-subtotal">
                          <span class="amount">{{ formatPrice((item.orderQuantity ?? 0) * item.salePrice) }}</span>
                        </td>
                        <td class="product-remove" @click.prevent="state.removerStCartProducts(item)">
                          <a href="#">
                            <i class="fa fa-times"></i>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="row">
                  <div class="col-12">
                    <div class="coupon-all">
                      <div class="coupon">
                        <input required id="coupon_code" class="input-text" name="coupon_code" value="" placeholder="쿠폰 코드" type="text" />
                        <button class="os-btn os-btn-black" name="apply_coupon" type="button">쿠폰 적용</button>
                      </div>
                      <div class="coupon2">
                        <button @click="state.clearStCart" class="os-btn os-btn-black" name="update_cart" type="button">장바구니 비우기</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-5 ms-auto">
                    <div class="cart-page-total">
                      <h2>장바구니 합계</h2>
                      <ul class="mb-20">
                        <li>
                          소계 <span>{{ formatPrice(state.getStTotalPriceQuantity.total) }}</span>
                        </li>
                        <li>
                          합계 <span>{{ formatPrice(state.getStTotalPriceQuantity.total) }}</span>
                        </li>
                      </ul>
                      <nuxt-link class="os-btn" href="/checkout">주문/결제하기</nuxt-link>
                    </div>
                  </div>
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
import { useCartStore } from "~/store/useCartStore";
import AppImage from "~/components/ui/AppImage.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "장바구니",
});
usePageTitle("장바구니");

const state = useCartStore();
const { formatPrice } = usePrice();
</script>
