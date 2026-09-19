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
                <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — 장바구니 표를 <fo-grid> 로 교체(셀은 슬롯으로 커스텀) -->
                <fo-grid bare min-width="640px" empty-text="장바구니에 상품이 없습니다" :columns="columns" :rows="state.cartProducts">
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
                  <template #cell-orderQuantity="{ row }">
                    <td class="text-center">
                      <div class="cart-plus-minus">
                        <input type="text" v-model="row.orderQuantity" />
                        <div @click="handleBtnAction('cart-qtyDec', row)" class="dec qtybutton">-</div>
                        <div @click="handleBtnAction('cart-qtyInc', row)" class="inc qtybutton">+</div>
                      </div>
                    </td>
                  </template>
                  <template #cell-subtotal="{ row }">
                    <td class="text-right"><span class="amount">{{ formatPrice((row.orderQuantity ?? 0) * row.salePrice) }}</span></td>
                  </template>
                  <template #cell-remove="{ row }">
                    <td class="text-center cursor-pointer" @click.prevent="handleBtnAction('cart-remove', row)"><i class="fa fa-times"></i></td>
                  </template>
                </fo-grid>
                <div class="row">
                  <div class="col-12">
                    <div class="coupon-all">
                      <div class="coupon">
                        <input required id="coupon_code" class="input-text" name="coupon_code" value="" placeholder="쿠폰 코드" type="text" />
                        <button class="os-btn os-btn-black" name="apply_coupon" type="button">쿠폰 적용</button>
                      </div>
                      <div class="coupon2">
                        <button @click="handleBtnAction('cart-clear')" class="os-btn os-btn-black" name="update_cart" type="button">장바구니 비우기</button>
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
                      <!-- 2026-09-14(요청사항: "주문/결제하기 버튼이 흰색이라 잘 안보여" →
                           "버튼 좌측에 있는데 우측에 배치해줘") — 기존 os-btn은 배경이
                           투명이라 흰 페이지 위에서 거의 안 보였다. os-btn-black으로 확실히
                           눈에 띄게 하고, inline-block 버튼이라 text-right로 감싸서 합계
                           박스 우측에 맞춘다(위 소계/합계 금액도 우측 정렬). -->
                      <div class="text-right">
                        <nuxt-link class="os-btn os-btn-black" href="/checkout">주문/결제하기</nuxt-link>
                      </div>
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
import FoGrid from "~/components/fo/FoGrid.vue";
import type { FoGridColumn } from "~/types/foCompType";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "장바구니",
});
usePageTitle("장바구니");

const state = useCartStore();
const columns: FoGridColumn[] = [
  { key: "img", label: "이미지", width: "110px" },
  { key: "prodNm", label: "상품", align: "left" },
  { key: "salePrice", label: "단가", width: "130px", align: "right" },
  { key: "orderQuantity", label: "수량", width: "150px", align: "center" },
  { key: "subtotal", label: "합계", width: "130px", align: "right" },
  { key: "remove", label: "삭제", width: "70px", align: "center" },
];
const { formatPrice } = usePrice();

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ cart.vue : handleBtnAction -> ", cmd, param);
  // 수량 감소 (param: 장바구니 항목)
  if (cmd === "cart-qtyDec") {
    return state.setStQuantityDecrement(param as never);
  // 수량 증가 (param: 장바구니 항목)
  } else if (cmd === "cart-qtyInc") {
    const item = param as { selectedProdSkuId?: string };
    return state.addStCartProduct(param as never, item.selectedProdSkuId);
  // 항목 삭제 (param: 장바구니 항목)
  } else if (cmd === "cart-remove") {
    return state.removerStCartProducts(param as never);
  // 장바구니 비우기
  } else if (cmd === "cart-clear") {
    return state.clearStCart();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
