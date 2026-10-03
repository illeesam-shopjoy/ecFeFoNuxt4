<template>
  <!-- 위젯 관리 — 위젯 종류 목록(검색·분류)에서 추가/제거/설정. 원본 pages/WidgetManager.js.
       바뀐 점: 원본은 여기서 고친 내용이 저장되지 않았다 → 레이아웃 편집과 같은 배치(dv_layout)를 고치고 바로 저장한다. -->
  <layout>
    <div class="page-wrap">
      <div class="page-head">
        <div>
          <h1 class="section-title">🧩 위젯 관리</h1>
          <p class="section-subtitle">대시보드에 표시할 위젯을 추가·제거·설정합니다 (레이아웃 편집과 같은 배치)</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <button type="button" class="btn-primary btn-sm" @click="handleBtnAction('all-on')">모두 활성화</button>
          <button type="button" class="btn-outline btn-sm" @click="handleBtnAction('all-off')">모두 비활성화</button>
          <nuxt-link to="/layout" class="btn-outline btn-sm">🖱️ 레이아웃 편집</nuxt-link>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap">
        <input v-model="search" type="search" class="form-input" placeholder="위젯명 검색…" style="max-width: 240px" aria-label="위젯명 검색" />
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <button v-for="cat in cats" :key="cat" type="button" class="btn-outline btn-sm" :class="{ 'is-on': activeCat === cat }" @click="activeCat = cat">{{ cat }}</button>
        </div>
      </div>

      <div class="grid-4" style="margin-bottom: 20px">
        <div v-for="s in stats" :key="s.label" class="kpi-card" :style="{ borderTop: `3px solid var(--${s.color})` }">
          <div class="kpi-label">{{ s.label }}</div>
          <div class="kpi-value" :style="{ color: `var(--${s.color})`, fontSize: '1.6rem' }">{{ s.value }}</div>
        </div>
      </div>

      <!-- 위젯 종류 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-bottom: 24px">
        <div v-for="w in filteredTypes" :key="w.typeId" class="widget-catalog-item" :class="{ 'is-active': isActive(w.typeId) }" style="cursor: default">
          <div class="widget-catalog-icon">{{ w.icon }}</div>
          <div style="flex: 1; min-width: 0">
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px">{{ w.name }}</div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap">
              <span class="badge badge-blue" style="font-size: 0.62rem">{{ w.category }}</span>
              <span style="font-size: 0.68rem; color: var(--text-muted)">기본 {{ w.defaultW }}×{{ w.defaultH }}</span>
              <span v-if="countOf(w.typeId) > 1" style="font-size: 0.68rem; color: var(--blue)">{{ countOf(w.typeId) }}개 배치</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px">
            <button v-if="!isActive(w.typeId)" type="button" class="btn-primary btn-sm" @click="handleBtnAction('type-add', w.typeId)">추가</button>
            <button v-else type="button" class="btn-danger btn-sm" @click="handleBtnAction('type-remove', w.typeId)">제거</button>
            <button type="button" class="btn-outline btn-sm" :aria-label="`${w.name} 설정`" @click="handleBtnAction('type-config', w.typeId)">⚙️</button>
          </div>
        </div>
      </div>

      <!-- 배치된 위젯 -->
      <div v-if="items.length" style="margin-bottom: 24px">
        <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px">활성화된 위젯 ({{ items.length }}개)</div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <div v-for="it in items" :key="it.id" class="card" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px">
            <span style="font-size: 1.2rem">{{ typeOf(it.typeId).icon }}</span>
            <div style="flex: 1; min-width: 0">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary)">{{ it.title || typeOf(it.typeId).name }}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted)">{{ typeOf(it.typeId).category }} · {{ it.colSpan }}×{{ it.rowSpan }}</div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center">
              <span class="badge badge-green" style="font-size: 0.62rem">활성</span>
              <button type="button" class="btn-outline btn-sm" :aria-label="`${it.title} 설정`" @click="handleBtnAction('item-config', it.id)">⚙️</button>
              <button type="button" class="btn-danger btn-sm" :aria-label="`${it.title} 제거`" @click="handleBtnAction('item-remove', it.id)">✕</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="card" style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px">배치된 위젯이 없습니다. 위에서 추가하세요.</div>
    </div>

    <!-- 위젯 설정 -->
    <div v-if="cfg" class="modal-overlay" @click.self="cfg = null">
      <div class="modal-box" style="max-width: 400px">
        <div style="font-size: 1.2rem; margin-bottom: 4px">{{ typeOf(cfg.typeId).icon }} {{ typeOf(cfg.typeId).name }}</div>
        <div class="modal-title">위젯 설정</div>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px">
          <div>
            <label class="form-label" for="dv-cfg-title">위젯 제목</label>
            <input id="dv-cfg-title" v-model="cfg.title" class="form-input" :placeholder="typeOf(cfg.typeId).name" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
            <div>
              <label class="form-label" for="dv-cfg-w">가로 크기 (1–12)</label>
              <input id="dv-cfg-w" v-model.number="cfg.w" type="number" min="1" max="12" class="form-input" />
            </div>
            <div>
              <label class="form-label" for="dv-cfg-h">세로 크기 (1–6)</label>
              <input id="dv-cfg-h" v-model.number="cfg.h" type="number" min="1" max="6" class="form-input" />
            </div>
          </div>
          <div>
            <span class="form-label">카테고리</span>
            <div style="padding: 8px 12px; background: var(--blue-dim); border-radius: 7px; font-size: 0.82rem; color: var(--blue); font-weight: 600">{{ typeOf(cfg.typeId).category }}</div>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-outline" @click="cfg = null">취소</button>
          <button type="button" class="btn-primary" @click="handleBtnAction('config-save')">{{ cfg.itemId ? "저장" : "추가" }}</button>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";
import { DV_WIDGET_TYPES } from "~/conts/tenant/datavisual1";
import { dvToast, useDvLayout } from "~/layout/datavisual1/dvUi";

useHead({ title: "위젯 관리" });
const { items, save, pack, add, remove, typeOf } = useDvLayout();
const { openConfirm } = useConfirm();

const search = ref("");
const activeCat = ref("전체");
const cats = ["전체", ...new Set(DV_WIDGET_TYPES.map((w) => w.category))];
const filteredTypes = computed(() => {
  const q = search.value.trim().toLowerCase();
  return DV_WIDGET_TYPES.filter((w) => activeCat.value === "전체" || w.category === activeCat.value).filter((w) => !q || w.name.toLowerCase().includes(q));
});
const countOf = (typeId: string) => items.value.filter((i) => i.typeId === typeId).length;
const isActive = (typeId: string) => countOf(typeId) > 0;
const stats = computed(() => {
  const activeTypes = DV_WIDGET_TYPES.filter((w) => isActive(w.typeId)).length;
  return [
    { label: "전체 위젯", value: DV_WIDGET_TYPES.length, color: "blue" },
    { label: "활성 위젯", value: items.value.length, color: "green" },
    { label: "비활성", value: DV_WIDGET_TYPES.length - activeTypes, color: "orange" },
    { label: "카테고리", value: cats.length - 1, color: "purple" },
  ];
});

/** 설정 창 — itemId 가 있으면 그 위젯 수정, 없으면 새로 추가 */
const cfg = ref<{ typeId: string; itemId: string; title: string; w: number; h: number } | null>(null);
function openConfig(typeId: string, itemId?: string) {
  const it = items.value.find((i) => (itemId ? i.id === itemId : i.typeId === typeId));
  const t = typeOf(typeId);
  cfg.value = { typeId, itemId: it?.id ?? "", title: it?.title ?? t.name, w: it?.colSpan ?? t.defaultW, h: it?.rowSpan ?? t.defaultH };
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(Number(v) || lo)));
function commit(msg: string) {
  save();
  dvToast(msg);
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string, id = "") => {
  if (cmd === "type-add") {
    add(typeOf(id));
    return commit(`${typeOf(id).name} 추가됨`);
  }
  if (cmd === "type-remove") {
    // 같은 종류가 여러 개면 마지막 것부터
    const last = [...items.value].reverse().find((i) => i.typeId === id);
    if (last) remove(last.id);
    return commit(`${typeOf(id).name} 제거됨`);
  }
  if (cmd === "type-config") return openConfig(id);
  if (cmd === "item-config") {
    const it = items.value.find((i) => i.id === id);
    return it && openConfig(it.typeId, it.id);
  }
  if (cmd === "item-remove") {
    remove(id);
    return commit("위젯 제거됨");
  }
  if (cmd === "config-save") {
    const c = cfg.value;
    if (!c) return;
    const t = typeOf(c.typeId);
    const title = c.title.trim() || t.name;
    const target = c.itemId ? items.value.find((i) => i.id === c.itemId) : undefined;
    if (target) {
      Object.assign(target, { title, colSpan: clamp(c.w, 1, 12), rowSpan: clamp(c.h, 1, 6) });
      pack();
    } else add(t, title, clamp(c.w, 1, 12), clamp(c.h, 1, 6));
    cfg.value = null;
    return commit("위젯 설정 저장됨");
  }
  if (cmd === "all-on") {
    DV_WIDGET_TYPES.filter((w) => !isActive(w.typeId)).forEach((w) => add(w));
    return commit("모든 위젯 활성화");
  }
  if (cmd === "all-off") {
    if (!(await openConfirm({ title: "모두 비활성화", message: "배치된 위젯을 모두 뺄까요? (기본 배치는 레이아웃 편집의 [초기화]로 되돌릴 수 있습니다)", confirmText: "모두 빼기", variant: "danger" }))) return;
    items.value = [];
    return commit("모든 위젯 비활성화");
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
