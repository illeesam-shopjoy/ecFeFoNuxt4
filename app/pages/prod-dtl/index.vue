<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="상품 상세" subtitle="상품 상세" />

    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-product-detail v-if="pending" />

    <!-- 상품 상세 -->
    <template v-else-if="item">
      <section class="shop__area pb-65">
        <div class="shop__top shop__top--white pt-100 pb-90">
          <div class="max-w-7xl mx-auto px-4">
            <div class="row">
              <div class="col-xl-6 col-lg-6">
                <div class="product-details__gallery">
                  <div class="product-details__thumbs">
                    <div class="product-details__thumb-list" id="product-details" role="tablist">
                      <button v-for="(img, i) in item.relatedImages" :key="i" :class="['product-details__thumb-btn', img === active_img ? 'active' : '']" @click="handleActiveImg(img)" type="button">
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
                  <div class="product-details__main-wrap" id="product-detailsContent">
                    <div class="product__modal-img product__thumb w-img product-details__main-img">
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

        <div class="shop__bottom shop__bottom--white">
          <div class="detail-tab-sticky" ref="tabNavRef" :style="{ top: headerH + 'px' }">
            <div class="max-w-7xl mx-auto px-4">
              <div class="detail-tab-bar">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  type="button"
                  class="detail-tab-btn"
                  :class="{ 'detail-tab-btn--active': activeTab === tab.id }"
                  @click="scrollToSection(tab.id)"
                >{{ tab.label }}</button>
              </div>
            </div>
          </div>

          <div class="max-w-7xl mx-auto px-4">
            <!-- 상품설명 섹션 -->
            <div ref="secDes" id="sec-des" class="detail-section">
              <h2 class="detail-section__title">상품설명</h2>
              <!-- ecBeBo contentHtml은 단일 HTML 블록(2026-09 BFF 전환 — 예전 3분할(text/list/text2) 구조 없음) -->
              <div class="product__details-des" v-html="item.contentHtml"></div>
            </div>

            <!-- 추가정보 섹션 -->
            <div ref="secAdd" id="sec-add" class="detail-section">
              <h2 class="detail-section__title">추가 정보</h2>
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
            <div ref="secReview" id="sec-review" class="detail-section detail-section--review">
              <div class="product__details-review">
                <div class="postbox__comments">
                  <!-- 제목: 리뷰(N)만 한 줄에 배치 -->
                  <div class="postbox__comment-title postbox__comment-title--block mb-20">
                    <h3 class="postbox__comment-title-h3">리뷰 ({{ totalReviewCount }})</h3>
                  </div>
                  <!-- 첨부·모아보기는 그 아래 줄 -->
                  <div v-if="totalAttachmentCount > 0" class="postbox__comment-attach-row mb-20">
                    <span class="postbox__comment-attach-label">첨부 이미지·동영상 {{ totalAttachmentCount }}개</span>
                    <button type="button" class="os-btn os-btn-black postbox__comment-viewall-btn" @click="openAllMedia">모아보기</button>
                  </div>
                  <div class="latest-comments mb-30">
                    <ul>
                      <template v-for="review in item.reviews" :key="review.reviewId">
                        <li>
                          <div class="comments-box">
                            <div class="comments-avatar">
                              <app-image :src="review.img" :alt="review.writerNm" :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }" :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }" />
                            </div>
                            <div class="comments-text">
                              <div class="avatar-name">
                                <h5>{{ review.writerNm }}</h5>
                                <span class="comment-actions">
                                  <button type="button" class="reply" @click.prevent="startReply(review.reviewId)">답글 쓰기</button>
                                  <button type="button" class="delete-btn" @click.prevent="deleteReview(review.reviewId, false)">삭제</button>
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
                            <div v-if="(review.attachments?.length ?? 0) > 0" class="comments-attachments">
                              <div class="review-thumb-list">
                                <template v-for="(url, i) in (review.attachments ?? []).slice(0, 5)" :key="url">
                                  <button type="button" class="review-thumb" @click="openMedia(review.attachments ?? [], i)">
                                    <img v-if="!isVideoUrl(url)" :src="url" :alt="`첨부 ${i + 1}`" class="w-full h-full object-cover" />
                                    <span v-else class="review-thumb-video"><i class="fa fa-play text-white"></i></span>
                                  </button>
                                </template>
                              </div>
                              <button
                                v-if="(review.attachments?.length ?? 0) > 5"
                                type="button"
                                class="review-thumb-more text-sm text-gray-500 hover:underline mt-1"
                                @click="openMedia(review.attachments ?? [], 5)"
                              >
                                외 {{ (review.attachments?.length ?? 0) - 5 }}개
                              </button>
                            </div>
                          </div>
                        </li>
                        <li v-for="reply in (review.replies ?? [])" :key="reply.reviewId" class="children">
                          <div class="comments-box">
                            <div class="comments-avatar">
                              <app-image :src="reply.img" :alt="reply.writerNm" :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }" :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }" />
                            </div>
                            <div class="comments-text">
                              <div class="avatar-name">
                                <h5>{{ reply.writerNm }}</h5>
                                <button type="button" class="delete-btn" @click.prevent="deleteReview(reply.reviewId, true)">삭제</button>
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
                          <button type="button" class="star-btn" :aria-label="`${n}점`" @click.prevent="setReviewRating(n)">
                            <i :class="n <= reviewRating ? 'fas fa-star' : 'fal fa-star'"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <!-- 리뷰/답글 등록 폼 -->
                  <form id="contacts-form" class="conatct-post-form" @submit.prevent="handleReviewSubmit">
                    <div class="row">
                      <div class="col-xl-12">
                        <div class="contact-icon relative contacts-message">
                          <textarea v-model="reviewFormContent" name="comments" id="comments" cols="30" rows="10" placeholder="내용"></textarea>
                        </div>
                      </div>
                      <div class="col-xl-12">
                        <button class="os-btn os-btn-black" type="submit" :disabled="reviewFormLoading">
                          {{ reviewFormLoading ? "등록 중..." : (replyingToReviewId ? "답글 등록" : "리뷰 등록") }}
                        </button>
                      </div>
                    </div>
                  </form>
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
import { type PdProductType } from "~/types/pdProductType";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import ProductDetailsContent from "~/components/shop-details/ProductDetailsContent.vue";
import ProductItem from "~/components/products/ProductItem.vue";
import AppImage from "~/components/ui/AppImage.vue";
import MediaViewerModal from "~/components/modals/MediaViewerModal.vue";
import { pdReviewSvc } from "~/svc/fo/ec/pd/pdReviewSvc";
import { useProductsStore } from "~/store/useProductsStore";

// 이 페이지는 /prod-dtl (id 없이 접근) 전용 — 상품 목록 첫 항목을 상세로 보여줌
const { data: item, pending } = await useAsyncData<PdProductType | null>("product-detail-index", async () => {
  const list = await pdProductSvc.getPage();
  const first = list[0];
  if (!first) return null;
  return pdProductSvc.getById(first.prodId);
});

const store = useProductsStore();
if (import.meta.client && !store.loaded) {
  store.loadStProducts();
}

import { usePageTitle } from "~/composables/usePageTitle";
useHead({ title: "상품 상세" });
usePageTitle("상품 상세");

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
const headerH = ref(0);

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
const reviewFormContent = ref("");
const reviewFormLoading = ref(false);

async function handleReviewSubmit() {
  const contentTrim = reviewFormContent.value.trim();
  if (!contentTrim) {
    $toast?.error?.("내용을 입력해 주세요.");
    return;
  }
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
        reviewFormContent.value = "";
        replyingToReviewId.value = null;
        router.go(0);
      }
    } else if (item.value) {
      const res = await pdReviewSvc.createReview({ prodId: item.value.prodId, content: contentTrim, rating: reviewRating.value });
      if (res?.success) {
        $toast?.success?.(res.message ?? "리뷰가 등록되었습니다.");
        reviewFormContent.value = "";
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

<style scoped>
.shop__top--white,
.shop__bottom--white {
  background-color: #fff;
}

/* 썸네일 왼쪽, 큰 이미지 오른쪽 */
.product-details__gallery {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
}
.product-details__thumbs { grid-column: 1; }
.product-details__thumb-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0; padding: 0; list-style: none;
}
.product-details__thumb-btn {
  margin: 0; padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  display: block;
}
.product-details__thumb-btn.active { border-color: #bc8246; }
.product-details__thumb-btn img {
  display: block; width: 95px; height: 120px;
  object-fit: cover; border-radius: 2px;
}
.product-details__main-wrap { grid-column: 2; min-width: 0; }
.product-details__main-img {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

/* ── 탭 네비게이션 ── */
.detail-tab-sticky {
  position: sticky;
  top: 0;
  z-index: 40;
  background: #fff;
  border-bottom: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 52px;
}
.detail-tab-bar {
  display: flex;
  gap: 0;
}
.detail-tab-btn {
  padding: 16px 28px;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.detail-tab-btn:hover { color: #374151; }
.detail-tab-btn--active {
  color: #bc8246;
  border-bottom-color: #bc8246;
  font-weight: 700;
}

/* ── 섹션 ── */
.detail-section {
  padding: 48px 0 40px;
  border-bottom: 1px solid #f0f0f0;
  scroll-margin-top: 120px;
}
.detail-section:last-child { border-bottom: none; }

.detail-section__title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-section--review {
  padding-top: 56px;
}

/* ── 리뷰 위젯 ── */
.star-btn,
.reply,
.delete-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: inherit;
}
.reply { color: inherit; }
.delete-btn { color: var(--color-danger, #dc2626); }
.comment-actions { display: inline-flex; gap: 0.5rem; margin-left: 0.25rem; }
.star-btn:hover,
.reply:hover,
.delete-btn:hover {
  opacity: 0.85;
}

.comments-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.comments-text { flex: 1; min-width: 0; }
.comments-attachments {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.review-thumb-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  justify-content: flex-end;
}
.review-thumb {
  width: 48px;
  height: 48px;
  border-radius: 0.25rem;
  overflow: hidden;
  border: 1px solid var(--tw-gray-200, #e5e7eb);
  padding: 0;
  cursor: pointer;
  background: #f3f4f6;
  flex-shrink: 0;
}
.review-thumb:hover { opacity: 0.9; }
.review-thumb-video {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6b7280;
}
.review-thumb-more { background: none; border: none; cursor: pointer; }

.postbox__comment-title--block {
  display: block;
}
.postbox__comment-title-h3 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}
.postbox__comment-attach-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
}
.postbox__comment-attach-label {
  white-space: nowrap;
  font-size: 0.875rem;
  color: #4b5563;
}
.postbox__comment-viewall-btn {
  white-space: nowrap;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
}
</style>
