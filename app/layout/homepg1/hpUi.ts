/**
 * hpUi — homepg1(모두누리) 화면 공통 동작: 토스트(원본 홈페이지 모양, 그리는 곳은 Layout.vue)·데모 열기.
 * 쇼핑몰 모듈의 vue3-toastify($toast)와 모양이 달라 모듈 안에 따로 둔다.
 * homepg1 화면은 전부 CSR(routeRules "/**" ssr:false)이라 토스트 상태는 모듈 전역 ref — await 뒤에서 불러도 된다.
 */
import { ref } from "vue";
import type { HpProduct } from "~/conts/tenant/homepg1";

export type HpToastType = "success" | "error" | "warning" | "info";
export interface HpToastState { show: boolean; msg: string; type: HpToastType }

const toastState = ref<HpToastState>({ show: false, msg: "", type: "success" });
export const useHpToast = () => toastState;

let toastTimer: ReturnType<typeof setTimeout> | null = null;

/** 3초 동안 보였다 사라진다 */
export function hpToast(msg: string, type: HpToastType = "success") {
  if (toastTimer) clearTimeout(toastTimer);
  toastState.value = { show: true, msg, type };
  toastTimer = setTimeout(() => {
    toastState.value = { ...toastState.value, show: false };
  }, 3000);
}

/**
 * useHpDemo — 상품 "데모 보기". setup 에서 받아 두고 버튼에서 부른다(확인창 상태를 setup 컨텍스트에서 잡는다).
 * 데모 주소가 있으면 새 창, 없으면(판매하지 않는 상품) 상담 신청으로 안내한다 — 원본은 "데모 URL 로 연결됩니다" 안내만 띄웠다.
 */
export function useHpDemo() {
  const { openConfirm } = useConfirm();
  return async (p: HpProduct) => {
    if (p.demo) {
      window.open(p.demo, "_blank", "noopener");
      return;
    }
    const go = await openConfirm({
      title: "데모 준비 중",
      message: `${p.productName} 데모는 준비 중입니다.\n도입 상담을 남겨 주시면 데모 계정과 견적을 안내해 드립니다.\n상담 신청 화면으로 이동할까요?`,
      confirmText: "상담 신청",
      cancelText: "닫기",
    });
    if (go) await navigateTo(`/contact?pid=${p.productId}`);
  };
}
