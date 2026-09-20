<template>
  <!-- 2026-09-19(요청사항: "ecFeBo 참조하여 <fo-form 컴포넌트도 만들어서 화면구성에 활용") — ecFeBo(components/comp/FoAreaComp.js)의
       FoFormArea(<fo-form-area>) 이식. 필드 정의(columns)와 form/errors 객체만 넘기면 라벨·입력·오류 메시지를 그려준다.
       type: text|email|tel|password|number|date|textarea|select|readonly|slot|rowBreak|group. 한 줄 필드 수는 cols, 필드 폭은 colSpan. -->
  <component :is="as" class="fo-form" @submit.prevent="as === 'form' && emit('submit')">
    <div v-for="(row, ri) in layoutRows()" :key="ri" class="grid" :style="{ gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`, gap: `${gap}px`, marginBottom: `${gap}px` }">
      <div v-for="col in row" :key="col.key || col.label" :style="col.colSpan && col.colSpan > 1 ? { gridColumn: `span ${Math.min(col.colSpan, cols)}` } : {}">
        <!-- 섹션 제목 -->
        <div v-if="col.type === 'group'" class="text-[0.95rem] font-extrabold text-gray-900 mb-1" :class="ri === 0 ? '' : 'mt-2'">{{ col.label }}</div>
        <!-- 라벨 -->
        <label v-else-if="col.type !== 'slot' && !col.hideLabel" class="block text-[0.78rem] text-gray-500 mb-1" :for="`fo-form-${col.key}`">
          {{ col.label }}<span v-if="col.required" class="text-theme ml-0.5">*</span>
          <span v-if="col.hint" class="text-[11px] text-gray-400 font-normal ml-1.5">{{ col.hint }}</span>
        </label>

        <!-- 읽기 전용 표시 -->
        <div v-if="col.type === 'readonly'" class="fo-in bg-[#f9fafb] text-gray-700 min-h-[42px] flex items-center">{{ dispVal(col) }}</div>
        <!-- text / email / tel / password -->
        <input
          v-else-if="col.type === 'text' || col.type === 'email' || col.type === 'tel' || col.type === 'password' || !col.type"
          :id="`fo-form-${col.key}`"
          v-model="form[col.key]"
          class="fo-in"
          :class="[errors[col.key] ? 'is-invalid' : '', col.mono ? 'font-mono' : '', col.readonly ? 'bg-[#f5f5f5] cursor-default' : '']"
          :type="col.type ?? 'text'"
          :placeholder="col.placeholder"
          :readonly="col.readonly"
          :maxlength="col.maxlength"
          :autocomplete="col.autocomplete"
          @input="onChange(col, $event)"
        />
        <!-- number -->
        <input v-else-if="col.type === 'number'" :id="`fo-form-${col.key}`" v-model.number="form[col.key]" class="fo-in" :class="{ 'is-invalid': errors[col.key] }" type="number" :placeholder="col.placeholder" :readonly="col.readonly" :min="col.min" :max="col.max" @input="onChange(col, $event)" />
        <!-- date -->
        <input v-else-if="col.type === 'date'" :id="`fo-form-${col.key}`" v-model="form[col.key]" class="fo-in" :class="{ 'is-invalid': errors[col.key] }" type="date" :readonly="col.readonly" @change="onChange(col, $event)" />
        <!-- textarea -->
        <textarea v-else-if="col.type === 'textarea'" :id="`fo-form-${col.key}`" v-model="form[col.key]" class="fo-in" :class="{ 'is-invalid': errors[col.key] }" :placeholder="col.placeholder" :readonly="col.readonly" :rows="col.rows || 5" :maxlength="col.maxlength" @input="onChange(col, $event)"></textarea>
        <!-- select -->
        <select v-else-if="col.type === 'select'" :id="`fo-form-${col.key}`" v-model="form[col.key]" class="fo-in cursor-pointer" :class="{ 'is-invalid': errors[col.key] }" :disabled="col.readonly" @change="onChange(col, $event)">
          <option v-if="col.nullable !== false" value="">{{ col.nullLabel || "선택해주세요" }}</option>
          <option v-for="o in normOpts(col.options)" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
        </select>
        <!-- 슬롯 탈출구: 커스텀 입력(예: 주소 검색 버튼 + 입력 묶음) -->
        <slot v-else-if="col.type === 'slot'" :name="col.name || col.key" :form="form" :col="col" />

        <!-- 오류 메시지 (slot 은 자체 슬롯 안에서 직접 표시) -->
        <div v-if="col.type !== 'slot' && errors[col.key]" class="text-[0.78rem] text-red-500 mt-1">{{ errors[col.key] }}</div>
      </div>
    </div>

    <!-- 제출 영역: #actions 슬롯을 주면 통째로 교체(폼 안에 있으므로 type="submit" 버튼이 제출한다), 아니면 showActions 일 때 기본 버튼 -->
    <slot name="actions">
      <div v-if="showActions" class="flex gap-2 justify-end mt-2">
        <slot name="actions-before" />
        <button type="submit" class="px-6 py-3 bg-gray-900 text-white border-0 rounded-lg text-[0.88rem] font-bold cursor-pointer">{{ submitLabel }}</button>
        <slot name="actions-after" />
      </div>
    </slot>
  </component>
</template>

<script setup lang="ts">
import type { FoFormColumn, FoOption, FoRow } from "~/types/fo/foCompType";

const props = withDefaults(
  defineProps<{
    columns: FoFormColumn[];
    /** reactive 객체 — 입력값이 여기에 직접 반영된다 (기본값 필수: undefined 가 들어오면 렌더가 깨진다) */
    form?: FoRow;
    errors?: Record<string, string>;
    /** 한 줄에 놓을 필드 수 */
    cols?: number;
    /** 필드 최소 너비 (auto-fit 그리드) */
    minColWidth?: string;
    gap?: number;
    /** true 면 하단에 제출 버튼을 그린다 (FO 화면은 별도 버튼이 많아 기본 off) */
    showActions?: boolean;
    submitLabel?: string;
    /** 다른 <form> 안에 넣을 때(중첩 form 방지)는 "div" */
    as?: "form" | "div";
  }>(),
  { form: () => ({}), errors: () => ({}), cols: 2, minColWidth: "240px", gap: 14, showActions: false, submitLabel: "확인", as: "form" }
);
const emit = defineEmits<{ (e: "submit"): void }>();

/** 줄 배치(렌더 시 호출 — computed 대신 함수): visible 로 숨긴 필드 제외, rowBreak/group 은 강제 줄바꿈, colSpan 만큼 자리를 차지 */
function layoutRows(): FoFormColumn[][] {
  const out: FoFormColumn[][] = [];
  let cur: FoFormColumn[] = [];
  let used = 0;
  for (const col of props.columns) {
    if (col.visible && !col.visible(props.form)) continue;
    if (col.type === "rowBreak") {
      if (cur.length) out.push(cur);
      cur = [];
      used = 0;
      continue;
    }
    if (col.type === "group") {
      if (cur.length) out.push(cur);
      out.push([col]);
      cur = [];
      used = 0;
      continue;
    }
    const span = Math.min(col.colSpan || 1, props.cols);
    if (used + span > props.cols && cur.length) {
      out.push(cur);
      cur = [];
      used = 0;
    }
    cur.push(col);
    used += span;
  }
  if (cur.length) out.push(cur);
  return out;
}

/** 입력 시: validate 가 있으면 실시간 재판정, 없으면 입력이 들어오면 오류를 지운다 + col.onChange 호출 */
function onChange(col: FoFormColumn, e: Event) {
  const v = props.form[col.key];
  if (col.validate) {
    const msg = col.validate(v, props.form);
    if (msg) props.errors[col.key] = msg;
    else delete props.errors[col.key];
  } else if (col.clearErrOnInput !== false) {
    delete props.errors[col.key];
  }
  col.onChange?.(v, props.form, e);
}

function normOpts(opts: FoFormColumn["options"]): { value: string | number | undefined; label: string | undefined }[] {
  const arr: FoOption[] = (typeof opts === "function" ? opts() : opts) ?? [];
  return arr.map((o) => ({ value: o.value ?? o.codeValue, label: o.label ?? o.codeLabel }));
}
const dispVal = (col: FoFormColumn) => {
  const v = props.form[col.key];
  if (col.fmt) return col.fmt(v, props.form);
  return v == null || v === "" ? "-" : String(v);
};
</script>

<style scoped>
.fo-in {
  width: 100%;
  padding: 10px 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.88rem;
  outline: none;
  box-sizing: border-box;
}
.fo-in:focus {
  border-color: #bc8246;
}
.fo-in.is-invalid {
  border-color: #ef4444;
}
</style>
