<template>
  <!-- 상품목록 — 카테고리 칩(판매중 개수)·상품명 검색·판매중 먼저·6개씩 스크롤로 더 보기. 원본 pages/Products.js -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 28px">
        <div class="hp-pill hp-pill--purple">상품 목록</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px"><span class="gradient-text">SaaS 상품</span> 라인업</h1>
        <p class="section-subtitle">바로 도입 가능한 클라우드 기반 상품들을 만나보세요.</p>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px">
        <button v-for="cat in productCats" :key="cat.name" type="button" class="cat-btn" :class="{ active: activeCat === cat.name }" @click="handleSelectAction('cat-select', cat.name)">
          {{ cat.name }}<span v-if="cat.count > 0" class="cat-count">{{ cat.count }}</span>
        </button>
      </div>
      <div style="margin-bottom: 28px; max-width: 288px">
        <input v-model="searchText" type="search" class="form-input" placeholder="상품명 검색" aria-label="상품명 검색" />
      </div>

      <!-- 처음 잠깐 스켈레톤 (원본과 같은 0.4초) -->
      <div v-if="!skeletonDone" class="grid-3">
        <div v-for="i in 6" :key="'sk' + i" class="product-card" style="overflow: hidden">
          <div style="padding: 24px 24px 0">
            <div class="skeleton-line" style="width: 52px; height: 52px; border-radius: 10px; margin-bottom: 14px"></div>
            <div class="skeleton-line" style="height: 14px; width: 70%; margin-bottom: 8px"></div>
            <div class="skeleton-line" style="height: 11px; width: 90%; margin-bottom: 6px"></div>
            <div class="skeleton-line" style="height: 11px; width: 60%; margin-bottom: 14px"></div>
            <div class="skeleton-line" style="height: 18px; width: 38%; margin-bottom: 18px"></div>
          </div>
          <div style="padding: 0 24px 24px; display: flex; flex-direction: column; gap: 8px">
            <div style="display: flex; gap: 8px">
              <div class="skeleton-line" style="flex: 1; height: 32px"></div>
              <div class="skeleton-line" style="flex: 1; height: 32px"></div>
            </div>
            <div class="skeleton-line" style="height: 32px"></div>
          </div>
        </div>
      </div>
      <div v-else class="grid-3">
        <div v-for="p in displayedProducts" :key="p.productId" class="product-card" :class="{ 'is-off': p.salesYn !== 'Y' }">
          <div style="padding: 24px 24px 0">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px">
              <span style="font-size: 2.8rem">{{ p.emoji }}</span>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px">
                <span class="badge badge-cat">{{ hpCategoryLabel(p) }}</span>
                <span v-if="p.salesYn !== 'Y'" class="badge badge-off">판매안함</span>
              </div>
            </div>
            <nuxt-link :to="`/products/${p.productId}`" style="display: block; font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px">{{ p.productName }}</nuxt-link>
            <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px">{{ p.desc }}</p>
            <div style="font-size: 0.9rem; font-weight: 700; color: var(--blue); margin-bottom: 18px">{{ p.price }}</div>
          </div>
          <div style="padding: 0 24px 24px; display: flex; flex-direction: column; gap: 8px">
            <div style="display: flex; gap: 8px">
              <button type="button" class="btn-blue btn-sm" style="flex: 1" @click="handleBtnAction('product-demo', p)">데모 보기</button>
              <nuxt-link :to="`/products/${p.productId}`" class="btn-outline btn-sm" style="flex: 1">상세보기</nuxt-link>
            </div>
            <nuxt-link v-if="p.salesYn === 'Y'" :to="`/order?pid=${p.productId}`" class="btn-outline btn-sm" style="width: 100%">주문하기</nuxt-link>
            <nuxt-link v-else :to="`/contact?pid=${p.productId}`" class="btn-outline btn-sm" style="width: 100%">도입 문의</nuxt-link>
          </div>
        </div>
      </div>
      <div v-if="filteredProducts.length === 0" style="text-align: center; padding: 60px 0; color: var(--text-muted)">해당 조건의 상품이 없습니다.</div>
      <div v-show="hasMore" ref="sentinel" style="height: 1px"></div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_CATEGORIES, HP_PRODUCTS, HP_PRODUCTS_PAGE_SIZE, hpCategoryLabel, type HpProduct } from "~/conts/tenant/homepg1";
import { useHpDemo } from "~/layout/homepg1/hpUi";

useHead({ title: "상품목록" });
const openDemo = useHpDemo();
const route = useRoute();

const ALL = "전체";
const activeCat = ref(typeof route.query.cat === "string" ? route.query.cat : ALL);
const searchText = ref("");
const visibleCount = ref(HP_PRODUCTS_PAGE_SIZE);
const skeletonDone = ref(false);
const sentinel = ref<HTMLElement | null>(null);

/** 카테고리 칩 — 상품이 있는 카테고리만, 숫자는 판매중 상품 수 */
const productCats = computed(() => {
  const used = new Set(HP_PRODUCTS.map((p) => p.categoryId));
  const onSale = (cid?: string) => HP_PRODUCTS.filter((p) => p.salesYn === "Y" && (!cid || p.categoryId === cid)).length;
  return [{ name: ALL, count: onSale() }, ...HP_CATEGORIES.filter((c) => used.has(c.categoryId)).map((c) => ({ name: c.categoryName, count: onSale(c.categoryId) }))];
});

/** 카테고리·검색 적용 후 판매중 먼저 */
const filteredProducts = computed<HpProduct[]>(() => {
  const q = searchText.value.trim().toLowerCase();
  const cat = HP_CATEGORIES.find((c) => c.categoryName === activeCat.value);
  return HP_PRODUCTS.filter((p) => activeCat.value === ALL || p.categoryId === cat?.categoryId)
    .filter((p) => !q || p.productName.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => (b.salesYn === "Y" ? 1 : 0) - (a.salesYn === "Y" ? 1 : 0));
});
const displayedProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < filteredProducts.value.length);
watch([activeCat, searchText], () => (visibleCount.value = HP_PRODUCTS_PAGE_SIZE));

/* 스크롤 끝 근처(250px)에 오면 6개씩 더 */
let observer: IntersectionObserver | null = null;
let skeletonTimer: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
  skeletonTimer = setTimeout(() => {
    skeletonDone.value = true;
    if (!sentinel.value || !("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore.value) visibleCount.value = Math.min(filteredProducts.value.length, visibleCount.value + HP_PRODUCTS_PAGE_SIZE);
      },
      { rootMargin: "250px" },
    );
    observer.observe(sentinel.value);
  }, 400);
});
onBeforeUnmount(() => {
  if (skeletonTimer) clearTimeout(skeletonTimer);
  observer?.disconnect();
  observer = null;
});

/* handleSelectAction — 선택 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = (cmd: string, name: string) => {
  if (cmd === "cat-select") {
    activeCat.value = name;
    return navigateTo({ query: name === ALL ? {} : { cat: name } }, { replace: true });
  }
  console.warn("[handleSelectAction] 알 수 없는 명령:", cmd);
};

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string, p?: HpProduct) => {
  if (cmd === "product-demo" && p) return openDemo(p);
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
