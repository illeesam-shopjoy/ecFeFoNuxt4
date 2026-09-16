<template>
  <section class="product__area pt-60 pb-100">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 2026-09-13(요청사항: "인기상품 4열 상품 width를 우측란처럼 약간 크게해줘") —
         max-w-7xl(1280px)이 데모 대비 좁아 카드 4열이 작아 보였다.
         2026-09-14(요청사항: "인기상품 화면늘리면 15% 더 늘어나도 될거 같은데") — 1600px → 1840px(+15%). -->
    <div :class="`${style_2 ? 'custom-container' : style_3 ? 'container-fluid' : 'container'} mx-auto max-w-[1840px] px-4`">
      <div class="row">
        <div class="col-xl-12">
          <div :class="`section__title-wrapper text-center mb-55 ${style_2 ? 'p-relative' : ''}`">
            <div class="section__title mb-10">
              <h2>인기 상품</h2>
            </div>
            <div class="section__sub-title">
              <p>다양한 트렌드를 반영한 인기 상품을 만나보세요.</p>
            </div>
          </div>
        </div>
      </div>
      <div :class="`product__slider ${style_2 ? 'product__slider-4' : ''}`">
        <!-- 2026-09-14(요청사항: "인기상품은 한줄에 6개가 아니고 5개가 나와야해") — style_3(home-5)은
             col-xl-2(=6열)이 아니라 row-cols-xl-5(=5열, _grid.scss 기존 row-cols-lg-5/sm-5와 동일 패턴)를
             .row에 적용. 다른 style_3 사용처가 없어(home-5 전용) 영향 범위 안전. -->
        <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — row-cols-xl-5는
             _grid.scss가 제공하는 공용 Bootstrap 호환 그리드 유틸이라 그대로 두고(row-cols-lg-5/
             sm-5와 같은 성격), .row 거터 확장(-22.5px)만 Tailwind 임의값(-mx-[22.5px])으로
             인라인 전환. product__item 패딩(6px)도 px-1.5로 직접 부여. -->
        <div :class="`row ${style_3 ? 'row-cols-xl-5 -mx-[22.5px]' : ''}`">
          <div v-for="item in trending_prd" :key="item.prodId" class="col-lg-3 col-md-4 product__item px-1.5">
            <product-item :item="item" />
          </div>
        </div>
      </div>
      <div class="row" v-if="hasMore">
        <div class="col-xl-12">
          <div class="product__load-btn text-center mt-25">
            <a @click.prevent="handleLoadMore" href="#" class="os-btn os-btn-3">더 보기</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('트렌드 상품');
import { ref } from "vue";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { type PdProductType } from "~/types/pdProductType";
import ProductItem from "./ProductItem.vue";

const props = defineProps({
  style_2: { type: Boolean, default: false },
  style_3: { type: Boolean, default: false },
});

// 2026-09-17 버그수정: 예전엔 useProductsStore(전체 상품 최대 1000건 캐시)에서
// trending=true(항상 false — 실 스키마에 대응 컬럼 없음, mapProduct.ts 참조) 필터 후
// 없으면 전체로 대체하는 방식이었다. 결과적으로 "화면엔 8~12개만 보여주려고 매번 전체
// 카탈로그를 통째로 받아오는" 구조였는데, 상품이 631건까지 늘면서 그 전체조회 자체가
// 15초 가까이 걸려 타임아웃(502)이 나 이 섹션이 통째로 비어 보이는 원인이 됐다
// ([[ecfefonuxt4-bff-migration-plan]] beApi 5초 타임아웃 참조). trending 플래그 자체가
// 실질적 의미가 없었으므로(항상 fallback), 처음부터 필요한 개수만 서버 페이징으로 받는다.
const initialSize = props.style_3 ? 12 : 8;
const pageNo = ref(1);
const hasMore = ref(false);
const loadingMore = ref(false);

const { data: firstPage } = await useAsyncData(`dp-trending-products-${initialSize}`, () => pdProductSvc.getPaged({ pageNo: 1, pageSize: initialSize }));
const trending_prd = ref<PdProductType[]>(firstPage.value?.items ?? []);
hasMore.value = firstPage.value?.hasMore ?? false;

// 2026-09-14(요청사항: "더보기 버튼 클릭하면 8개씩 더 나오게 해줘") — 이제 서버에서 다음 페이지를 실제로 더 받아온다.
async function handleLoadMore() {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  try {
    pageNo.value += 1;
    const res = await pdProductSvc.getPaged({ pageNo: pageNo.value, pageSize: 8 });
    trending_prd.value.push(...res.items);
    hasMore.value = res.hasMore;
  } finally {
    loadingMore.value = false;
  }
}
</script>

