<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="상품 상세" subtitle="상품 상세" />

    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-product-detail v-if="pending" />

    <!-- 상품 상세 -->
    <template v-else-if="item">
      <section class="shop__area pb-65">
        <div class="shop__top bg-white pt-100 pb-90">
          <div class="max-w-7xl mx-auto px-4">
            <div class="row">
              <div class="col-xl-6 col-lg-6">
                <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — 아래 product-details__*
                     커스텀 클래스들을 전부 Tailwind 유틸리티로 대체. -->
                <div class="grid grid-cols-[auto_1fr] gap-4 items-start">
                  <div class="col-start-1">
                    <div class="flex flex-col gap-2 m-0 p-0 list-none" id="product-details" role="tablist">
                      <button
                        v-for="(img, i) in item.relatedImages"
                        :key="i"
                        :class="['m-0 p-0 border-2 rounded block bg-transparent cursor-pointer', img === active_img ? 'border-theme' : 'border-transparent']"
                        @click="handleActiveImg(img)"
                        type="button"
                      >
                        <div class="product__nav-img w-img">
                          <app-image
                            :src="img"
                            alt="product-thumb"
                            :img-style="{ width: '95px', height: '120px', objectFit: 'cover', display: 'block', borderRadius: '2px' }"
                            :skeleton-style="{ width: '95px', height: '120px' }"
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                  <div class="col-start-2 min-w-0" id="product-detailsContent">
                    <div class="product__modal-img product__thumb w-img border border-[#e0e0e0] rounded overflow-hidden">
                      <app-image
                        :src="active_img"
                        alt="product_img"
                        :skeleton-style="{ width: '100%', aspectRatio: '3/4' }"
                      />
                      <div class="product__sale">
                        <span class="new">new</span>
                        <span class="percent">-16%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 col-lg-6">
                <product-details-content :item="item" :style_2="true" />
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
              <div class="flex justify-center gap-0">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  type="button"
                  :class="[
                    'px-7 py-4 text-base font-medium bg-transparent border-0 border-b-[3px] -mb-0.5 cursor-pointer transition-colors tracking-wide whitespace-nowrap',
                    activeTab === tab.id ? 'text-theme border-theme font-bold' : 'text-gray-500 border-transparent hover:text-gray-700',
                  ]"
                  @click="scrollToSection(tab.id)"
                >{{ tab.label }}</button>
              </div>
            </div>
          </div>

          <div class="max-w-7xl mx-auto px-4">
            <!-- 상품설명 섹션 -->
            <div ref="secDes" id="sec-des" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px] last:border-b-0">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">상품설명</h2>
              <!-- ecBeBo contentHtml은 단일 HTML 블록(2026-09 BFF 전환 — 예전 3분할(text/list/text2) 구조 없음) -->
              <div class="product__details-des" v-html="item.contentHtml"></div>
            </div>

            <!-- 추가정보 섹션 -->
            <div ref="secAdd" id="sec-add" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px] last:border-b-0">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">추가 정보</h2>
              <div class="product__details-add">
                <ul>
                  <li><span>무게</span></li>
                  <li><span>.25 KG</span></li>
                  <li><span>치수</span></li>
                  <li><span>62 x 56 x 12 cm</span></li>
                  <li><span>사이즈</span></li>
                  <li><span>XL, XXL, LG, SM, MD</span></li>
                </ul>
              </div>
            </div>

            <!-- 리뷰 섹션 -->
            <div ref="secReview" id="sec-review" class="pt-14 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px] last:border-b-0">
              <div class="product__details-review">
                <div class="postbox__comments">
                  <!-- 제목: 리뷰(N)만 한 줄에 배치 -->
                  <div class="block mb-20">
                    <h3 class="m-0 text-[1.35rem] font-bold text-gray-900 pb-3 border-b-2 border-[#e5e7eb]">리뷰 ({{ totalReviewCount }})</h3>
                  </div>
                  <!-- 첨부·모아보기는 그 아래 줄 -->
                  <div v-if="totalAttachmentCount > 0" class="flex flex-nowrap items-center gap-2 mb-20">
                    <span class="whitespace-nowrap text-sm text-gray-600">첨부 이미지·동영상 {{ totalAttachmentCount }}개</span>
                    <button type="button" class="os-btn os-btn-black whitespace-nowrap !text-sm !px-3 !py-1 !h-auto" @click="openAllMedia">모아보기</button>
                  </div>
                  <div class="latest-comments mb-30">
                    <ul>
                      <template v-for="review in item.reviews" :key="review.reviewId">
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
          </div>
        </div>
      </section>

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
            <div v-for="(prdItem, i) in store.getStRelatedProducts(item.category?.categoryId ?? '', item.prodId)" :key="i" class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
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
import { useProductsStore } from "~/store/useProductsStore";
import { type PdProductType } from "~/types/pdProductType";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import ProductDetailsContent from "~/components/shop-details/ProductDetailsContent.vue";
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

const { data: item, pending } = await useAsyncData<PdProductType | null>(
  `product-${id}`,
  () => (isValidProdId ? pdProductSvc.getById(id) : Promise.resolve(null)),
  { default: () => null }
);

// 전체 상품 목록은 CSR에서 별도 로드 (관련 상품 등 활용) — 관련상품 섹션(store.getStRelatedProducts)도 이 스토어 재사용
const store = useProductsStore();
if (import.meta.client && !store.loaded) {
  store.loadStProducts();
}

import { usePageTitle } from "~/composables/usePageTitle";
import { useGa } from "~/composables/useGa";
useSeoMeta({
  title: item.value ? `${item.value.prodNm} | Outstock` : "상품 상세",
  ogTitle: item.value?.prodNm ?? "상품 상세",
  description: item.value?.smDesc,
  ogDescription: item.value?.smDesc,
  ogImage: item.value?.img,
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

// GA4: 상세 조회 데이터 기준으로 page_view 전송
const { sendPageView } = useGa();
watch(
  item,
  (v) => {
    if (v?.prodNm) sendPageView(`${v.prodNm} | Outstock`);
  },
  { immediate: true }
);

// ── 갤러리 이미지 전환 (옛 ShopDetailsArea) ─────────────────────────────
const active_img = ref(item.value?.img ?? "");
watch(
  () => item.value?.img,
  (v) => { active_img.value = v ?? ""; },
);
function handleActiveImg(img: string) {
  active_img.value = img;
}

// ── 탭 & 섹션 스크롤 (옛 ShopDetailsArea) ─────────────────────────────
type TabId = "des" | "add" | "review";
const tabs = computed(() => {
  const list = item.value?.reviews ?? [];
  const n = list.reduce((sum, r) => sum + 1 + (r.replies?.length ?? 0), 0);
  return [
    { id: "des" as TabId, label: "상품설명" },
    { id: "add" as TabId, label: "추가 정보" },
    { id: "review" as TabId, label: `리뷰 (${n})` },
  ];
});

const activeTab = ref<TabId>("des");
const tabNavRef = ref<HTMLElement | null>(null);
const secDes = ref<HTMLElement | null>(null);
const secAdd = ref<HTMLElement | null>(null);
const secReview = ref<HTMLElement | null>(null);
// 2026-09-14 버그수정(요청사항: "F5 refresh 하면 상품설명/추가정보/리뷰 바가 최상단에 보였다가
// 사라지는데 이러면 안되") — SSR/하이드레이션 직후 onMounted가 실제 헤더 높이를 측정하기
// 전까지는 이 값이 0이라 잠깐 top:0px로 렌더돼(=진짜 페이지 맨 위) 눈에 띄게 깜빡였다.
// 헤더의 대략적인 실제 높이(로고+환경배지 2줄+패딩)로 기본값을 잡아 그 순간에도 자연스럽게
// 보이도록 하고, onMounted에서 정확한 값으로 즉시 보정한다.
const headerH = ref(90);

function scrollToSection(id: TabId) {
  activeTab.value = id;
  const elMap: Record<TabId, HTMLElement | null> = {
    des: secDes.value,
    add: secAdd.value,
    review: secReview.value,
  };
  const el = elMap[id];
  if (!el) return;
  const navH = tabNavRef.value?.offsetHeight ?? 52;
  const total = headerH.value + navH + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - total;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

// IntersectionObserver: 스크롤 중 활성 탭 자동 변경
let observer: IntersectionObserver | null = null;
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

  const entries: { id: TabId; el: HTMLElement | null }[] = [
    { id: "des", el: secDes.value },
    { id: "add", el: secAdd.value },
    { id: "review", el: secReview.value },
  ];
  observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        if (record.isIntersecting) {
          const id = record.target.id.replace("sec-", "") as TabId;
          activeTab.value = id;
        }
      }
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
  );
  entries.forEach(({ el }) => { if (el) observer!.observe(el); });
});
onUnmounted(() => {
  observer?.disconnect();
  headerObserver?.disconnect();
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
      router.go(0);
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
        router.go(0);
      }
    } else if (item.value) {
      const res = await pdReviewSvc.createReview({ prodId: item.value.prodId, content: contentTrim, rating: reviewRating.value });
      if (res?.success) {
        $toast?.success?.(res.message ?? "리뷰가 등록되었습니다.");
        resetForm();
        router.go(0);
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

