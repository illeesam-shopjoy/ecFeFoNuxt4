<template>
  <client-only>
    <header>
      <!-- 2026-09-27(요청사항: "home-6 모바일로 보면 위에 깨져 보여 개선해줘") — 모바일(<lg)에서
           ① 헤더가 absolute(header__transparent)라 세로로 쌓인 헤더가 히어로 제목을 덮었고,
           ② 메뉴의 d-none/d-lg-flex 는 이 프로젝트(Tailwind)에 정의가 없어 모바일에도 메뉴가 펼쳐져 가로로 넘쳤고,
           ③ col-sm-* 는 576px 미만에서 100%라 로고·아이콘이 각각 한 줄씩 차지했다.
           → <lg: 헤더를 흐름 안(header__area-6, _header.scss)에 두고, 환영문구 1줄 + [로고 | 햄버거·아이콘] 1줄로 배치,
             메뉴(데스크탑 전용)는 hidden lg:flex. lg 이상은 기존 3분할 레이아웃 그대로. -->
      <div id="header__transparent" class="header__area header__transparent header__area-6">
        <div class="max-w-7xl mx-auto px-4">
          <div class="header__top header__top-2">
            <div class="row items-center">
              <div class="col-12 col-lg-4">
                <div class="header__welcome text-center lg:text-left max-lg:text-[13px] max-lg:!pb-1.5">
                  <span>shopjoy에 오신 것을 환영합니다!</span>
                </div>
              </div>
              <div class="col-lg-4 max-lg:!w-auto max-lg:flex-none">
                <div class="logo">
                  <header-logo />
                </div>
              </div>
              <div class="col-lg-4 max-lg:!w-auto max-lg:flex-1 max-lg:min-w-0 max-lg:!pl-0">
                <div class="header__right relative flex justify-end items-center gap-1.5">
                  <div @click.prevent="handleOffcanvas" class="mobile-menu-btn lg:hidden">
                    <a href="#" class="mobile-menu-toggle" aria-label="메뉴"><i class="fas fa-bars"></i></a>
                  </div>
                  <div class="min-w-0"><header-top-actions @search="handleOpenSearchBar" /></div>
                </div>
              </div>
            </div>
          </div>
          <div id="header-sticky" :class="`header__bottom hidden lg:block ${isSticky ? 'sticky' : ''}`">
            <div class="row">
              <div class="col-xl-8 offset-xl-2 col-lg-10 offset-lg-1">
                <div class="main-menu hidden lg:flex justify-center relative">
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
import SearchModal from "~/components/ec1/modals/SearchModal.vue";
import HeaderTopActions from "./header-com/HeaderTopActions.vue";
import HeaderLogo from "./header-com/HeaderLogo.vue";
import OffCanvas from "~/components/ec1/common/sidebar/OffCanvas.vue";

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
