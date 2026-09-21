/**
 * carousel-touch-scroll.client.ts — 모바일에서 캐러셀(홈 배너 등) 위에서 세로 스크롤이 안 되던 문제 수정 (2026-09-22, 요청사항: "홈베너는 아래로 스크롤 안되네").
 *
 * 원인: vue3-carousel 의 `.carousel__track` 이 `touch-action: none` 이라 그 위에서 시작한 터치는 브라우저가 스크롤로 쓰지 않는다 — 배너가 화면을 거의 다 채우는
 * 모바일에선 손가락을 어디에 둬도 배너라서 아래 내용을 볼 수 없었다. → `touch-action: pan-y`(세로 스크롤은 브라우저, 가로 스와이프는 캐러셀)로 바꾼다.
 *
 * 부작용 방지: 브라우저가 세로 스크롤을 가져가면 `touchcancel` 이 오고 `touchend` 는 오지 않는다. vue3-carousel 은 `touchend` 로만 드래그를 끝내고
 * 이동량(dragged)을 되돌리므로, 취소된 채로 두면 슬라이드가 몇 px 어긋나 남는다. 캐러셀이 문서에 걸어 둔 touchend 핸들러가 정리하도록 touchcancel 을 touchend 로 전달한다.
 */
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(() => {
  const style = document.createElement("style");
  style.textContent = ".carousel__track{touch-action:pan-y !important}";
  document.head.appendChild(style);

  document.addEventListener("touchcancel", () => document.dispatchEvent(new Event("touchend")), true);
});
