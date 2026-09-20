<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="상품 상세" subtitle="상품 상세" />

    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-product-detail v-if="pending" />

    <!-- 상품 상세 -->
    <template v-else-if="item">
      <section class="shop__area pb-[110px]">
        <div class="shop__top bg-white pt-60 pb-60">
          <div class="max-w-7xl mx-auto px-4">
            <div class="row">
              <div class="col-xl-6 col-lg-6">
                <!-- 2026-09-20(요청사항: 상품상세를 ecFeBo 처럼 개선) — 메인 이미지 확대 보기, 하단 가로 썸네일(기본이미지 뱃지), 라이트박스는 ProdGallery.
                     예전엔 세로 썸네일 스트립 + 고정 문구 "new / -16%" 였다. -->
                <prod-gallery :item="item" />
              </div>
              <div class="col-xl-6 col-lg-6">
                <product-details-content ref="detailRef" :item="item" :style_2="true" detail @inquiry="scrollToSection('qna')" />
              </div>
            </div>
          </div>
        </div>

        <div class="shop__bottom bg-white">
          <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — detail-tab-* 커스텀
               클래스를 Tailwind로 대체(JS ref="tabNavRef" 등 참조는 유지). -->
          <!-- 2026-09-14 버그수정(요청사항: "Top 을 가리면 안되고 / 원래 위치에 있던 정보가
               가려질때 고정되는거야") — Tailwind 유틸리티 클래스명 "sticky"가 _header.scss의
               사이트 헤더용 전역 규칙(.sticky { position: fixed !important; top:0; z-index:999 })과
               이름이 겹쳐서, position:sticky가 아니라 position:fixed로 강제 적용되며 항상
               최상단에 고정돼버렸다(스크롤 위치와 무관하게, 헤더까지 가리며). 클래스명이 아니라
               [position:sticky] 임의 속성 문법으로 바꿔 이름 충돌을 피함 — 진짜 position:sticky가
               적용되어 원래 위치가 뷰포트 상단(헤더 높이만큼 아래)에 닿을 때만 고정된다. -->
          <div class="[position:sticky] z-40 bg-white border-b-2 border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.06)] min-h-[52px]" ref="tabNavRef" :style="{ top: headerH + 'px' }">
            <div class="max-w-7xl mx-auto px-4">
              <div class="flex justify-start sm:justify-center gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <!-- 2026-09-20(요청사항: 탭 강조) — 지금 보고 있는 섹션의 탭은 굵은 글씨 + 아래 밑줄 + 옅은 배경 -->
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  type="button"
                  :aria-current="activeTab === tab.id ? 'true' : undefined"
                  :class="[
                    'relative px-5 sm:px-7 py-4 text-base border-0 cursor-pointer transition-colors tracking-wide whitespace-nowrap after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:transition-colors',
                    activeTab === tab.id ? 'text-theme font-semibold bg-[#fbf6ee] after:bg-current' : 'font-medium bg-transparent text-gray-500 hover:text-gray-700 after:bg-transparent',
                  ]"
                  @click="scrollToSection(tab.id)"
                >{{ tab.label }}</button>
              </div>
            </div>
          </div>

          <div class="max-w-7xl mx-auto px-4">
            <!-- 상세정보 섹션 (2026-09-20: 상품설명 + 세탁 및 관리. 예전 "추가 정보"의 무게/치수/사이즈는 상품과 무관한 고정값이라 제거) -->
            <div ref="secDetail" id="sec-detail" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">상세정보</h2>
              <div class="mb-3.5 rounded-xl border border-[#e5e7eb] bg-white p-5 sm:p-7">
                <h3 class="mb-3.5 flex items-center gap-2 text-[0.95rem] font-bold text-gray-900"><span aria-hidden="true">📋</span> 상품 설명</h3>
                <!-- ecBeBo contentHtml 은 단일 HTML 블록. 서버 렌더(SEO 최소 정보)에는 비어 있고 브라우저가 전체 조회한 뒤 채워진다 -->
                <div v-if="item.contentHtml" class="product__details-des" v-html="item.contentHtml"></div>
                <p v-else-if="item.smDesc" class="text-[0.9rem] leading-[1.9] text-gray-600">{{ item.smDesc }}</p>
              </div>
              <div class="rounded-xl border border-[#e5e7eb] bg-white p-5 sm:p-7">
                <h3 class="mb-3.5 flex items-center gap-2 text-[0.95rem] font-bold text-gray-900"><span aria-hidden="true">🧺</span> 세탁 및 관리</h3>
                <ul class="m-0 flex list-none flex-col gap-3 p-0">
                  <li v-for="c in careItems" :key="c.label" class="flex items-start gap-3">
                    <span class="w-6 shrink-0 text-center text-lg" aria-hidden="true">{{ c.icon }}</span>
                    <span>
                      <span class="block text-[0.76rem] text-[#9ca3af]">{{ c.label }}</span>
                      <span class="block text-[0.9rem] text-gray-800">{{ c.value }}</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 사이즈 섹션 -->
            <div ref="secSize" id="sec-size" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">사이즈</h2>
              <prod-size-guide />
            </div>

            <!-- 리뷰 섹션 -->
            <div ref="secReview" id="sec-review" class="pt-14 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px] last:border-b-0">
              <div class="product__details-review">
                <div class="postbox__comments">
                  <!-- 제목: 리뷰(N)만 한 줄에 배치 -->
                  <div class="block mb-20">
                    <h3 class="m-0 text-[1.35rem] font-bold text-gray-900 pb-3 border-b-2 border-[#e5e7eb]">상품평 ({{ totalReviewCount }})</h3>
                  </div>
                  <!-- 첨부·모아보기는 그 아래 줄 -->
                  <div v-if="totalAttachmentCount > 0" class="flex flex-nowrap items-center gap-2 mb-20">
                    <span class="whitespace-nowrap text-sm text-gray-600">첨부 이미지·동영상 {{ totalAttachmentCount }}개</span>
                    <button type="button" class="os-btn os-btn-black whitespace-nowrap !text-sm !px-3 !py-1 !h-auto" @click="openAllMedia">모아보기</button>
                  </div>
                  <!-- 2026-09-20: 평점 요약(평균 + 별점 분포)과 정렬 — ecFeBo 상품평 -->
                  <div v-if="reviewList.length" class="mb-5 flex flex-wrap items-center gap-8 rounded-xl border border-[#e5e7eb] bg-white p-6">
                    <div class="text-center">
                      <div class="text-[2.6rem] font-black leading-none text-gray-900">{{ avgRating.toFixed(1) }}</div>
                      <div class="mt-1 text-[#f5a623]"><i v-for="st in 5" :key="st" :class="st <= Math.round(avgRating) ? 'fas fa-star' : 'fal fa-star'"></i></div>
                      <div class="mt-1 text-[0.8rem] text-[#9ca3af]">{{ reviewList.length }}개 리뷰</div>
                    </div>
                    <div class="flex min-w-[200px] flex-1 flex-col gap-1">
                      <div v-for="d in ratingDist" :key="d.star" class="flex items-center gap-2 text-[0.78rem] text-gray-600">
                        <span class="w-6 text-right">{{ d.star }}<i class="fas fa-star ml-0.5 text-[0.65rem] text-[#f5a623]"></i></span>
                        <div class="h-2 flex-1 overflow-hidden rounded bg-[#eee]"><div class="h-full bg-[#f5a623]" :style="{ width: d.pct + '%' }"></div></div>
                        <span class="w-9 text-right text-[#9ca3af]">{{ d.pct }}%</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="reviewList.length > 1" class="mb-5 flex flex-wrap gap-2">
                    <button
                      v-for="o in reviewSortOptions"
                      :key="o.id"
                      type="button"
                      :class="['cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.82rem] transition-colors', reviewSort === o.id ? 'border-[#222] bg-[#222] font-semibold text-white' : 'border-[#e5e7eb] bg-white text-gray-600 hover:border-[#999]']"
                      @click="reviewSort = o.id"
                    >{{ o.label }}</button>
                  </div>
                  <div class="latest-comments mb-30">
                    <ul>
                      <template v-for="review in sortedReviews" :key="review.reviewId">
                        <li>
                          <div class="flex items-start gap-4">
                            <div class="comments-avatar">
                              <app-image :src="review.img" :alt="review.writerNm" :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }" :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="avatar-name">
                                <h5>{{ review.writerNm }}</h5>
                                <span class="inline-flex gap-2 ml-1">
                                  <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] text-inherit hover:opacity-85" @click.prevent="startReply(review.reviewId)">답글 쓰기</button>
                                  <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] text-danger hover:opacity-85" @click.prevent="deleteReview(review.reviewId, false)">삭제</button>
                                </span>
                              </div>
                              <div class="user-rating">
                                <ul>
                                  <li v-for="s in 5" :key="s">
                                    <span><i :class="s <= review.rating ? 'fas fa-star' : 'fal fa-star'"></i></span>
                                  </li>
                                </ul>
                              </div>
                              <p>{{ review.reviewContent || '내용 없음' }}</p>
                            </div>
                            <div v-if="(review.attachments?.length ?? 0) > 0" class="shrink-0 flex flex-col items-end">
                              <div class="flex flex-wrap gap-1.5 justify-end">
                                <template v-for="(url, i) in (review.attachments ?? []).slice(0, 5)" :key="url">
                                  <button type="button" class="w-12 h-12 rounded overflow-hidden border border-gray-200 p-0 cursor-pointer bg-gray-100 shrink-0 hover:opacity-90" @click="openMedia(review.attachments ?? [], i)">
                                    <img v-if="!isVideoUrl(url)" :src="url" :alt="`첨부 ${i + 1}`" class="w-full h-full object-cover" />
                                    <span v-else class="w-full h-full flex items-center justify-center bg-gray-500"><i class="fa fa-play text-white"></i></span>
                                  </button>
                                </template>
                              </div>
                              <button
                                v-if="(review.attachments?.length ?? 0) > 5"
                                type="button"
                                class="bg-transparent border-0 cursor-pointer text-sm text-gray-500 hover:underline mt-1"
                                @click="openMedia(review.attachments ?? [], 5)"
                              >
                                외 {{ (review.attachments?.length ?? 0) - 5 }}개
                              </button>
                            </div>
                          </div>
                        </li>
                        <li v-for="reply in (review.replies ?? [])" :key="reply.reviewId" class="children">
                          <div class="flex items-start gap-4">
                            <div class="comments-avatar">
                              <app-image :src="reply.img" :alt="reply.writerNm" :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }" :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="avatar-name">
                                <h5>{{ reply.writerNm }}</h5>
                                <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] text-danger hover:opacity-85" @click.prevent="deleteReview(reply.reviewId, true)">삭제</button>
                              </div>
                              <p>{{ reply.reviewContent || '' }}</p>
                            </div>
                          </div>
                        </li>
                      </template>
                    </ul>
                  </div>
                </div>
                <div class="post-comments-form mb-100">
                  <div class="post-comments-title mb-30">
                    <h3>{{ replyingToReviewId ? '답글 쓰기' : '리뷰 쓰기' }}</h3>
                    <div v-if="!replyingToReviewId" class="post-rating">
                      <ul>
                        <li v-for="n in 5" :key="n">
                          <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] hover:opacity-85" :aria-label="`${n}점`" @click.prevent="setReviewRating(n)">
                            <i :class="n <= reviewRating ? 'fas fa-star' : 'fal fa-star'"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <!-- 2026-09-14(요청사항: "리뷰작성 에도 yup 적용해줘") — login/register/contact와
                       동일하게 vee-validate Form/Field/yup 스키마로 전환. 별점은 커스텀 UI라 yup
                       Field로 못 묶어 기존 방식(handleReviewSubmit 안의 수동 체크) 그대로 유지. -->
                  <Form id="contacts-form" class="conatct-post-form" :validation-schema="reviewSchema" @submit="handleReviewSubmit">
                    <div class="row">
                      <div class="col-xl-12">
                        <div class="contact-icon relative contacts-message">
                          <Field name="comments" v-slot="{ field }">
                            <textarea v-bind="field" id="comments" cols="30" rows="10" placeholder="내용"></textarea>
                          </Field>
                          <ErrorMessage name="comments" class="text-danger" />
                        </div>
                      </div>
                      <!-- 2026-09-14(요청사항: "리뷰등록 가운데 정렬해줘") -->
                      <div class="col-xl-12 text-center">
                        <button class="os-btn os-btn-black" type="submit" :disabled="reviewFormLoading">
                          {{ reviewFormLoading ? "등록 중..." : (replyingToReviewId ? "답글 등록" : "리뷰 등록") }}
                        </button>
                      </div>
                    </div>
                  </Form>
                </div>
                <media-viewer-modal
                  :open="mediaViewerOpen"
                  :items="mediaViewerItems"
                  :initial-index="mediaViewerInitialIndex"
                  @close="mediaViewerOpen = false"
                />
              </div>
            </div>

            <!-- Q&A 섹션 (2026-09-20) -->
            <div ref="secQna" id="sec-qna" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">Q&amp;A <span class="ml-2 text-[0.85rem] font-normal text-[#9ca3af]">({{ qnaCount }})</span></h2>
              <prod-qna :prod-id="item.prodId" @count="qnaCount = $event" />
            </div>

            <!-- 스타일 섹션 (2026-09-20) -->
            <div ref="secStyle" id="sec-style" class="pt-12 pb-10 scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">스타일</h2>
              <prod-style-rec />
            </div>
          </div>
        </div>
      </section>

      <!-- 하단 고정 구매바: 본문 구매 버튼이 화면 위로 지나가면 나타난다 (2026-09-20) -->
      <prod-buy-bar :item="item" :show="showBuyBar" @cart="detailRef?.addToCart()" @buy="detailRef?.buyNow()" />

      <!-- 관련 상품 -->
      <section class="related__product pb-60">
        <div class="max-w-7xl mx-auto px-4">
          <div class="row">
            <div class="col-xl-12">
              <div class="section__title-wrapper text-center mb-55">
                <div class="section__title mb-10">
                  <h2>관련 상품</h2>
                </div>
                <div class="section__sub-title">
                  <p>함께 보면 좋은 상품을 만나보세요.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div v-for="(prdItem, i) in relatedProducts" :key="i" class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <product-item :item="prdItem" />
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- 상품 없음 fallback -->
    <div v-else class="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">상품을 찾을 수 없습니다.</div>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import SkeletonProductDetail from "~/components/ui/SkeletonProductDetail.vue";
import { type PdProductType } from "~/types/pdProductType";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import ProductDetailsContent from "~/components/shop-details/ProductDetailsContent.vue";
import ProdGallery from "~/components/prod-detail/ProdGallery.vue";
import ProdBuyBar from "~/components/prod-detail/ProdBuyBar.vue";
import ProdSizeGuide from "~/components/prod-detail/ProdSizeGuide.vue";
import ProdStyleRec from "~/components/prod-detail/ProdStyleRec.vue";
import ProdQna from "~/components/prod-detail/ProdQna.vue";
import ProductItem from "~/components/products/ProductItem.vue";
import AppImage from "~/components/ui/AppImage.vue";
import MediaViewerModal from "~/components/modals/MediaViewerModal.vue";
import { pdReviewSvc } from "~/svc/fo/ec/pd/pdReviewSvc";
import { Field, Form, ErrorMessage, type GenericObject } from "vee-validate";
import * as yup from "yup";

const route = useRoute();
const id = route.params.id as string;
// ecBeBo prodId는 문자열(예: "PR2607070656371295")이라 숫자 검증은 더 이상 의미가 없다 —
// 대신 URL에 점(.)이 들어간 경우(.css.map 등 정적 리소스 오요청)만 걸러낸다(2026-09 BFF 전환).
const isValidProdId = Boolean(id) && !id.includes(".");

// SEO 단위화면(useSeoDetail): 서버 렌더링은 SEO 용 최소 정보만(server/api), 화면이 뜬 뒤 브라우저가 ecBeBo 에서 전체 정보(리뷰·옵션·본문)를 직접 조회한다.
const { item, pending, refresh: refreshItem, seo } = await useSeoDetail<PdProductType>(
  `product-${id}`,
  isValidProdId ? `/api/fo/ec/pd/prod/${id}` : null,
  () => (isValidProdId ? pdProductSvc.getById(id) : Promise.resolve(null))
);

// 관련 상품 — 같은 카테고리 상품 4개만 별도 조회(전체 카탈로그 X). SEO 대상이 아니라 서버 렌더에서는 뺀다.
const { data: relatedList } = useAsyncData<PdProductType[]>(
  `related-${id}`,
  async () => {
    const categoryId = item.value?.category?.categoryId;
    if (!categoryId) return [];
    return (await pdProductSvc.getPaged({ pageNo: 1, pageSize: 5, categoryIds: [categoryId] })).items;
  },
  { default: () => [], lazy: true, server: false, watch: [() => item.value?.category?.categoryId] } // 클라이언트 내비게이션은 카테고리를 뒤늦게 알게 되므로 바뀌면 재조회
);
const relatedProducts = computed(() => relatedList.value.filter((p) => p.prodId !== item.value?.prodId).slice(0, 4));

import { usePageTitle } from "~/composables/usePageTitle";
import { useGa } from "~/composables/useGa";
useSeoMeta({
  title: () => (item.value ? `${item.value.prodNm} | Outstock` : "상품 상세"),
  ogTitle: () => item.value?.prodNm ?? "상품 상세",
  description: () => item.value?.smDesc,
  ogDescription: () => item.value?.smDesc,
  ogImage: () => item.value?.img,
});
// 상품 구조화 데이터(JSON-LD) — 검색결과에 가격/재고/평점이 노출될 수 있게(2026-09 SEO 보강).
useHead(() => ({
  link: item.value ? [{ rel: "canonical", href: `https://shopjoy-ecfefonuxt4.netlify.app/prod-dtl/${id}` }] : [],
  script: item.value
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: item.value.prodNm,
            description: item.value.smDesc,
            image: item.value.img ? [item.value.img] : undefined,
            brand: item.value.brand?.brandNm ? { "@type": "Brand", name: item.value.brand.brandNm } : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "KRW",
              price: item.value.salePrice,
              availability: item.value.prodStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `https://shopjoy-ecfefonuxt4.netlify.app/prod-dtl/${id}`,
            },
            ...(item.value.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: item.value.rating, reviewCount: item.value.reviews?.length ?? 1 } } : {}),
          }),
        },
      ]
    : [],
}));
usePageTitle("상품 상세");
if (seo.value) useCdnCache(300); // 서버 렌더 결과(SEO 정보 있음)만 Netlify CDN 5분 캐시 — 변하는 데이터(리뷰 등)는 SSR 에 없어 안전, 오류/빈 페이지는 캐시 안 함

// GA4: 상세 조회 데이터 기준으로 page_view 전송
const { sendPageView } = useGa();
watch(
  item,
  (v) => {
    if (v?.prodNm) sendPageView(`${v.prodNm} | Outstock`);
  },
  { immediate: true }
);

// ── 탭 & 섹션 스크롤 ─────────────────────────────────────────────
// 2026-09-20(요청사항: 상품상세를 ecFeBo 처럼) — 탭: 상세정보 / 사이즈 / 상품평 / Q&A / 스타일
type TabId = "detail" | "size" | "review" | "qna" | "style";
const qnaCount = ref(0);
const tabs = computed(() => [
  { id: "detail" as TabId, label: "상세정보" },
  { id: "size" as TabId, label: "사이즈" },
  { id: "review" as TabId, label: `상품평 (${totalReviewCount.value})` },
  { id: "qna" as TabId, label: qnaCount.value ? `Q&A (${qnaCount.value})` : "Q&A" },
  { id: "style" as TabId, label: "스타일" },
]);

// 세탁 및 관리 — 백엔드에 상품별 데이터가 없어 ecFeBo 와 같은 공통 안내문(고정값)
const careItems = [
  { icon: "💧", label: "세탁 방법", value: "찬물 손세탁 또는 세탁기 약세탁 권장" },
  { icon: "🌡️", label: "건조 방법", value: "그늘에서 자연 건조 (드라이기 금지)" },
  { icon: "👕", label: "다림질", value: "낮은 온도로 뒤집어 다림질" },
  { icon: "🚫", label: "주의사항", value: "표백제 사용 금지, 드라이클리닝 권장 안함" },
];

const activeTab = ref<TabId>("detail");
const tabNavRef = ref<HTMLElement | null>(null);
const secDetail = ref<HTMLElement | null>(null);
const secSize = ref<HTMLElement | null>(null);
const secReview = ref<HTMLElement | null>(null);
const secQna = ref<HTMLElement | null>(null);
const secStyle = ref<HTMLElement | null>(null);
// 2026-09-14 버그수정(요청사항: "F5 refresh 하면 상품설명/추가정보/리뷰 바가 최상단에 보였다가
// 사라지는데 이러면 안되") — SSR/하이드레이션 직후 onMounted가 실제 헤더 높이를 측정하기
// 전까지는 이 값이 0이라 잠깐 top:0px로 렌더돼(=진짜 페이지 맨 위) 눈에 띄게 깜빡였다.
// 헤더의 대략적인 실제 높이(로고+환경배지 2줄+패딩)로 기본값을 잡아 그 순간에도 자연스럽게
// 보이도록 하고, onMounted에서 정확한 값으로 즉시 보정한다.
const headerH = ref(90);

function sectionEl(id: TabId): HTMLElement | null {
  return { detail: secDetail.value, size: secSize.value, review: secReview.value, qna: secQna.value, style: secStyle.value }[id];
}

function scrollToSection(id: TabId) {
  activeTab.value = id;
  const el = sectionEl(id);
  if (!el) return;
  const navH = tabNavRef.value?.offsetHeight ?? 52;
  const total = headerH.value + navH + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - total;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

// 활성 탭 — 스크롤 위치 기준: 고정 탭바 바로 아래(기준선)를 지나간 마지막 섹션이 "지금 보고 있는 섹션"이다.
// (예전 IntersectionObserver 는 화면 20~35% 띠를 지나는 섹션만 잡아 짧은 섹션(Q&A/스타일)을 건너뛰거나 못 잡았다.)
const TAB_ORDER: TabId[] = ["detail", "size", "review", "qna", "style"];
function updateActiveTab() {
  const anchor = headerH.value + (tabNavRef.value?.offsetHeight ?? 52) + 24;
  let current: TabId = "detail";
  for (const id of TAB_ORDER) {
    const el = sectionEl(id);
    if (el && el.getBoundingClientRect().top <= anchor) current = id;
  }
  // 페이지 맨 아래까지 내려가면(뒤에 관련 상품만 남음) 마지막 섹션을 활성으로
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "style";
  activeTab.value = current;
}

// 하단 고정 구매바 — 본문 구매 버튼 영역이 헤더 아래로 완전히 지나가면 나타난다
const detailRef = ref<InstanceType<typeof ProductDetailsContent> | null>(null);
const showBuyBar = ref(false);
let scrollRaf = 0;
function updateBuyBar() {
  scrollRaf = 0;
  updateActiveTab();
  const buyEl = detailRef.value?.getBuyEl?.();
  showBuyBar.value = buyEl ? buyEl.getBoundingClientRect().bottom < headerH.value : false;
}
function onScroll() {
  if (!scrollRaf) scrollRaf = requestAnimationFrame(updateBuyBar);
}

let headerObserver: ResizeObserver | null = null;
onMounted(() => {
  // 고정 헤더 높이 추적
  const headerEl = document.getElementById("header-sticky");
  if (headerEl) {
    headerH.value = headerEl.offsetHeight;
    headerObserver = new ResizeObserver(() => {
      headerH.value = headerEl.offsetHeight;
    });
    headerObserver.observe(headerEl);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => {
  headerObserver?.disconnect();
  window.removeEventListener("scroll", onScroll);
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
});

// ── 리뷰 (옛 ProductDetailsReview) ─────────────────────────────
const VIDEO_EXT = new Set(["mp4", "webm", "mov"]);
function isVideoUrl(url: string): boolean {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXT.has(ext);
}

const totalReviewCount = computed(() => {
  const list = item.value?.reviews ?? [];
  return list.reduce((sum, r) => sum + 1 + (r.replies?.length ?? 0), 0);
});

// 평점 요약(평균 + 별점 분포)과 정렬 (2026-09-20) — 답글이 아닌 리뷰 본문만 대상
const reviewList = computed(() => item.value?.reviews ?? []);
const avgRating = computed(() => {
  const list = reviewList.value.filter((r) => r.rating > 0);
  return list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : Number(item.value?.rating) || 0;
});
const ratingDist = computed(() => {
  const total = reviewList.value.length || 1;
  return [5, 4, 3, 2, 1].map((star) => {
    const n = reviewList.value.filter((r) => Math.round(r.rating) === star).length;
    return { star, pct: Math.round((n / total) * 100) };
  });
});
const reviewSortOptions = [
  { id: "latest", label: "최신순" },
  { id: "high", label: "별점높은순" },
  { id: "low", label: "별점낮은순" },
] as const;
const reviewSort = ref<(typeof reviewSortOptions)[number]["id"]>("latest");
const sortedReviews = computed(() => {
  const list = [...reviewList.value];
  if (reviewSort.value === "high") return list.sort((a, b) => b.rating - a.rating || String(b.reviewDate).localeCompare(String(a.reviewDate)));
  if (reviewSort.value === "low") return list.sort((a, b) => a.rating - b.rating || String(b.reviewDate).localeCompare(String(a.reviewDate)));
  return list.sort((a, b) => String(b.reviewDate).localeCompare(String(a.reviewDate)));
});

const allAttachmentsList = computed(() => {
  const list = item.value?.reviews ?? [];
  const urls: string[] = [];
  for (const r of list) {
    urls.push(...(r.attachments ?? []));
  }
  return urls;
});
const totalAttachmentCount = computed(() => allAttachmentsList.value.length);

const mediaViewerOpen = ref(false);
const mediaViewerItems = ref<string[]>([]);
const mediaViewerInitialIndex = ref(0);

function openMedia(items: string[], index: number) {
  mediaViewerItems.value = items;
  mediaViewerInitialIndex.value = index;
  mediaViewerOpen.value = true;
}
function openAllMedia() {
  mediaViewerItems.value = [...allAttachmentsList.value];
  mediaViewerInitialIndex.value = 0;
  mediaViewerOpen.value = true;
}

const reviewRating = ref(0);
const replyingToReviewId = ref<string | null>(null);

function setReviewRating(n: number) {
  reviewRating.value = n;
}
function startReply(reviewId: string) {
  replyingToReviewId.value = reviewId;
}

const router = useRouter();
const { $toast } = useNuxtApp();

const deletingId = ref<string | null>(null);

// 리뷰(review)는 /api/fo/ec/pd/review/{id}, 답글(reply)은 /api/fo/ec/pd/review-comment/{id} —
// ecBeBo에서 둘이 서로 다른 컨트롤러라(PdReviewController vs PdReviewCommentController) 경로도 분리했다.
async function deleteReview(reviewId: string, isReply: boolean) {
  const ok = await useConfirm().openConfirm({
    title: "삭제 확인",
    message: isReply ? "이 답글을 삭제할까요?" : "이 리뷰를 삭제할까요? 달린 답글도 함께 삭제됩니다.",
    confirmText: "삭제",
    cancelText: "취소",
    variant: "danger",
  });
  if (!ok || deletingId.value !== null) return;
  deletingId.value = reviewId;
  try {
    const res = isReply ? await pdReviewSvc.deleteReviewComment(reviewId) : await pdReviewSvc.deleteReview(reviewId);
    if (res?.success) {
      $toast?.success?.(res.message ?? "삭제되었습니다.");
      await refreshItem(); // 새로고침 대신 최신 상품·리뷰를 직접 재조회(SSR CDN 캐시 우회, 열린 탭 유지)
    }
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? "삭제에 실패했습니다.";
    $toast?.error?.(msg);
  } finally {
    deletingId.value = null;
  }
}

// ── 리뷰/답글 등록 폼 (옛 ReviewForm) ─────────────────────────────
// 2026-09-14(요청사항: "리뷰작성 에도 yup 적용해줘") — login/register/contact와 동일한 스키마 방식.
const reviewSchema = yup.object({
  comments: yup.string().required("내용을 입력해 주세요").min(2, "내용은 2자 이상이어야 합니다").label("내용"),
});
const reviewFormLoading = ref(false);

async function handleReviewSubmit(rawValues: GenericObject, { resetForm }: { resetForm: () => void }) {
  const values = rawValues as { comments: string }; // vee-validate 는 값 타입을 GenericObject 로만 알려줌
  const contentTrim = values.comments.trim();
  if (!replyingToReviewId.value && (reviewRating.value < 0.5 || !item.value?.prodId)) {
    $toast?.error?.("별점을 선택해 주세요.");
    return;
  }
  reviewFormLoading.value = true;
  try {
    if (replyingToReviewId.value) {
      const res = await pdReviewSvc.createReviewComment({ reviewId: replyingToReviewId.value, content: contentTrim });
      if (res?.success) {
        $toast?.success?.(res.message ?? "답글이 등록되었습니다.");
        resetForm();
        replyingToReviewId.value = null;
        await refreshItem(); // 새로고침 대신 최신 상품·리뷰를 직접 재조회(SSR CDN 캐시 우회, 열린 탭 유지)
      }
    } else if (item.value) {
      const res = await pdReviewSvc.createReview({ prodId: item.value.prodId, content: contentTrim, rating: reviewRating.value });
      if (res?.success) {
        $toast?.success?.(res.message ?? "리뷰가 등록되었습니다.");
        resetForm();
        await refreshItem(); // 새로고침 대신 최신 상품·리뷰를 직접 재조회(SSR CDN 캐시 우회, 열린 탭 유지)
      }
    }
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? (replyingToReviewId.value ? "답글 등록에 실패했습니다." : "리뷰 등록에 실패했습니다.");
    $toast?.error?.(msg);
  } finally {
    reviewFormLoading.value = false;
  }
}
</script>

