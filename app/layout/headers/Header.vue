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
        <div :class="`${header_big ? 'w-full px-4' : 'max-w-7xl mx-auto px-4 header__inner'}`">
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
              <div :class="`logo flex ${header_big ? 'justify-start' : 'justify-center'}`">
                <nuxt-link href="/">
                  <img :src="`${CDN_URL}/cdn/prod/img/logo/logo.png`" alt="logo" />
                </nuxt-link>
              </div>
              <env-mode-badge />
            </div>
            <div v-if="!header_big" class="header__action-col" style="order: 3;">
              <div class="header__action">
                <ul>
                  <li>
                    <a @click.prevent="handleOpenSearchBar" href="#" class="search-toggle">
                      <i class="fas fa-search"></i> <span class="hidden sm:inline">검색</span>
                    </a>
                  </li>
                  <li>
                    <!-- 2026-09-15(요청사항: "링크복사, 카카오공유하기, PDF다운로드 기능
                         추가하고 싶어 2번째 이미지 최상단처럼 저 최상단은 모바일보기에서는
                         설정안에서보여") — 모바일에서는 숨기고(ExtraInfo 설정 안에서 대신 노출). -->
                    <share-tools-buttons variant="icons" />
                  </li>
                  <li>
                    <!-- 2026-09-13(요청사항: "상담에 숨겨진 글시가 원인일수도 장바구니(3) 에서
                         (3) 으로만 표시해줘도 될거 같아") — 실측 결과 이 액션 영역(검색/장바구니/
                         유저메뉴/햄버거)이 모바일 폭(412px)에서 실제로 폭이 넘쳐 헤더 전체가
                         (position:absolute인 transparent 헤더에서) 뷰포트 밖으로 튀어나가
                         가로 스크롤을 유발하고 있었다 — 정확히 사용자가 짚은 지점이 맞았다.
                         "장바구니" 글자를 작은 화면에서만 숨겨 아이콘+숫자만 보이게 함. -->
                    <a href="#" class="cart"
                      ><i class="fas fa-shopping-bag"></i> <span class="hidden sm:inline">장바구니</span>
                      <client-only><span>({{ state.getStTotalPriceQuantity.quantity }})</span></client-only>
                    </a>
                    <!-- 장바구니 미니 시작 -->
                    <client-only><cart-mini /></client-only>
                    <!-- 장바구니 미니 끝 -->
                  </li>
                  <li>
                    <div style="display:inline-flex;align-items:center;gap:18px;">
                      <client-only><user-dropdown /></client-only>
                      <a href="#" @click.prevent="showExtraInfo = !showExtraInfo"><i class="far fa-bars"></i></a>
                    </div>
                    <extra-info v-show="showExtraInfo" />
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="header_big" class="w-full sm:w-10/12 md:w-1/2 lg:w-3/12" style="order: 3;">
              <div class="header__action header__action-2 ml-auto">
                <ul>
                  <li>
                    <a @click.prevent="handleOpenSearchBar" href="#" class="search-toggle">
                      <i class="fas fa-search"></i> <span class="hidden sm:inline">검색</span>
                    </a>
                  </li>
                  <li>
                    <share-tools-buttons variant="icons" />
                  </li>
                  <li>
                    <!-- 2026-09-13(요청사항: "상담에 숨겨진 글시가 원인일수도 장바구니(3) 에서
                         (3) 으로만 표시해줘도 될거 같아") — 실측 결과 이 액션 영역(검색/장바구니/
                         유저메뉴/햄버거)이 모바일 폭(412px)에서 실제로 폭이 넘쳐 헤더 전체가
                         (position:absolute인 transparent 헤더에서) 뷰포트 밖으로 튀어나가
                         가로 스크롤을 유발하고 있었다 — 정확히 사용자가 짚은 지점이 맞았다.
                         "장바구니" 글자를 작은 화면에서만 숨겨 아이콘+숫자만 보이게 함. -->
                    <a href="#" class="cart"
                      ><i class="fas fa-shopping-bag"></i> <span class="hidden sm:inline">장바구니</span>
                      <client-only><span>({{ state.getStTotalPriceQuantity.quantity }})</span></client-only>
                    </a>
                    <!-- 장바구니 미니 시작 -->
                    <client-only><cart-mini /></client-only>
                    <!-- 장바구니 미니 끝 -->
                  </li>
                  <li>
                    <div style="display:inline-flex;align-items:center;gap:18px;">
                      <client-only><user-dropdown /></client-only>
                      <a href="#" @click.prevent="showExtraInfo = !showExtraInfo"><i class="far fa-bars"></i></a>
                    </div>
                    <extra-info v-show="showExtraInfo" />
                  </li>
                </ul>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { CDN_URL } from "~/conts/baseConst";
import { useCartStore } from "~/store/useCartStore";
import Menus from "./Menus.vue";
import CartMini from "./header-com/CartMini.vue";
import SearchModal from "~/components/modals/SearchModal.vue";
import UserDropdown from "./header-com/UserDropdown.vue";
import ExtraInfo from "./header-com/ExtraInfo.vue";
import EnvModeBadge from "./header-com/EnvModeBadge.vue";
import OffCanvas from "~/components/common/sidebar/OffCanvas.vue";
import ShareToolsButtons from "~/components/common/ShareToolsButtons.vue";

defineProps({
  header_big: { type: Boolean, default: false },
  white_bg: { type: Boolean, default: false },
  transparent: { type: Boolean, default: false },
});
const state = useCartStore();
const isSticky = ref(false);
const search_popup = ref<{ openSearchPopup(): void } | null>(null);
const offcanvas = ref<{ OpenOffcanvas(): void } | null>(null);
// 로그인 옆 햄버거(far fa-bars) 클릭 시 ExtraInfo(내 계정/언어/통화 등) 토글 — 기본값 닫힘
// (2026-09-13 요청사항: "클릭하여 안나오게 할수도 있게 옵션 넣어줘, 기본값은 안나오게").
const showExtraInfo = ref(false);

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
