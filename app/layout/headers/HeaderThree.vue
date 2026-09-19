<template>
  <client-only>
    <header>
      <div id="header__transparent" class="header__area header__transparent">
        <div class="max-w-7xl mx-auto px-4">
          <div class="header__top header__top-2">
            <div class="row items-center">
              <div class="col-xl-4 col-lg-4 col-md-3 col-sm-12">
                <div class="header__welcome">
                  <span>shopjoy에 오신 것을 환영합니다!</span>
                </div>
              </div>
              <div class="col-xl-4 col-lg-4 col-md-3 col-sm-5">
                <div class="logo logo__6 text-md-center">
                  <nuxt-link href="/">
                    <img src="/logo/shopjoy-logo.svg" alt="shopjoy" />
                  </nuxt-link>
                </div>
                <env-mode-badge />
              </div>
              <div class="col-xl-4 col-lg-4 col-md-6 col-sm-7">
                <div class="header__right relative flex justify-between sm:justify-end items-center">
                  <div @click.prevent="handleOffcanvas" class="mobile-menu-btn lg:hidden">
                    <a href="#" class="mobile-menu-toggle"><i class="fas fa-bars"></i></a>
                  </div>
                  <div><header-top-actions @search="handleOpenSearchBar" /></div>
                </div>
              </div>
            </div>
          </div>
          <div id="header-sticky" :class="`header__bottom ${isSticky ? 'sticky' : ''}`">
            <div class="row">
              <div class="col-xl-8 offset-xl-2 col-lg-10 offset-lg-1">
                <div class="main-menu d-none d-lg-flex justify-center relative">
                  <nav>
                    <menus />
                  </nav>
                </div>
              </div>
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
  </client-only>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Menus from "./Menus.vue";
import SearchModal from "~/components/modals/SearchModal.vue";
import HeaderTopActions from "./header-com/HeaderTopActions.vue";
import EnvModeBadge from "./header-com/EnvModeBadge.vue";
import OffCanvas from "~/components/common/sidebar/OffCanvas.vue";

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
