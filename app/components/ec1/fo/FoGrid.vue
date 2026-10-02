<template>
  <!-- 2026-09-19(요청사항: "ecFeBo 참조하여 <fo-grid 컴포넌트도 만들어서 화면구성에 활용") — ecFeBo(components/comp/FoAreaComp.js)의
       FoGrid 이식. 컬럼 정의(columns) + 행(rows)으로 표를 그리고, 셀은 슬롯(#cell-키)으로 교체할 수 있으며,
       행 펼침(isExpanded + #row-expand), 행 액션 버튼(rowActionsCols), 카드형(layout="card" + #card)을 지원한다.
       페이지네이션은 ecFeBo 와 같이 그리드 밖에서 처리한다(이 컴포넌트는 번호 계산용 pageNo/pageSize 만 받는다).
       ecFeBo 대비 생략: 드래그 정렬, 체크박스 선택, 좌우 고정(pin), 저장 버튼. -->
  <div :class="bare ? '' : 'fo-grid-card'">
    <div v-if="!bare" class="fo-grid-toolbar">
      <span class="fo-grid-title">
        {{ listTitle }}
        <span class="fo-grid-count">{{ countText ?? `총 ${total ?? rows.length}건` }}</span>
        <span v-if="loading" class="ml-2 text-[12px] text-theme font-normal">⏳ 조회 중…</span>
      </span>
      <div class="ml-auto flex gap-1.5"><slot name="toolbar-actions" /></div>
    </div>

    <!-- 표 -->
    <div v-if="layout === 'table'" class="fo-grid-scroll relative overflow-auto" :style="tableMaxHeight ? { maxHeight: tableMaxHeight } : {}">
      <div v-if="loading && rows.length" class="absolute inset-0 z-[5] bg-white/55 flex items-start justify-center pt-10">
        <span class="text-[13px] text-theme bg-white border border-[#e5e7eb] rounded-full px-3.5 py-1 shadow">⏳ 조회 중…</span>
      </div>
      <table ref="tableRef" class="fo-grid-table" :style="minWidth ? { minWidth } : {}">
        <thead>
          <tr>
            <th v-if="showRowNo" class="w-[52px] text-center">번호</th>
            <slot name="head">
              <th v-for="col in visCols()" :key="col.key" :class="col.cls" :style="{ width: col.width, textAlign: 'center', cursor: col.sortKey ? 'pointer' : undefined }" @click="col.sortKey && emit('sort', col.sortKey)">
                {{ col.label }}
              </th>
            </slot>
            <th v-if="rowActionsCols?.length" class="w-[80px] text-center">관리</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, idx) in rows" :key="rowKey ? row[rowKey] : idx">
            <tr :class="[rowClick ? 'fo-grid-clickable' : '', rowClass?.(row, idx)]" :style="rowStyle?.(row, idx)" @click="onRowClick(row)">
              <td v-if="showRowNo" class="text-center text-gray-400 text-[0.74rem]" @click="emit('cell-click', { row, colKey: '__no__', rowIndex: idx })">{{ rowNo(idx) }}</td>
              <template v-for="col in visCols()" :key="col.key">
                <!-- 셀 전체 교체 슬롯: <td> 를 직접 그린다 (ecFeBo 와 동일 규칙) -->
                <slot :name="`cell-${col.key}`" :row="row" :idx="idx" :no="rowNo(idx)">
                  <td :style="tdStyle(col, row)" :class="cellCls(col, row)" :title="cellTitle(col, row)" @click="emit('cell-click', { row, col, colKey: col.key, rowIndex: idx })">
                    <span v-if="col.link" class="fo-grid-link">{{ cellText(col, row) }}</span>
                    <span v-else-if="col.badge" class="fo-grid-badge" :class="badgeCls(col, row)" :style="badgeStyle(col, row)">{{ cellText(col, row) }}</span>
                    <template v-else>{{ cellText(col, row) }}</template>
                  </td>
                </slot>
              </template>
              <td v-if="rowActionsCols?.length" class="text-center whitespace-nowrap" @click.stop>
                <slot name="row-actions" :row="row" :idx="idx">
                  <template v-for="(a, ai) in rowActionsCols" :key="ai">
                    <template v-if="actVisible(a, row, idx)">
                      <a v-if="a.href" :href="a.href(row, idx)" :target="a.target || '_blank'" rel="noopener" class="fo-grid-act" :class="val(a.cls, row, idx)" :title="val(a.title, row, idx)">{{ val(a.label, row, idx) }}</a>
                      <button v-else type="button" class="fo-grid-act" :class="val(a.cls, row, idx)" :title="val(a.title, row, idx)" :disabled="a.disabled?.(row, idx)" @click="a.onClick?.(row, idx)">{{ val(a.label, row, idx) }}</button>
                    </template>
                  </template>
                </slot>
              </td>
            </tr>
            <tr v-if="isExpanded?.(row, idx)" class="fo-grid-expand-row">
              <slot name="row-expand" :row="row" :idx="idx" :colspan="colspanOf()">
                <td :colspan="colspanOf()"></td>
              </slot>
            </tr>
          </template>
          <tr v-if="!rows.length">
            <td :colspan="colspanOf()" class="fo-grid-empty">
              <span v-if="loading">⏳ 조회 중…</span>
              <span v-else>{{ emptyText }}</span>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="$slots.tfoot && rows.length"><slot name="tfoot" :rows="rows" :colspan="colspanOf()" /></tfoot>
      </table>
    </div>

    <!-- 카드형: #card 슬롯이 내용을 전담(row/idx/no). 슬롯이 없으면 첫 컬럼=제목, 나머지=라벨:값 기본 카드 -->
    <div v-else class="fo-grid-cardview" :style="{ '--fo-grid-card-min': cardMinWidth }">
      <div v-if="loading && !rows.length" class="fo-grid-empty">⏳ 조회 중…</div>
      <div v-else-if="!rows.length" class="fo-grid-empty">{{ emptyText }}</div>
      <template v-else>
        <div v-for="(row, idx) in rows" :key="rowKey ? row[rowKey] : idx" :class="[cardClass || 'fo-grid-card-item', rowClass?.(row, idx), rowClick ? 'fo-grid-clickable' : '']" :style="rowStyle?.(row, idx)" @click="onRowClick(row)">
          <slot name="card" :row="row" :idx="idx" :no="rowNo(idx)">
            <div class="fo-grid-card-default-title">{{ firstText(row) }}</div>
            <div v-for="col in visCols().slice(1)" :key="col.key" class="fo-grid-card-default-row">
              <b>{{ col.label }}</b><span>{{ cellText(col, row) }}</span>
            </div>
          </slot>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends FoRow">
import { onMounted, onUpdated, ref } from "vue";
import type { FoGridColumn, FoGridRowAction, FoRow } from "~/types/fo/foCompType";

const props = withDefaults(
  defineProps<{
    columns: FoGridColumn[];
    rows?: T[];
    /** 행 key 로 쓸 필드명 (없으면 index) */
    rowKey?: string;
    listTitle?: string;
    /** 제목 옆 "총 N건" 의 N (없으면 rows.length) */
    total?: number;
    /** "총 N건" 문구를 통째로 교체 */
    countText?: string;
    loading?: boolean;
    emptyText?: string;
    /** true = 카드/툴바 없이 <table> 만 */
    bare?: boolean;
    minWidth?: string;
    tableMaxHeight?: string;
    /** 번호 컬럼 */
    showRowNo?: boolean;
    /** 번호 계산용(페이징 화면): (pageNo-1)*pageSize+idx+1 */
    pageNo?: number;
    pageSize?: number;
    rowClick?: (row: T) => void;
    rowClass?: (row: T, idx: number) => string;
    rowStyle?: (row: T, idx: number) => string | Record<string, string>;
    isExpanded?: (row: T, idx: number) => boolean;
    rowActionsCols?: FoGridRowAction[];
    layout?: "table" | "card";
    cardMinWidth?: string;
    cardClass?: string;
  }>(),
  { rows: () => [], listTitle: "목록", emptyText: "데이터가 없습니다.", showRowNo: false, layout: "table", cardMinWidth: "220px" }
);
const emit = defineEmits<{
  (e: "sort", key: string): void;
  (e: "row-click", row: T): void;
  (e: "cell-click", payload: { row: T; col?: FoGridColumn; colKey?: string; rowIndex: number }): void;
}>();

// 파생값은 computed 대신 일반 함수 — 템플릿 렌더 시 props 를 읽으므로 반응성은 그대로 유지된다
const visCols = () => props.columns.filter((c) => !c.hidden);
const colspanOf = () => visCols().length + (props.showRowNo ? 1 : 0) + (props.rowActionsCols?.length ? 1 : 0);
const firstText = (row: FoRow) => {
  const c = visCols()[0];
  return c ? cellText(c, row) : "";
};
// ── 모바일: 표를 카드(행마다 한 덩어리, 셀은 "라벨  값")로 바꿔 그린다 ────────────────────────────
// 2026-09-22(요청사항: "fo-grid 모바일에서 가로 스크롤이 생기면 안 되고 모바일에 맞게") — 좁은 화면(<640px)에서는 CSS 가 thead 를 숨기고 tr/td 를 블록으로 쌓는다.
// 셀 라벨은 컬럼 순서대로 td 의 data-label 로 붙인다(슬롯이 직접 그리는 <td> 도 포함하려고 렌더 후 DOM 에서 채운다).
const tableRef = ref<HTMLTableElement | null>(null);
const NO_LABEL = /^(이미지|상품|상품명|제거|삭제|관리|번호)?$/; // 라벨 없이 값만 보여줄 셀(이미지·상품명·삭제 버튼 등)
function labelCells() {
  const t = tableRef.value;
  if (!t) return;
  const cols = visCols();
  const off = props.showRowNo ? 1 : 0;
  t.querySelectorAll("tbody > tr:not(.fo-grid-expand-row)").forEach((tr) => {
    Array.from(tr.children).forEach((td, i) => {
      if (td.tagName !== "TD" || td.hasAttribute("colspan")) return;
      const label = i < off ? "번호" : (cols[i - off]?.label ?? "");
      td.setAttribute("data-label", NO_LABEL.test(label) ? "" : label);
    });
  });
}
onMounted(labelCells);
onUpdated(labelCells);

const rowNo = (idx: number) => ((props.pageNo ?? 1) - 1) * (props.pageSize ?? props.rows.length) + idx + 1;

function onRowClick(row: T) {
  props.rowClick?.(row);
  emit("row-click", row);
}

// ── 셀 표시 (ecFeBo _foAreaCompUtil 이식) ──────────────────────────────
function cellText(col: FoGridColumn, row: FoRow): string | number {
  const v = row?.[col.key];
  if (typeof col.fmt === "function") return col.fmt(v, row);
  return v == null ? "" : v;
}
function cellTitle(col: FoGridColumn, row: FoRow): string | undefined {
  const t = cellText(col, row);
  return t === "" ? undefined : String(t);
}
/** 자동 정렬: 금액/수량류=우측, 코드/상태/일자류=가운데, 그 외 좌측. col.align 이 있으면 그걸 쓴다 */
function autoAlign(col: FoGridColumn): string {
  if (col.align) return col.align;
  const k = col.key.toLowerCase();
  const l = col.label || "";
  if (/viewcnt|hitcnt|viewcount|readcnt/.test(k) || /조회수|방문수|클릭수/.test(l)) return "center";
  const MONEY = ["amt", "price", "balance", "fee", "qty", "cnt", "count", "rate", "cost", "stock", "point", "sum", "total", "value"];
  if (MONEY.some((t) => new RegExp(`(^|_)${t}(_|$)|${t}$`).test(k)) || /금액|가격|잔액|배송비|수량|건수|단가|합계|총액|포인트|적립금|재고|\(원\)|율$/.test(l)) return "right";
  if (/(^|_)(cd|code|status|type|yn|flag|state)$/.test(k) || /cd$|status$|yn$|type$|date$/.test(k) || /^상태$|^유형$|^구분$|여부|^코드$|^등급$|일$|일시$|기간/.test(l)) return "center";
  return "left";
}
function tdStyle(col: FoGridColumn, row: FoRow): Record<string, string> {
  const s: Record<string, string> = { textAlign: autoAlign(col) };
  if (col.mono) s.fontFamily = "monospace";
  if (col.link) s.cursor = "pointer";
  if (!col.noEllipsis) Object.assign(s, { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: col.width || "320px" });
  const ext = typeof col.cellStyle === "function" ? col.cellStyle(row[col.key], row) : col.cellStyle;
  if (ext) ext.split(";").forEach((p) => {
    const [k, ...v] = p.split(":");
    if (k && v.length) s[k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v.join(":").trim();
  });
  return s;
}
function cellCls(col: FoGridColumn, row: FoRow): string {
  return (typeof col.cellClass === "function" ? col.cellClass(row[col.key], row) : col.cellClass) || "";
}
const BADGE_CLASS: Record<string, string> = { green: "b-green", blue: "b-blue", red: "b-red", gray: "b-gray", orange: "b-orange" };
function badgeVal(col: FoGridColumn, row: FoRow): string {
  return typeof col.badge === "function" ? col.badge(row) : "gray";
}
const badgeCls = (col: FoGridColumn, row: FoRow) => BADGE_CLASS[badgeVal(col, row)] || "";
const badgeStyle = (col: FoGridColumn, row: FoRow) => {
  const v = badgeVal(col, row);
  return v.startsWith("#") ? { background: v, color: "#fff" } : {};
};

// ── 행 액션 (label/cls/title 은 문자열 또는 (row,idx)=>값) ──────────────────
const val = <V,>(v: V | ((row: FoRow, idx: number) => V) | undefined, row: FoRow, idx: number): V | undefined => (typeof v === "function" ? (v as (r: FoRow, i: number) => V)(row, idx) : v);
const actVisible = (a: FoGridRowAction, row: FoRow, idx: number) => (a.visible ? !!a.visible(row, idx) : true);
</script>

<style scoped>
/* 모바일 카드형 표 — 가로 스크롤 없이 한 열로 쌓는다 */
@media (max-width: 639px) {
  .fo-grid-scroll {
    overflow: visible !important;
    max-height: none !important;
  }
  .fo-grid-table {
    display: block;
    min-width: 0 !important;
    width: 100%;
  }
  .fo-grid-table thead {
    display: none;
  }
  .fo-grid-table :deep(tbody),
  .fo-grid-table :deep(tbody tr),
  .fo-grid-table :deep(tbody td) {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  .fo-grid-table :deep(tbody tr:not(.fo-grid-expand-row)) {
    margin-bottom: 12px;
    padding: 6px 14px;
    background: #fff !important;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }
  .fo-grid-table :deep(tbody td) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 0;
    border-bottom: 1px dashed #eee;
    text-align: right !important;
    white-space: normal !important;
    max-width: none !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  .fo-grid-table :deep(tbody tr:not(.fo-grid-expand-row) td:last-child) {
    border-bottom: 0;
  }
  .fo-grid-table :deep(tbody td[data-label]:not([data-label=""])::before) {
    content: attr(data-label);
    flex: none;
    font-size: 0.76rem;
    font-weight: 600;
    color: #9ca3af;
    text-align: left;
  }
  /* 라벨 없는 셀(이미지·상품명·삭제)은 값만, 가운데/왼쪽으로 */
  .fo-grid-table :deep(tbody td[data-label=""]) {
    display: block;
    text-align: left !important;
  }
  .fo-grid-table :deep(tbody td[data-label=""]:first-child) {
    text-align: center !important;
  }
  .fo-grid-table :deep(.fo-grid-expand-row td) {
    display: block;
    width: 100%;
  }
  /* 합계 줄(tfoot): 라벨(th)과 값(td)을 양끝으로 */
  .fo-grid-table :deep(tfoot),
  .fo-grid-table :deep(tfoot tr) {
    display: block;
    width: 100%;
  }
  .fo-grid-table :deep(tfoot tr) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 4px;
    border-top: 1px solid #eee;
  }
  .fo-grid-table :deep(tfoot th),
  .fo-grid-table :deep(tfoot td) {
    display: block;
    width: auto;
    border: 0;
    padding: 0;
  }
}
.fo-grid-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.fo-grid-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.fo-grid-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #111827;
}
.fo-grid-count {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 600;
  margin-left: 6px;
}
.fo-grid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.fo-grid-table thead tr {
  background: #f8f5f1;
}
.fo-grid-table thead th {
  padding: 10px 12px;
  font-weight: 700;
  color: #7a5a35;
  border-bottom: 1.5px solid #e5e7eb;
  white-space: nowrap;
}
.fo-grid-table :deep(tbody td) {
  padding: 10px 12px;
  color: #4b5563;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.fo-grid-table :deep(tbody tr:nth-child(even):not(.fo-grid-expand-row)) {
  background: #fcfcfb;
}
.fo-grid-table :deep(tbody tr.fo-grid-clickable) {
  cursor: pointer;
}
.fo-grid-table :deep(tbody tr.fo-grid-clickable:hover) {
  background: #faf5ee;
}
.fo-grid-table :deep(tfoot td),
.fo-grid-table :deep(tfoot th) {
  padding: 10px 12px;
  border-top: 1.5px solid #e5e7eb;
  font-weight: 700;
  color: #111827;
}
.fo-grid-link {
  color: #bc8246;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.fo-grid-badge {
  display: inline-block;
  padding: 1px 9px;
  border-radius: 9px;
  font-size: 0.72rem;
  font-weight: 700;
  background: #f3f4f6;
  color: #6b7280;
}
.fo-grid-badge.b-green { background: #dcfce7; color: #15803d; }
.fo-grid-badge.b-blue { background: #dbeafe; color: #1d4ed8; }
.fo-grid-badge.b-red { background: #fee2e2; color: #dc2626; }
.fo-grid-badge.b-orange { background: #ffedd5; color: #c2410c; }
.fo-grid-badge.b-gray { background: #f3f4f6; color: #6b7280; }
.fo-grid-empty {
  text-align: center;
  padding: 36px 12px;
  color: #9ca3af;
}
.fo-grid-act {
  display: inline-block;
  padding: 3px 10px;
  margin: 0 2px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: none;
}
.fo-grid-act:hover:not(:disabled) {
  border-color: #9ca3af;
}
.fo-grid-act:disabled {
  opacity: 0.4;
  cursor: default;
}
.fo-grid-cardview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--fo-grid-card-min, 220px), 1fr));
  gap: 14px;
}
.fo-grid-cardview .fo-grid-empty {
  grid-column: 1 / -1;
}
.fo-grid-card-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.15s, box-shadow 0.15s;
}
.fo-grid-card-item.fo-grid-clickable {
  cursor: pointer;
}
.fo-grid-card-item.fo-grid-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.fo-grid-card-default-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
  font-size: 0.9rem;
}
.fo-grid-card-default-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
  padding: 2px 0;
  color: #4b5563;
}
.fo-grid-card-default-row b {
  color: #9ca3af;
  font-weight: 600;
}
</style>
