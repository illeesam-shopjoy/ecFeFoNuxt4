/**
 * carousel-resize.client.ts — 창 크기를 끌 때 캐러셀(히어로 배너 등)이 부자연스럽게 왔다갔다하는 문제 수정 (2026-09-20).
 *
 * 원인: vue3-carousel 은 슬라이드 위치를 JS 로 잰 픽셀값(translateX(-index × slideWidth))으로 잡는데, 그 값을 `window resize`
 * 이벤트 뒤 16ms **디바운스**로만 갱신한다. 반면 슬라이드의 CSS 너비는 창을 끄는 즉시 바뀌므로, 끄는 동안(이벤트가 계속 와서 디바운스가
 * 밀린다) 위치가 어긋나 옆 슬라이드가 반쯤 보이다가 멈출 때 확 맞춰진다(실측: 연속 리사이즈 82회 중 81회 어긋남, 최대 461px).
 *
 * 해결: 캐러셀 루트 요소를 ResizeObserver 로 관찰해 크기가 바뀌는 **즉시(그 프레임 페인트 전에)** updateSlideWidth() 를 호출한다.
 * 현재 보고 있는 슬라이드가 고정된 채 그대로 커지고 작아진다. 모든 <Carousel> 에 전역으로 적용되므로 개별 화면은 손댈 필요 없다.
 */
import { defineNuxtPlugin } from "#app";

interface CarouselInstance {
  $options: { name?: string };
  $el: HTMLElement;
  $: { exposed?: { updateSlideWidth?: () => void } | null };
  __carouselRO?: ResizeObserver;
}

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof ResizeObserver === "undefined") return;

  nuxtApp.vueApp.mixin({
    mounted(this: CarouselInstance) {
      if (this.$options.name !== "Carousel") return;
      const update = this.$.exposed?.updateSlideWidth;
      const el = this.$el;
      if (!update || !(el instanceof HTMLElement)) return;
      this.__carouselRO = new ResizeObserver(() => update());
      this.__carouselRO.observe(el);
    },
    beforeUnmount(this: CarouselInstance) {
      this.__carouselRO?.disconnect();
      this.__carouselRO = undefined;
    },
  });
});
