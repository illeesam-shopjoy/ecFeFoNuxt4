<template>
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — select-multi-check__* 커스텀
       클래스를 전부 Tailwind 유틸리티로 대체. Transition enter/leave 클래스만 Tailwind로 표현이
       안 돼(트랜지션 컴포넌트 name과 묶여 있음) 아래 <style>에 남겨둠. -->
  <div ref="rootRef" class="relative min-w-[100px] text-[0.8rem]">
    <div
      class="flex items-center flex-wrap gap-y-1 gap-x-1.5 min-h-[28px] pl-2 pr-6 py-1 border rounded-md bg-white cursor-pointer leading-[1.4] hover:border-gray-400"
      :class="isOpen ? 'border-indigo-500 outline outline-1 outline-indigo-500' : 'border-gray-300'"
      @click.stop="isOpen = !isOpen"
    >
      <span v-if="summaryMode" class="whitespace-nowrap text-gray-700 text-xs">{{ modelValue.length }}/{{ options.length }} 선택</span>
      <template v-else>
        <span v-if="allSelected" class="text-gray-600 font-medium">All</span>
        <template v-else-if="selectedValues.length > 0">
          <span
            v-for="val in selectedValues"
            :key="val"
            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-500 text-white rounded-full text-[0.72rem] leading-[1.3]"
            @click.stop="remove(val)"
          >
            {{ getLabel(val) }}
            <span class="ml-0.5 cursor-pointer opacity-90 hover:opacity-100">×</span>
          </span>
        </template>
        <span v-else class="text-gray-400 text-xs">선택...</span>
      </template>
      <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[0.65rem] pointer-events-none">{{ isOpen ? "▲" : "▼" }}</span>
    </div>

    <Transition name="select-multi-check-drop">
      <div
        v-show="isOpen"
        class="absolute top-full left-0 right-0 mt-0.5 py-1.5 bg-white border border-gray-300 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-50 max-h-[220px] overflow-hidden flex flex-col"
        @click.stop
      >
        <label class="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-[0.8rem] text-gray-700 border-b border-gray-200 font-semibold">
          <input type="checkbox" class="cursor-pointer accent-indigo-500" :checked="allSelected" :indeterminate="someSelected && !allSelected" @change="toggleSelectAll" />
          <span>전체</span>
        </label>
        <div v-if="searchable" class="px-2 py-1 border-b border-gray-200">
          <input v-model="searchQuery" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded text-[0.8rem] outline-none focus:border-indigo-500" placeholder="Search" @click.stop />
        </div>
        <div class="overflow-y-auto max-h-[160px]">
          <label
            v-for="opt in filteredOptions"
            :key="opt.value"
            class="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-[0.8rem] text-gray-700 hover:bg-gray-100"
            :class="{ 'opacity-50 cursor-not-allowed': opt.disabled }"
          >
            <input type="checkbox" class="cursor-pointer accent-indigo-500" :checked="modelValue.includes(opt.value)" :disabled="opt.disabled" @change="toggle(opt.value)" @click.stop />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
export interface SelectMultiCheckOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    options: SelectMultiCheckOption[];
    searchable?: boolean;
    /** 한 줄 요약 표시 (예: 3/6 선택) */
    summaryMode?: boolean;
  }>(),
  { searchable: false, summaryMode: false },
);

const emit = defineEmits<{ (e: "update:modelValue", value: string[]): void }>();

const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const searchQuery = ref("");

const selectedValues = computed(() => props.modelValue);

const allSelected = computed(() => props.options.length > 0 && props.modelValue.length >= props.options.filter((o) => !o.disabled).length);

const someSelected = computed(() => props.modelValue.length > 0);

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

function getLabel(value: string) {
  return props.options.find((o) => o.value === value)?.label ?? value;
}

function toggle(value: string) {
  const next = props.modelValue.includes(value) ? props.modelValue.filter((v) => v !== value) : [...props.modelValue, value];
  emit("update:modelValue", next);
}

function remove(value: string) {
  emit(
    "update:modelValue",
    props.modelValue.filter((v) => v !== value),
  );
}

function toggleSelectAll() {
  const enabled = props.options.filter((o) => !o.disabled);
  if (allSelected.value) {
    emit("update:modelValue", []);
  } else {
    emit(
      "update:modelValue",
      enabled.map((o) => o.value),
    );
  }
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) isOpen.value = false;
}

onMounted(() => {
  if (typeof document !== "undefined") document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  if (typeof document !== "undefined") document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Transition enter/leave 클래스는 <Transition name="select-multi-check-drop">과 이름이 묶여
   있어 Tailwind 유틸리티로 표현 불가 — 여기만 남겨둠. */
.select-multi-check-drop-enter-active,
.select-multi-check-drop-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.select-multi-check-drop-enter-from,
.select-multi-check-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
