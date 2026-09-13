<template>
  <NuxtPage />
  <XdevFilePathBadgeOverlay />
  <!-- 전역 확인/알림 다이얼로그 (useConfirm / useAlert) -->
  <ConfirmModal
    :open="confirmState.open"
    :title="confirmState.title"
    :message="confirmState.message"
    :confirm-text="confirmState.confirmText"
    :cancel-text="confirmState.cancelText"
    :variant="confirmState.variant"
    @confirm="confirmHandleConfirm"
    @cancel="confirmHandleCancel"
  />
  <AlertModal
    :open="alertState.open"
    :title="alertState.title"
    :message="alertState.message"
    :confirm-text="alertState.confirmText"
    @close="alertHandleClose"
  />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ConfirmModal from "~/components/modals/ConfirmModal.vue";
import AlertModal from "~/components/modals/AlertModal.vue";

const { public: { appTitle } } = useRuntimeConfig();

const { state: confirmState, handleConfirm: confirmHandleConfirm, handleCancel: confirmHandleCancel } = useConfirm();
const { state: alertState, handleClose: alertHandleClose } = useAlert();
useHead({
  titleTemplate: (title) => title ? `${title} | ${appTitle}` : appTitle,
});
import { useCartStore } from "~/store/useCartStore";
import { useProductsStore } from "~/store/useProductsStore";
import { useAuthStore } from "~/store/useAuthStore";

const cartStore = useCartStore();
const productsStore = useProductsStore();
const authStore = useAuthStore();

onMounted(async () => {
  // 장바구니 복원 (localStorage)
  void cartStore.loadStCartProducts;

  // 토큰 로드 후 사용자 정보 조회
  authStore.loadStToken();
  await authStore.loadStAuthInfo();

  // 상품 목록 로드 (CSR)
  productsStore.loadStProducts();
});

// 2026-09-13 버그수정: "블로그 상세 페이지에서 category-tree/sy/code가 조회되면 안 되는데"
// — useCodeStore(공통코드 1200개+, /api/co/sy/code)를 여기서 무조건 로드했었는데 실제로
// 이 값을 쓰는 화면이 어디에도 없다(useCodeStore를 import하는 곳이 app.vue 자신뿐이었음).
// 페이지 성격과 무관하게 앱이 뜰 때마다 무거운 호출이 나가 자택 NAS 백엔드 부하만 키우고
// 있었던 것 — 제거. 나중에 실제로 공통코드가 필요한 화면이 생기면 그 화면에서
// useCodeStore().loadStCodes()를 직접 호출할 것(전역 강제 로드 X).
</script>
