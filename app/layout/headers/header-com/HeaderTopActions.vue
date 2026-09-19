<template>
  <!-- 2026-09-20(요청사항: "상단정보 알림, 로그인정보, 좋아요, 장바구니, 테마, 설정 — 첨부이미지 참고하여 적용") —
       헤더 우측 액션 영역 공통 컴포넌트: [검색] [🔔알림] [로그인정보▾] [♡좋아요(n)] [🛒장바구니(n)] [🌙테마] [⚙설정].
       모든 헤더(Header/HeaderTwo/Three/Four)가 이 컴포넌트 하나를 쓴다. 로그인/좋아요/장바구니 수량은 localStorage 기반이라 client-only. -->
  <div class="inline-flex flex-nowrap justify-end items-center gap-1.5 sm:gap-2">
    <a href="#" class="hidden sm:inline-flex w-10 h-10 rounded-xl items-center justify-center bg-white border border-[#e5e7eb] text-gray-600 hover:border-gray-400 transition" aria-label="검색" title="검색" @click.prevent="emit('search')">
      <i class="fas fa-search text-[14px]"></i>
    </a>

    <client-only>
      <noti-bell v-if="authStore.isStLoggedIn" />
      <user-dropdown />

      <!-- 좋아요 -->
      <nuxt-link href="/wishlist" class="hta-btn max-sm:!hidden" aria-label="위시리스트" title="위시리스트">
        <i class="far fa-heart text-[15px]"></i>
        <span v-if="wishlist.wishlists.length" class="hta-badge">{{ wishlist.wishlists.length }}</span>
      </nuxt-link>

      <!-- 장바구니 — 레거시 헤더 CSS(.header__action li:hover .mini-cart)를 그대로 써서 hover 시 미니카트 표시 -->
      <div class="header__action" style="margin: 0">
        <ul style="margin: 0; padding: 0">
          <li style="margin-left: 0">
            <div>
              <nuxt-link href="/cart" class="hta-btn" aria-label="장바구니" title="장바구니">
                <i class="fas fa-shopping-cart text-[15px]"></i>
                <span v-if="cart.getStTotalPriceQuantity.quantity" class="hta-badge">{{ cart.getStTotalPriceQuantity.quantity }}</span>
              </nuxt-link>
            </div>
            <cart-mini />
          </li>
        </ul>
      </div>

      <!-- 테마 -->
      <button type="button" class="hidden sm:inline-flex w-10 h-10 rounded-full items-center justify-center bg-[#f3ede4] border border-[#e5e7eb] cursor-pointer text-[16px] hover:border-gray-400 transition" :title="theme.dark.value ? '라이트 모드로 전환' : '다크 모드로 전환'" :aria-label="theme.dark.value ? '라이트 모드로 전환' : '다크 모드로 전환'" @click="theme.toggle()">
        {{ theme.dark.value ? "☀️" : "🌙" }}
      </button>

      <!-- 설정 -->
      <header-settings />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import NotiBell from "./NotiBell.vue";
import UserDropdown from "./UserDropdown.vue";
import CartMini from "./CartMini.vue";
import HeaderSettings from "./HeaderSettings.vue";
import { useAuthStore } from "~/store/useAuthStore";
import { useCartStore } from "~/store/useCartStore";
import { useWishlistStore } from "~/store/useWishlistStore";

const emit = defineEmits<{ (e: "search"): void }>();
const authStore = useAuthStore();
const cart = useCartStore();
const wishlist = useWishlistStore();
const theme = useTheme();
</script>

<style scoped>
.hta-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #444;
  transition: border-color 0.15s;
}
.hta-btn:hover {
  border-color: #9ca3af;
}
.hta-btn :deep(i) {
  margin: 0;
  color: inherit;
}
.hta-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: #111827;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}
</style>
