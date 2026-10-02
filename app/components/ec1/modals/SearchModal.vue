<template>
  <section :class="`header__search white-bg transition-3 ${showSearch ? 'search-opened' : ''}`">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-wrap">
        <div class="w-full">
          <div class="header__search-inner text-center">
            <form @submit.prevent="handleSearchSubmit">
              <div class="header__search-btn" @click="showSearch = false">
                <a href="#" class="header__search-btn-close">
                  <i class="fal fa-times"></i>
                </a>
              </div>
              <div class="header__search-header">
                <h3>검색</h3>
              </div>
              <div class="header__search-categories">
                <ul class="search-category">
                  <li><nuxt-link href="/shop">전체 카테고리</nuxt-link></li>
                  <li><nuxt-link href="/shop">악세서리</nuxt-link></li>
                  <li><nuxt-link href="/shop">의자</nuxt-link></li>
                  <li><nuxt-link href="/shop">태블릿</nuxt-link></li>
                  <li><nuxt-link href="/shop">남성</nuxt-link></li>
                  <li><nuxt-link href="/shop">여성</nuxt-link></li>
                </ul>
              </div>
              <div class="header__search-input relative">
                <input v-model="keyword" type="text" placeholder="상품 검색..." />
                <button type="submit"><i class="far fa-search"></i></button>
              </div>

              <!-- 2026-09-22(요청사항: "검색란 아래에 최근검색, 인기검색어, 추천검색") — 클릭하면 바로 그 검색어로 검색 -->
              <div class="mx-auto mt-6 max-w-[760px] text-left">
                <section v-if="recent.length" class="mb-6">
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="m-0 text-[0.9rem] font-bold text-gray-800">최근 검색어</h4>
                    <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-[0.78rem] text-gray-400 hover:text-gray-700" @click="clearRecent">전체 삭제</button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="kw in recent" :key="kw" class="kw-chip">
                      <button type="button" class="kw-chip-btn" @click="searchWith(kw)">{{ kw }}</button>
                      <button type="button" class="kw-chip-x" :aria-label="`${kw} 삭제`" @click="removeRecent(kw)">×</button>
                    </span>
                  </div>
                </section>
                <section class="mb-6">
                  <h4 class="mb-2 mt-0 text-[0.9rem] font-bold text-gray-800">인기 검색어</h4>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="(kw, i) in POPULAR_KEYWORDS" :key="kw" type="button" class="kw-chip kw-chip-btn" @click="searchWith(kw)"><b class="mr-1.5 text-[#bc8246]">{{ i + 1 }}</b>{{ kw }}</button>
                  </div>
                </section>
                <section>
                  <h4 class="mb-2 mt-0 text-[0.9rem] font-bold text-gray-800">추천 검색어</h4>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="kw in RECOMMEND_KEYWORDS" :key="kw" type="button" class="kw-chip kw-chip-btn" @click="searchWith(kw)"># {{ kw }}</button>
                  </div>
                </section>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- 배경 오버레이 시작 -->
  <div @click="showSearch = false" :class="`body-overlay transition-3 ${showSearch ? 'opened' : ''}`"></div>
  <!-- 배경 오버레이 끝 -->
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('검색 팝업');
import { onMounted, ref } from "vue";
import { POPULAR_KEYWORDS, RECOMMEND_KEYWORDS } from "~/conts/searchKeywords";
import { useRouter } from "vue-router";

const showSearch = ref(false);
function openSearchPopup() {
  showSearch.value = true;
}
defineExpose({ openSearchPopup });

// 2026-09-13 추가: "신상품 입력 후 Enter 치면 조회되어야 해" — 검색어 입력 후
// Enter(폼 submit) 시 /shop?q=검색어 로 이동해 실제로 상품이 필터링되어 보이게 한다.
const keyword = ref("");
const router = useRouter();
function handleSearchSubmit() {
  searchWith(keyword.value.trim());
}

// ── 최근 검색어(브라우저에 최대 8개 보관) ──
const RECENT_KEY = "shopjoy_recent_search";
const RECENT_MAX = 8;
const recent = ref<string[]>([]);
function loadRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    recent.value = Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, RECENT_MAX) : [];
  } catch {
    recent.value = [];
  }
}
function saveRecent() {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.value));
  } catch {
    /* 저장소를 못 써도 검색은 동작 */
  }
}
const removeRecent = (kw: string) => {
  recent.value = recent.value.filter((x) => x !== kw);
  saveRecent();
};
const clearRecent = () => {
  recent.value = [];
  saveRecent();
};
/** 검색어로 상품목록 이동(빈 검색어면 전체). 검색어가 있으면 최근 검색어 맨 앞에 넣는다 */
function searchWith(kw: string) {
  if (kw) {
    recent.value = [kw, ...recent.value.filter((x) => x !== kw)].slice(0, RECENT_MAX);
    saveRecent();
  }
  keyword.value = kw;
  showSearch.value = false;
  router.push({ path: "/shop", query: kw ? { q: kw } : {} });
}
onMounted(loadRecent);
</script>

<style scoped>
.kw-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  background: #fff;
  font-size: 0.85rem;
  color: #374151;
  transition: border-color 0.15s, color 0.15s;
}
.kw-chip:hover {
  border-color: #bc8246;
  color: #bc8246;
}
.kw-chip-btn {
  cursor: pointer;
  padding: 6px 13px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}
.kw-chip.kw-chip-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
}
.kw-chip-x {
  cursor: pointer;
  padding: 0 10px 0 0;
  border: 0;
  background: transparent;
  color: #9ca3af;
  font-size: 1rem;
  line-height: 1;
}
.kw-chip-x:hover {
  color: #d9534f;
}
</style>
