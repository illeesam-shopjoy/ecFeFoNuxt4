/**
 * datavisual1 모듈 설정 — DataVisual 데이터 시각화 대시보드. 사이트 SI260005 (2026-10-03, 사용자 요청: "데이타시각화야 추가해줘").
 * 원본: C:\_pjt_github\p2604_modunuri_illeesam\dataVisual_v26\datavisual_v260406 (Vue CDN SPA + Chart.js 4) 를 Nuxt 화면으로 옮겼다.
 * 화면은 app/pages/datavisual1, 위젯·패널은 app/components/datavisual1, 레이아웃·차트 도우미는 app/layout/datavisual1, 스타일은 app/assets/datavisual1 에 독립으로 있다.
 * 차트 데이터는 원본처럼 화면에서 만든 예시(랜덤) 값이다 — 백엔드 호출 없음.
 */
// ⚠️ nuxt.config.ts 가 빌드 설정을 읽을 때 이 파일을 그대로 import 한다 — 런타임 모듈(#app, vue, chart.js 등)은 import 하지 말 것(타입·상수·순수 함수만).
import type { TenantConfigType } from "~/types/tenantConfig";

const tenant: TenantConfigType = {
  id: "datavisual1",
  name: "DataVisual",
  tagline: "데이터 시각화 대시보드",
  appTitle: "DataVisual",
  themeColor: "#0099cc",
  // 이 모듈의 전역 스타일 — app/assets/datavisual1/ (쇼핑몰 테마 scss 는 넣지 않는다: 원본 대시보드 스타일만)
  css: ["~/assets/datavisual1/style.css"],
  features: {},
  menus: [
    { menuTreeId: 1, link: "/", title: "대시보드" },
    { menuTreeId: 2, link: "/gallery", title: "차트 갤러리" },
    { menuTreeId: 3, link: "/realtime", title: "실시간" },
    { menuTreeId: 4, link: "/panels", title: "패널" },
    { menuTreeId: 5, link: "/manager", title: "위젯 관리" },
    { menuTreeId: 6, link: "/layout", title: "레이아웃 편집" },
  ],
};

export default tenant;

export const DV_VERSION = "v260406";

/** 차트 기본 색 (원본 DV_CONFIG.palette) */
export const DV_PALETTE = ["#0099cc", "#00c97a", "#7c3aed", "#f59e0b", "#ef4444", "#0d9488", "#e91e8c", "#ff6f3c", "#00bcd4", "#8bc34a"];

/* ── 메뉴 ── */
export interface DvMenuItem { key: string; label: string; icon: string; to: string }
export const DV_TOP_MENU: DvMenuItem[] = [
  { key: "dashboard", label: "대시보드", icon: "🏠", to: "/" },
  { key: "gallery", label: "차트 갤러리", icon: "📈", to: "/gallery" },
  { key: "realtime", label: "실시간", icon: "⚡", to: "/realtime" },
  { key: "panels", label: "패널", icon: "🔲", to: "/panels" },
  { key: "manager", label: "위젯 관리", icon: "🧩", to: "/manager" },
  { key: "layout", label: "레이아웃 편집", icon: "🖱️", to: "/layout" },
];
export const DV_SIDEBAR_MENU: { section: string; items: DvMenuItem[] }[] = [
  { section: "시각화", items: [
    { key: "dashboard", label: "대시보드", icon: "🏠", to: "/" },
    { key: "gallery", label: "차트 갤러리", icon: "📈", to: "/gallery" },
    { key: "realtime", label: "실시간 패널", icon: "⚡", to: "/realtime" },
    { key: "panels", label: "패널 보기", icon: "🔲", to: "/panels" },
  ] },
  { section: "관리", items: [
    { key: "manager", label: "위젯 관리", icon: "🧩", to: "/manager" },
    { key: "layout", label: "레이아웃 편집", icon: "🖱️", to: "/layout" },
  ] },
];

/* ── 위젯 종류 (원본 DV_CONFIG.widgetTypes) ── */
export interface DvWidgetType { typeId: string; name: string; icon: string; category: string; defaultW: number; defaultH: number }
export const DV_WIDGET_TYPES: DvWidgetType[] = [
  { typeId: "kpi", name: "KPI 카드", icon: "📊", category: "통계", defaultW: 3, defaultH: 1 },
  { typeId: "line", name: "라인 차트", icon: "📈", category: "차트", defaultW: 6, defaultH: 2 },
  { typeId: "bar", name: "바 차트", icon: "📊", category: "차트", defaultW: 6, defaultH: 2 },
  { typeId: "pie", name: "파이 차트", icon: "🥧", category: "차트", defaultW: 4, defaultH: 2 },
  { typeId: "donut", name: "도넛 차트", icon: "🍩", category: "차트", defaultW: 4, defaultH: 2 },
  { typeId: "area", name: "에어리어 차트", icon: "🌊", category: "차트", defaultW: 6, defaultH: 2 },
  { typeId: "radar", name: "레이더 차트", icon: "🕸️", category: "차트", defaultW: 4, defaultH: 2 },
  { typeId: "scatter", name: "산점도 차트", icon: "✨", category: "차트", defaultW: 6, defaultH: 2 },
  { typeId: "bubble", name: "버블 차트", icon: "🫧", category: "차트", defaultW: 6, defaultH: 2 },
  { typeId: "heatmap", name: "히트맵", icon: "🔥", category: "차트", defaultW: 6, defaultH: 2 },
  { typeId: "gauge", name: "게이지", icon: "⏱️", category: "차트", defaultW: 3, defaultH: 2 },
  { typeId: "realtime", name: "실시간 시계열 산점도", icon: "⚡", category: "실시간", defaultW: 8, defaultH: 2 },
  { typeId: "table", name: "데이터 테이블", icon: "📋", category: "데이터", defaultW: 6, defaultH: 3 },
  { typeId: "stackedbar", name: "스택 바 차트", icon: "📊", category: "차트", defaultW: 6, defaultH: 2 },
  { typeId: "horizontalbar", name: "수평 바 차트", icon: "📊", category: "차트", defaultW: 6, defaultH: 2 },
];
export const dvWidgetType = (typeId: string): DvWidgetType => DV_WIDGET_TYPES.find((w) => w.typeId === typeId) ?? { typeId, name: typeId, icon: "📊", category: "-", defaultW: 4, defaultH: 2 };

/* ── 대시보드 기본 배치 (원본 DV_CONFIG.defaultLayout) — 레이아웃 편집·위젯 관리가 같이 쓴다 ── */
export interface DvLayoutItem { id: string; typeId: string; title: string; colSpan: number; rowSpan: number; col: number; row: number; opts?: Record<string, string> }
export const DV_DEFAULT_LAYOUT: Omit<DvLayoutItem, "col" | "row">[] = [
  { id: "w1", typeId: "kpi", colSpan: 3, rowSpan: 1, title: "총 방문자", opts: { value: "128,450", trend: "+12.4%", dir: "up", icon: "👥", color: "blue" } },
  { id: "w2", typeId: "kpi", colSpan: 3, rowSpan: 1, title: "전환율", opts: { value: "4.8%", trend: "+0.6%", dir: "up", icon: "🎯", color: "green" } },
  { id: "w3", typeId: "kpi", colSpan: 3, rowSpan: 1, title: "매출", opts: { value: "₩84.2M", trend: "-2.1%", dir: "down", icon: "💰", color: "orange" } },
  { id: "w4", typeId: "kpi", colSpan: 3, rowSpan: 1, title: "활성 사용자", opts: { value: "3,241", trend: "+8.7%", dir: "up", icon: "🔥", color: "purple" } },
  { id: "w5", typeId: "line", colSpan: 8, rowSpan: 2, title: "월별 방문자 추이" },
  { id: "w6", typeId: "donut", colSpan: 4, rowSpan: 2, title: "트래픽 출처" },
  { id: "w7", typeId: "bar", colSpan: 6, rowSpan: 2, title: "채널별 매출" },
  { id: "w8", typeId: "area", colSpan: 6, rowSpan: 2, title: "누적 수익 추이" },
];
/**
 * 격자 위치(col,row) 다시 계산 — 목록 순서대로 12칸 격자의 왼쪽 위 빈자리부터 채운다(겹침 없음, 빈칸은 뒤 위젯이 메움).
 * 원본은 모든 위젯이 3칸이라고 보고 (순번×3, 순번÷4) 로 자리를 정해 8칸·4칸 위젯이 서로 겹쳤고, 자리 맞바꿈·W+ 뒤에도 겹쳤다.
 */
export function dvPackLayout(items: DvLayoutItem[]): DvLayoutItem[] {
  const used = new Set<string>();
  const free = (r: number, c: number, w: number, h: number) => {
    for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (used.has(`${y},${x}`)) return false;
    return true;
  };
  for (const it of items) {
    const w = Math.max(1, Math.min(12, it.colSpan));
    const h = Math.max(1, Math.min(6, it.rowSpan));
    let placed = false;
    for (let r = 1; !placed; r++) {
      for (let c = 1; c <= 13 - w && !placed; c++) {
        if (!free(r, c, w, h)) continue;
        it.col = c;
        it.row = r;
        for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) used.add(`${y},${x}`);
        placed = true;
      }
    }
  }
  return items;
}
/** 기본 배치 (위치는 dvPackLayout) */
export const dvDefaultLayout = (): DvLayoutItem[] => dvPackLayout(DV_DEFAULT_LAYOUT.map((it) => ({ ...it, opts: { ...(it.opts ?? {}) }, col: 1, row: 1 })));
/** 저장 키 — 원본과 같은 이름(dv_layout) */
export const DV_LAYOUT_KEY = "dv_layout";

/* ── 예시 데이터 생성기 (원본 DvData) ── */
export const DvData = {
  months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  weekdays: ["월", "화", "수", "목", "금", "토", "일"],
  rand: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  randArr: (n: number, min: number, max: number) => Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min),
  randFloat: (min: number, max: number, d = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(d)),
  randArrFloat: (n: number, min: number, max: number) => Array.from({ length: n }, () => parseFloat((Math.random() * (max - min) + min).toFixed(1))),
};
