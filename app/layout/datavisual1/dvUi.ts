/**
 * dvUi — datavisual1(DataVisual) 화면 공통 상태: 테마·토스트·대시보드 배치(레이아웃 편집·위젯 관리가 같이 쓴다).
 * datavisual1 화면은 전부 CSR(routeRules "/**" ssr:false)이다.
 */
import { ref } from "vue";
import { useState } from "#app";
import { DV_LAYOUT_KEY, dvDefaultLayout, dvPackLayout, dvWidgetType, type DvLayoutItem, type DvWidgetType } from "~/conts/tenant/datavisual1";

/* ── 테마 — 원본과 같은 저장 키(dv-theme), 기본 다크. Layout 이 html[data-theme] 와 함께 바꾸고, 차트는 이 값을 보고 색을 다시 읽는다 ── */
export type DvTheme = "light" | "dark";
const THEME_KEY = "dv-theme";
export const useDvTheme = () =>
  useState<DvTheme>("datavisual1-theme", () => {
    if (import.meta.client) {
      try {
        return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
      } catch {
        /* 저장소를 못 쓰면 다크 */
      }
    }
    return "dark";
  });
export function dvApplyTheme(t: DvTheme) {
  if (!import.meta.client) return;
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* 저장 못 해도 화면은 바뀐다 */
  }
}

/* ── 토스트 (오른쪽 아래, 2초) ── */
const toastState = ref<{ show: boolean; msg: string; success: boolean }>({ show: false, msg: "", success: true });
export const useDvToast = () => toastState;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
export function dvToast(msg: string, success = true) {
  if (toastTimer) clearTimeout(toastTimer);
  toastState.value = { show: true, msg, success };
  toastTimer = setTimeout(() => (toastState.value = { ...toastState.value, show: false }), 2000);
}

/* ── 대시보드 배치 — 원본은 레이아웃 편집만 저장(dv_layout)했고 위젯 관리 화면의 추가·제거는 저장되지 않았다.
      두 화면이 같은 배치를 보고 고치도록 한 곳에 둔다(위젯 관리는 바로 저장, 레이아웃 편집은 [저장] 버튼). ── */
function loadSaved(): DvLayoutItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(DV_LAYOUT_KEY) || "null");
    if (Array.isArray(saved)) return dvPackLayout(saved.filter((x) => x && typeof x.typeId === "string"));
  } catch {
    /* 깨진 값이면 기본 배치 */
  }
  return dvDefaultLayout();
}
export function useDvLayout() {
  const items = useState<DvLayoutItem[]>("datavisual1-layout", () => (import.meta.client ? loadSaved() : dvDefaultLayout()));
  function save() {
    try {
      localStorage.setItem(DV_LAYOUT_KEY, JSON.stringify(items.value));
    } catch {
      /* 저장소를 못 쓰면 이번 화면에서만 유지 */
    }
  }
  function reset() {
    items.value = dvDefaultLayout();
  }
  /** 순서·크기가 바뀐 뒤 자리(col,row) 다시 계산 — 겹치지 않게 */
  function pack() {
    dvPackLayout(items.value);
  }
  /** 맨 뒤에 새 위젯(들어갈 첫 빈자리) */
  function add(w: DvWidgetType, title = w.name, colSpan = w.defaultW, rowSpan = w.defaultH): DvLayoutItem {
    const item: DvLayoutItem = { id: `w${Date.now()}${Math.floor(Math.random() * 1000)}`, typeId: w.typeId, title, colSpan, rowSpan, col: 1, row: 1, opts: {} };
    items.value.push(item);
    pack();
    return item;
  }
  function remove(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
    pack();
  }
  const typeOf = (typeId: string) => dvWidgetType(typeId);
  return { items, save, reset, pack, add, remove, typeOf };
}
