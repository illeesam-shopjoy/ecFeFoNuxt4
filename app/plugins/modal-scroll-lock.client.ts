/**
 * modal-scroll-lock.client.ts — 모달(팝업)이 열려 있는 동안 뒤 화면(부모 페이지)이 같이 스크롤되는 문제 수정 (2026-09-22, 요청사항: "모달에서 스크롤하면 부모화면이 스크롤되는 경우").
 *
 * 원인: 모달마다 body 스크롤을 잠그는 코드가 있거나(라이트박스 등) 없었고(대부분), 모달 안 스크롤이 끝에 닿으면 남은 스크롤이 부모로 넘어가는(scroll chaining)
 * 브라우저 기본 동작, 특히 모바일(iOS Safari)은 body 에 overflow:hidden 을 줘도 오버레이를 터치로 끌면 뒤가 스크롤됐다.
 *
 * 해결(모든 모달 공통, 개별 모달 코드는 손대지 않는다):
 *  1) 화면에 보이는 모달/오버레이(role=dialog·alertdialog·aria-modal, 열린 .body-overlay)가 하나라도 있으면 <html>/<body> 를 overflow:hidden 으로 잠근다
 *     (스크롤바가 사라지며 화면이 밀리지 않게 그 너비만큼 padding-right 보정). 모두 닫히면 원래대로 되돌린다. MutationObserver 로 열림/닫힘을 감지한다.
 *  2) 잠긴 동안 터치로 끌 때, 모달 안에서 실제로 더 스크롤할 수 있는 영역(내용이 넘치고 끝에 안 닿음)이 아니면 touchmove 를 막는다(iOS 대응).
 *  3) 전역 CSS(assets/prod/scss/_common.scss)에서 모달 내부 스크롤 영역에 overscroll-behavior: contain 을 준다.
 */
import { defineNuxtPlugin } from "#app";

const MODAL_SELECTOR = '[role="dialog"], [role="alertdialog"], [aria-modal="true"], .body-overlay.opened';

export default defineNuxtPlugin(() => {
  const html = document.documentElement;
  const body = document.body;
  let locked = false;
  let saved = { htmlOverflow: "", bodyOverflow: "", bodyPaddingRight: "" };

  /** 화면에 실제로 보이는 모달이 있는가 — 작은 팝오버(absolute)는 제외하고 fixed 오버레이만 */
  function anyModalOpen(): boolean {
    return Array.from(document.querySelectorAll<HTMLElement>(MODAL_SELECTOR)).some((el) => {
      if (!el.getClientRects().length) return false; // display:none / 분리됨
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.position !== "fixed") return false;
      return Number(cs.opacity) > 0;
    });
  }

  function lock() {
    if (locked) return;
    locked = true;
    saved = { htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow, bodyPaddingRight: body.style.paddingRight };
    const sbw = window.innerWidth - html.clientWidth; // 스크롤바 너비(모바일은 0)
    if (sbw > 0) body.style.paddingRight = `${sbw}px`;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
  }
  function unlock() {
    if (!locked) return;
    locked = false;
    html.style.overflow = saved.htmlOverflow;
    body.style.overflow = saved.bodyOverflow;
    body.style.paddingRight = saved.bodyPaddingRight;
  }

  let raf = 0;
  const sync = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => (anyModalOpen() ? lock() : unlock()));
  };
  new MutationObserver(sync).observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class", "role", "aria-modal"] });
  sync();

  // ── iOS: 오버레이/모달 안의 "더 스크롤할 곳 없는" 터치 이동은 막는다 ──
  let startX = 0;
  let startY = 0;
  document.addEventListener("touchstart", (e) => {
    startX = e.touches[0]?.clientX ?? 0;
    startY = e.touches[0]?.clientY ?? 0;
  }, { passive: true });

  function canScroll(el: HTMLElement, dx: number, dy: number): boolean {
    const cs = getComputedStyle(el);
    if (Math.abs(dy) >= Math.abs(dx)) {
      if (!/(auto|scroll)/.test(cs.overflowY) || el.scrollHeight <= el.clientHeight + 1) return false;
      return dy > 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1; // 손가락 아래로=내용 위로
    }
    if (!/(auto|scroll)/.test(cs.overflowX) || el.scrollWidth <= el.clientWidth + 1) return false;
    return dx > 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  }
  document.addEventListener("touchmove", (e) => {
    if (!locked || e.touches.length !== 1) return;
    const t = e.touches[0]!;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    for (let el = e.target as HTMLElement | null; el && el !== body && el !== html; el = el.parentElement) {
      if (canScroll(el, dx, dy)) return; // 모달 안에서 실제로 스크롤 가능한 영역 — 허용
      if (el.matches?.(MODAL_SELECTOR)) break; // 모달 루트까지 올라왔는데 스크롤할 곳이 없다
    }
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
});
