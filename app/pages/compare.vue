<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="비교" subtitle="비교" />
    <section class="compare__area pt-[16px] md:pt-[120px] pb-120">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-12">
            <client-only>
              <div v-if="state.compare.length === 0" class="text-center">
                <h3>비교할 상품이 없습니다</h3>
                <nuxt-link class="os-btn os-btn-black mt-20" to="/shop"> 쇼핑하기 </nuxt-link>
              </div>
              <!-- 2026-09-22(요청사항: "상품비교 화면 좀 찌그러저 보여") — 열 너비를 콘텐츠(설명 길이 등)에 맡기면 상품마다
                   칸 너비가 달라져 이미지 정사각형 크기가 서로 달라 보였다. table-layout:fixed + 라벨열만 고정폭으로 두면
                   나머지 상품 열은 남은 폭을 항상 똑같이 나눠 갖는다. -->
              <div v-if="state.compare.length > 0" class="tp-compare-table tp-compare-table--fixed text-center">
                <table class="table table-responsive">
                  <tbody>
                    <tr>
                      <th>상품</th>
                      <td v-for="(item, i) in state.compare" :key="i">
                        <div class="tp-compare-thumb">
                          <app-image :src="item.img" :alt="item.prodNm" :skeleton-style="{ width: '100%', aspectRatio: '1/1' }" />
                          <!-- 2026-09-22(요청사항: "위시리스트,장바구니목록,상품비교 옵션상품의 경우도 있으면 표시해주고") -->
                          <span v-if="prodTypeLabel(item.prodTypeCd)" class="mb-1 inline-block rounded-full bg-[#f1f1f1] px-2 py-px text-[11px] font-medium leading-tight text-[#525252]">{{ prodTypeLabel(item.prodTypeCd) }}</span>
                          <h4 class="tp-compare-product-title">
                            <a href="#" v-html="item.prodNm"></a>
                          </h4>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>설명</th>
                      <td v-for="(item, i) in state.compare" :key="i">
                        <div class="tp-compare-desc">
                          <p>{{ item.smDesc }}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>가격</th>
                      <td v-for="(item, i) in state.compare" :key="i">
                        <div class="tp-compare-price">
                          <span>{{ formatPrice(item.salePrice) }}</span>
                          <span v-if="item.stdPrice" class="old-price">{{ formatPrice(item.stdPrice) }}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>장바구니 담기</th>
                      <td v-for="(item, i) in state.compare" :key="i">
                        <div @click.prevent="cartState.addStCartProduct(item)" class="tp-compare-add-to-cart">
                          <a href="#" class="os-btn os-btn-black">장바구니에 담기</a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>평점</th>
                      <td v-for="(item, i) in state.compare" :key="i">
                        <div class="tp-compare-rating">
                          <span><i class="fas fa-star"></i></span>
                          <span><i class="fas fa-star"></i></span>
                          <span><i class="fas fa-star"></i></span>
                          <span><i class="fas fa-star"></i></span>
                          <span><i class="fas fa-star"></i></span>
                          <strong class="mx-2">{{ item.rating }}</strong>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>삭제</th>
                      <td v-for="(item, i) in state.compare" :key="i">
                        <div class="tp-compare-remove">
                          <button @click="state.removeStCompare(item)">
                            <i class="fal fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </client-only>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { onMounted } from "vue";
import { useCartStore } from "~/store/useCartStore";
import { useCompareStore } from "~/store/useCompareStore";
import AppImage from "~/components/ui/AppImage.vue";
import { prodTypeLabel } from "~/conts/pdConst";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "비교",
});
usePageTitle("비교");

const state = useCompareStore();
const cartState = useCartStore();
const { formatPrice } = usePrice();
onMounted(() => {
  state.getStCompareProducts;
});
</script>

<style scoped>
/* 2026-09-22(요청사항: "상품비교 화면 좀 찌그러저 보여") — 라벨 열만 고정폭, 나머지 상품 열은 fixed 레이아웃에서
   남은 폭을 항상 똑같이 나눠 가진다(콘텐츠 길이로 열 너비가 들쭉날쭉해지는 것 방지). */
.tp-compare-table--fixed table {
  table-layout: fixed;
  width: 100%;
}
.tp-compare-table--fixed th {
  width: 90px;
}
</style>
