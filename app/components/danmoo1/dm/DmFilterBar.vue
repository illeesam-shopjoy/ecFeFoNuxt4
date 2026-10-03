<template>
  <!-- 목록 필터줄 — 정렬 · 가격대 · 거래 방법(직거래/문고리/택배, 2026-10-03) · 거래 가능만 보기 (홈·검색 공용). 값은 v-model 로 올리고 조회는 부모가 한다 -->
  <div class="dm-filter no-scrollbar">
    <button type="button" class="dm-filter__btn" :class="{ on: modelValue.sort !== DM_SORTS[0]!.value }" @click="sheet = 'sort'">
      <span>{{ sortLabel }}</span><i class="fas fa-chevron-down text-[10px]"></i>
    </button>
    <button type="button" class="dm-filter__btn" :class="{ on: hasPrice }" @click="sheet = 'price'">
      <span>{{ priceLabel }}</span><i class="fas fa-chevron-down text-[10px]"></i>
    </button>
    <button type="button" class="dm-filter__btn" :class="{ on: !!modelValue.tradeMethodCd }" @click="sheet = 'trade'">
      <span>{{ tradeLabel }}</span><i class="fas fa-chevron-down text-[10px]"></i>
    </button>
    <button type="button" class="dm-filter__btn" :class="{ on: modelValue.onlyAvailable }" @click="update({ onlyAvailable: !modelValue.onlyAvailable })">
      <i :class="modelValue.onlyAvailable ? 'fas fa-check-circle' : 'far fa-circle'" class="text-[13px]"></i><span>거래 가능만</span>
    </button>
    <button v-if="hasPrice || modelValue.sort !== DM_SORTS[0]!.value || modelValue.onlyAvailable || modelValue.tradeMethodCd" type="button" class="dm-filter__btn muted" @click="update({ sort: DM_SORTS[0]!.value, priceMin: undefined, priceMax: undefined, tradeMethodCd: undefined, onlyAvailable: false })">
      <i class="fas fa-undo text-[11px]"></i><span>초기화</span>
    </button>

    <!-- 정렬 -->
    <dm-sheet :open="sheet === 'sort'" title="정렬" @close="sheet = ''">
      <ul class="divide-y divide-[var(--dm-line)]">
        <li v-for="s in DM_SORTS" :key="s.value">
          <button type="button" class="w-full flex items-center justify-between h-12 text-[15.5px]" @click="update({ sort: s.value }); sheet = ''">
            <span :class="{ 'font-bold': s.value === modelValue.sort }">{{ s.label }}</span>
            <i v-if="s.value === modelValue.sort" class="fas fa-check primary"></i>
          </button>
        </li>
      </ul>
    </dm-sheet>

    <!-- 거래 방법 -->
    <dm-sheet :open="sheet === 'trade'" title="거래 방법" @close="sheet = ''">
      <ul class="divide-y divide-[var(--dm-line)]">
        <li v-for="t in TRADE_OPTS" :key="t.code || 'all'">
          <button type="button" class="w-full flex items-center justify-between h-14 text-left" @click="update({ tradeMethodCd: t.code || undefined }); sheet = ''">
            <span class="flex items-center gap-3"><i :class="t.icon" class="w-5 text-center muted"></i><span><b :class="{ primary: (modelValue.tradeMethodCd ?? '') === t.code }" class="text-[15.5px]">{{ t.label }}</b><span v-if="t.desc" class="block text-[12.5px] muted">{{ t.desc }}</span></span></span>
            <i v-if="(modelValue.tradeMethodCd ?? '') === t.code" class="fas fa-check primary"></i>
          </button>
        </li>
      </ul>
    </dm-sheet>

    <!-- 가격대 -->
    <dm-sheet :open="sheet === 'price'" title="가격" @close="sheet = ''">
      <ul class="flex flex-wrap gap-2 mb-4">
        <li v-for="r in DM_PRICE_RANGES" :key="r.label">
          <button type="button" class="h-9 px-3.5 rounded-full text-[14px] font-semibold" :class="isRange(r) ? 'bg-[var(--dm-text)] text-[var(--dm-bg)]' : 'bg-[var(--dm-chip)]'" @click="draft.min = r.min; draft.max = r.max">{{ r.label }}</button>
        </li>
      </ul>
      <div class="flex items-center gap-2">
        <input v-model.number="draft.min" type="number" min="0" step="1000" class="input" placeholder="최소 금액" />
        <span class="muted">~</span>
        <input v-model.number="draft.max" type="number" min="0" step="1000" class="input" placeholder="최대 금액" />
      </div>
      <template #foot>
        <button type="button" class="btn-primary w-full" @click="applyPrice">적용하기</button>
      </template>
    </dm-sheet>
  </div>
</template>

<script setup lang="ts">
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import { DM_PRICE_RANGES, DM_SORTS, DM_TRADE_METHODS } from "~/conts/tenant/danmoo1";

/** tradeMethodCd — DIRECT/DOOR/PARCEL 중 하나를 포함한 물건만(없으면 전체) */
export interface DmFilterValue { sort: string; priceMin?: number; priceMax?: number; tradeMethodCd?: string; onlyAvailable: boolean }
const props = defineProps<{ modelValue: DmFilterValue }>();
const emit = defineEmits<{ (e: "update:modelValue", v: DmFilterValue): void }>();

const sheet = ref<"" | "sort" | "price" | "trade">("");
const TRADE_OPTS = [{ code: "", label: "전체", icon: "fas fa-th-large", desc: "" }, ...DM_TRADE_METHODS.map((m) => ({ code: m.code as string, label: m.label, icon: m.icon as string, desc: m.desc as string }))];
const tradeLabel = computed(() => DM_TRADE_METHODS.find((m) => m.code === props.modelValue.tradeMethodCd)?.label ?? "거래 방법");
const draft = reactive<{ min?: number; max?: number }>({ min: undefined, max: undefined });
watch(sheet, (s) => { if (s === "price") { draft.min = props.modelValue.priceMin; draft.max = props.modelValue.priceMax; } });

const hasPrice = computed(() => props.modelValue.priceMin != null || props.modelValue.priceMax != null);
const sortLabel = computed(() => DM_SORTS.find((s) => s.value === props.modelValue.sort)?.label ?? "정렬");
const won = (n: number) => (n >= 10000 ? `${n / 10000}만` : n.toLocaleString());
const priceLabel = computed(() => {
  const { priceMin: a, priceMax: b } = props.modelValue;
  if (a == null && b == null) return "가격";
  if (a === 0 && b === 0) return "나눔";
  if (a != null && b != null) return `${won(a)}~${won(b)}원`;
  return a != null ? `${won(a)}원 이상` : `${won(b!)}원 이하`;
});
const isRange = (r: { min?: number; max?: number }) => (draft.min ?? null) === (r.min ?? null) && (draft.max ?? null) === (r.max ?? null);
const update = (patch: Partial<DmFilterValue>) => emit("update:modelValue", { ...props.modelValue, ...patch });
const num = (v: unknown) => (v === "" || v == null || Number.isNaN(Number(v)) ? undefined : Number(v));
const applyPrice = () => {
  update({ priceMin: num(draft.min), priceMax: num(draft.max) });
  sheet.value = "";
};
</script>

<style scoped>
.dm-filter { display: flex; gap: 6px; padding: 4px 16px 10px; overflow-x: auto; white-space: nowrap; }
.dm-filter__btn { display: inline-flex; align-items: center; gap: 5px; height: 32px; padding: 0 11px; border-radius: 16px; border: 1px solid var(--dm-line); font-size: 13px; font-weight: 600; flex: none; }
.dm-filter__btn.on { border-color: var(--dm-text); background: var(--dm-text); color: var(--dm-bg); }
</style>
