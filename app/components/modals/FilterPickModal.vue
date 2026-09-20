<template>
  <Teleport to="body">
    <Transition name="fpm-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" :aria-label="title" @click.self="cancel" @keydown.esc="cancel">
        <div class="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-[#f0e2cf] bg-[#faf3ea] px-5 py-4">
            <h3 class="m-0 text-[1.05rem] font-bold text-gray-900">{{ title }} 선택 <span class="text-[0.8rem] font-normal text-gray-500">(여러 개 선택 가능)</span></h3>
            <button type="button" class="h-8 w-8 cursor-pointer rounded-full border-0 bg-white/70 hover:bg-white" aria-label="닫기" @click="cancel"><i class="fal fa-times"></i></button>
          </div>
          <div class="border-b border-[#eee] px-5 py-3">
            <input v-model="keyword" type="text" :placeholder="`${title} 검색`" class="w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-[0.85rem] outline-none focus:border-[#bc8246]" />
          </div>
          <ul class="m-0 flex-1 list-none overflow-y-auto p-2">
            <li v-for="o in shown" :key="o.id">
              <label class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-[0.9rem] hover:bg-[#faf7f2]" :class="picked.includes(o.id) ? 'bg-[#faf3ea] font-semibold text-[#8a5a25]' : 'text-gray-800'">
                <input type="checkbox" :checked="picked.includes(o.id)" @change="toggle(o.id)" />
                <span class="flex-1 truncate">{{ o.name }}</span>
                <span v-if="o.prodCount != null" class="text-[0.75rem] text-gray-400">{{ o.prodCount }}</span>
              </label>
            </li>
            <li v-if="!shown.length" class="px-3 py-8 text-center text-[0.85rem] text-gray-400">{{ options.length ? "검색 결과가 없습니다." : "선택할 항목이 없습니다." }}</li>
          </ul>
          <div class="flex items-center gap-2 border-t border-[#eee] px-5 py-3">
            <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] text-gray-500 underline" @click="picked = []">선택 해제</button>
            <span class="ml-1 text-[0.8rem] text-gray-500">{{ picked.length }}개 선택</span>
            <button type="button" class="ml-auto cursor-pointer rounded-lg border border-[#c9ced6] bg-[#f3f4f6] px-4 py-2 text-[0.85rem] font-semibold text-gray-700 shadow-sm hover:bg-[#e5e7eb]" @click="cancel">취소</button>
            <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-5 py-2 text-[0.85rem] font-bold text-white" @click="apply">적용</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/** 판매업체/담당MD 처럼 목록이 길어 좌측에 다 못 펼치는 필터 — 검색 + 여러 개 체크해서 적용하는 모달 */
import { computed, ref, watch } from "vue";
import type { SyFilterOptType } from "~/types/sy/syFilterOptType";

const props = defineProps<{ title: string; options: SyFilterOptType[]; modelValue: string[] }>();
const emit = defineEmits<{ (e: "update:modelValue", v: string[]): void }>();

const visible = ref(false);
const keyword = ref("");
const picked = ref<string[]>([]);
const shown = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  return k ? props.options.filter((o) => o.name.toLowerCase().includes(k)) : props.options;
});
watch(visible, (v) => {
  if (v) {
    picked.value = [...props.modelValue];
    keyword.value = "";
  }
});
const toggle = (id: string) => (picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id]);
function show() {
  visible.value = true;
}
function cancel() {
  visible.value = false;
}
function apply() {
  emit("update:modelValue", [...picked.value]);
  visible.value = false;
}
defineExpose({ show });
</script>

<style scoped>
.fpm-fade-enter-active,
.fpm-fade-leave-active {
  transition: opacity 0.2s ease;
}
.fpm-fade-enter-from,
.fpm-fade-leave-to {
  opacity: 0;
}
</style>
