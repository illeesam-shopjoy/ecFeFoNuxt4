<template>
  <!-- 레이아웃 편집 — 12칸 격자에 위젯을 끌어 순서(자리) 바꾸기·크기 조절·삭제·추가, [저장]하면 브라우저에 남는다(dv_layout). 원본 pages/LayoutManager.js
       자리는 순서대로 빈칸을 채워 계산한다(dvPackLayout) — 원본은 자리를 맞바꾸거나 W+ 하면 위젯이 서로 겹쳤다. -->
  <layout>
    <div class="page-wrap">
      <div class="page-head">
        <div>
          <h1 class="section-title">🖱️ 레이아웃 편집</h1>
          <p class="section-subtitle">위젯을 드래그하여 재배치하고 크기를 조절하세요</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <button type="button" class="btn-outline btn-sm" @click="handleBtnAction('layout-reset')">↺ 초기화</button>
          <button type="button" class="btn-outline btn-sm" @click="addOpen = true">+ 위젯 추가</button>
          <button type="button" class="btn-primary btn-sm" @click="handleBtnAction('layout-save')">💾 저장</button>
        </div>
      </div>

      <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; padding: 10px 14px; background: var(--blue-dim); border-radius: var(--radius); font-size: 0.75rem; color: var(--blue)">
        <span>🖱️ 헤더 드래그 → 재배치</span>
        <span>↔ 가로/세로 크기 조절 버튼</span>
        <span>✕ 위젯 삭제</span>
        <span>12컬럼 그리드 기반</span>
      </div>

      <div class="lm-grid" @dragover.prevent @drop="onDrop($event, null)">
        <div
          v-for="item in items"
          :key="item.id"
          class="lm-item"
          :class="{ dragging: dragId === item.id, 'drag-over': dropTarget === item.id }"
          :style="{ gridColumn: `${item.col} / span ${item.colSpan}`, gridRow: `${item.row} / span ${item.rowSpan}` }"
          draggable="true"
          @dragstart="onDragStart($event, item.id)"
          @dragend="onDragEnd"
          @dragover.prevent.stop="dropTarget = item.id"
          @drop.stop="onDrop($event, item.id)"
        >
          <div class="lm-item-header">
            <span class="lm-drag-handle" title="드래그">⣿</span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 6px">{{ typeOf(item.typeId).icon }} {{ item.title }}</span>
            <div class="lm-resize-btns">
              <button type="button" class="lm-resize-btn" title="가로 축소" @click.stop="resize(item, 'w', -1)">W−</button>
              <button type="button" class="lm-resize-btn" title="가로 확대" @click.stop="resize(item, 'w', 1)">W+</button>
              <button type="button" class="lm-resize-btn" title="세로 축소" @click.stop="resize(item, 'h', -1)">H−</button>
              <button type="button" class="lm-resize-btn" title="세로 확대" @click.stop="resize(item, 'h', 1)">H+</button>
              <button type="button" class="lm-resize-btn" title="삭제" style="color: var(--red)" @click.stop="remove(item.id)">✕</button>
            </div>
          </div>
          <div class="lm-item-body">
            <div style="text-align: center">
              <div style="font-size: 2rem; margin-bottom: 4px">{{ typeOf(item.typeId).icon }}</div>
              <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary)">{{ item.title }}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px">{{ item.colSpan }}×{{ item.rowSpan }} 칸</div>
            </div>
          </div>
        </div>
        <div v-if="items.length === 0" style="grid-column: span 12; display: flex; align-items: center; justify-content: center; min-height: 200px; color: var(--text-muted); font-size: 0.9rem">
          위젯을 추가하거나 상단의 "+ 위젯 추가" 버튼을 눌러 시작하세요
        </div>
      </div>

      <div style="margin-top: 20px">
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px">레이아웃 정보 ({{ items.length }}개 위젯){{ dirty ? " · 저장 안 됨" : "" }}</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px">
          <div v-for="item in items" :key="'info-' + item.id" class="card" style="padding: 8px 12px; font-size: 0.72rem">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 3px">{{ typeOf(item.typeId).icon }} {{ item.title }}</div>
            <div style="color: var(--text-muted)">크기: {{ item.colSpan }}×{{ item.rowSpan }} | 위치: {{ item.col }},{{ item.row }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 위젯 추가 -->
    <div v-if="addOpen" class="modal-overlay" @click.self="addOpen = false">
      <div class="modal-box" style="max-width: 520px">
        <div class="modal-title">🧩 위젯 추가</div>
        <input v-model="addSearch" type="search" class="form-input" placeholder="위젯 검색…" style="margin-bottom: 12px" aria-label="위젯 검색" />
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 360px; overflow-y: auto">
          <button v-for="w in addTypes" :key="w.typeId" type="button" class="widget-catalog-item" @click="handleBtnAction('widget-add', w.typeId)">
            <span style="font-size: 1.3rem">{{ w.icon }}</span>
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary)">{{ w.name }}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted)">{{ w.category }} · {{ w.defaultW }}×{{ w.defaultH }}</div>
            </div>
          </button>
        </div>
        <div class="modal-actions" style="margin-top: 16px">
          <button type="button" class="btn-outline" @click="addOpen = false">닫기</button>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";
import { DV_WIDGET_TYPES, type DvLayoutItem } from "~/conts/tenant/datavisual1";
import { dvToast, useDvLayout } from "~/layout/datavisual1/dvUi";

useHead({ title: "레이아웃 편집" });
const { items, save, reset, pack, add, remove, typeOf } = useDvLayout();
const { openConfirm } = useConfirm();

/* 저장 안 된 변경 표시 — 마지막 저장 상태와 비교 */
const savedJson = ref(JSON.stringify(items.value));
const dirty = computed(() => JSON.stringify(items.value) !== savedJson.value);

/* 끌어서 자리 바꾸기 — 놓은 위젯과 순서를 맞바꾸고 자리를 다시 계산한다 */
const dragId = ref<string | null>(null);
const dropTarget = ref<string | null>(null);
function onDragStart(e: DragEvent, id: string) {
  dragId.value = id;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }
}
function onDragEnd() {
  dragId.value = null;
  dropTarget.value = null;
}
function onDrop(e: DragEvent, targetId: string | null) {
  e.preventDefault();
  dropTarget.value = null;
  const srcId = e.dataTransfer?.getData("text/plain") || dragId.value;
  dragId.value = null;
  if (!srcId || !targetId || srcId === targetId) return;
  const a = items.value.findIndex((i) => i.id === srcId);
  const b = items.value.findIndex((i) => i.id === targetId);
  if (a < 0 || b < 0) return;
  const list = [...items.value];
  [list[a], list[b]] = [list[b]!, list[a]!];
  items.value = list;
  pack();
}

function resize(item: DvLayoutItem, dim: "w" | "h", delta: number) {
  if (dim === "w") item.colSpan = Math.max(1, Math.min(12, item.colSpan + delta));
  else item.rowSpan = Math.max(1, Math.min(6, item.rowSpan + delta));
  pack();
}

const addOpen = ref(false);
const addSearch = ref("");
const addTypes = computed(() => {
  const q = addSearch.value.trim().toLowerCase();
  return q ? DV_WIDGET_TYPES.filter((w) => w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q)) : DV_WIDGET_TYPES;
});

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string, typeId = "") => {
  if (cmd === "layout-save") {
    save();
    savedJson.value = JSON.stringify(items.value);
    return dvToast("레이아웃 저장됨");
  }
  if (cmd === "layout-reset") {
    if (!(await openConfirm({ title: "초기화", message: "기본 배치로 되돌릴까요? [저장]을 눌러야 브라우저에 남습니다.", confirmText: "초기화" }))) return;
    return reset();
  }
  if (cmd === "widget-add") {
    add(typeOf(typeId));
    addOpen.value = false;
    return;
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
