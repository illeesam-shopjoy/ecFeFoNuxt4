<template>
  <client-only>
    <header>
      <div id="header-sticky" :class="`header__area header__transparent box-25 ${isSticky ? 'sticky' : ''}`">
        <div class="container-fluid">
          <div class="row items-center">
            <div class="col-xl-6 col-lg-6">
              <div class="main-menu hidden lg:block relative">
                <nav>
                  <menus />
                </nav>
              </div>
            </div>
            <div class="col-xl-3 col-lg-2 col-md-4 col-sm-4">
              <div class="logo">
                <header-logo />
              </div>
            </div>
            <div class="col-xl-3 col-lg-4 col-md-8 col-sm-8">
              <div class="header__right relative flex justify-between sm:justify-end items-center">
                <div @click.prevent="handleOffcanvas" class="mobile-menu-btn lg:hidden">
                  <a href="#" class="mobile-menu-toggle"><i class="fas fa-bars"></i></a>
                </div>
                <div><header-top-actions @search="handleOpenSearchBar" /></div>
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
import HeaderTopActions from "./header-com/HeaderTopActions.vue";
import HeaderLogo from "./header-com/HeaderLogo.vue";
import SearchModal from "~/components/modals/SearchModal.vue";
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
