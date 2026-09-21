<template>
  <!-- 2026-09-15(요청사항: "최상단메뉴가 페이지에 따라 안보이는 경우가 있는거 같아
       점검하여 개선해줘") — 헤더 전체가 <client-only>로 감싸져 있어서, SSR이 켜진 라우트
       (nuxt.config.ts routeRules의 /shop, /prod-dtl/**, /blog-dtl/**)에서는 서버가 내려준
       최초 HTML에 상단 메뉴가 아예 없고 클라이언트 하이드레이션이 끝나야 나타났다 —
       느린 네트워크/JS 실패 시 그 페이지들만 메뉴가 안 보이는 것처럼 보였던 원인.
       실제로 클라이언트 전용 상태(localStorage 기반 장바구니 수량/로그인 여부)는 장바구니
       뱃지·UserDropdown뿐이라 그 부분만 좁게 client-only 처리하고, 메뉴/로고/검색 등
       나머지는 항상 서버에서도 그려지게 바꿨다. -->
  <header>
      <div
        id="header-sticky"
        :class="`header__area ${transparent ? 'header__transparent' : ''} ${header_big ? 'box-25' : !white_bg ? 'grey-bg' : ''} 
        ${isSticky ? 'sticky' : ''}`"
      >
        <div :class="`${header_big ? 'w-full px-2 sm:px-4' : 'max-w-7xl mx-auto px-2 sm:px-4 header__inner'}`">
          <div class="flex flex-wrap sm:flex-nowrap items-center header__row">
            <div :class="`${header_big ? 'flex-1 lg:w-7/12 md:w-1/6 sm:w-1/12 w-1/6' : 'flex-1 min-w-0 header__menu-col'}`" style="order: 2;">
              <div class="header__right relative flex justify-center items-center">
                <div :class="`main-menu ${header_big ? 'main-menu-2 text-center' : ''} hidden lg:block`">
                  <nav>
                    <menus />
                  </nav>
                </div>
                <div @click.prevent="handleOffcanvas" class="mobile-menu-btn lg:hidden">
                  <a href="#" class="mobile-menu-toggle"><i class="fas fa-bars"></i></a>
                </div>
              </div>
            </div>
            <div :class="`${header_big ? 'w-full md:w-1/3 lg:w-3/12' : 'header__logo-col'}`" style="order: 1;">
              <div class="logo">
                <header-logo :align="header_big ? 'start' : 'center'" />
              </div>
            </div>
            <div v-if="!header_big" class="header__action-col" style="order: 3;">
              <div><header-top-actions @search="handleOpenSearchBar" /></div>
            </div>

            <div v-if="header_big" class="w-full sm:w-10/12 md:w-1/2 lg:w-3/12" style="order: 3;">
              <div class="ml-auto"><header-top-actions @search="handleOpenSearchBar" /></div>
            </div>
          </div>
        </div>
      </div>
    </header>

  <!-- 검색 팝업 시작 -->
  <search-modal ref="search_popup" />
  <!-- 검색 팝업 끝 -->

  <!-- 오프캔버스 시작 -->
  <off-canvas ref="offcanvas" />
  <!-- 오프캔버스 끝 -->
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Menus from "./Menus.vue";
import SearchModal from "~/components/modals/SearchModal.vue";
import HeaderTopActions from "./header-com/HeaderTopActions.vue";
import HeaderLogo from "./header-com/HeaderLogo.vue";
import OffCanvas from "~/components/common/sidebar/OffCanvas.vue";
import ShareToolsButtons from "~/components/common/ShareToolsButtons.vue";

defineProps({
  header_big: { type: Boolean, default: false },
  white_bg: { type: Boolean, default: false },
  transparent: { type: Boolean, default: false },
});
const isSticky = ref(false);
const search_popup = ref<{ openSearchPopup(): void } | null>(null);
const offcanvas = ref<{ OpenOffcanvas(): void } | null>(null);

function handleSticky() {
  isSticky.value = window.scrollY > 80;
}
function handleOpenSearchBar() {
  search_popup.value?.openSearchPopup();
}
function handleOffcanvas() {
  offcanvas.value?.OpenOffcanvas();
}

onMounted(() => {
  window.addEventListener("scroll", handleSticky);
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleSticky);
});
</script>
