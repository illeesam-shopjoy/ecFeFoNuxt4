<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-show="open"
        class="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-[#1a1410]/55 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-msg"
        @click.self="cancel"
        @keydown.esc="cancel"
      >
        <div class="confirm-dialog relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
          <div class="h-1.5" :style="{ background: tone.color }"></div>
          <div class="px-7 pt-7 pb-6 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-[1.7rem]" :style="{ background: tone.bg, color: tone.color }">
              <i :class="tone.icon" aria-hidden="true"></i>
            </div>
            <h3 id="confirm-dialog-title" class="m-0 mb-2 text-[1.15rem] font-bold text-gray-900">{{ title ?? "확인" }}</h3>
            <p id="confirm-dialog-msg" class="m-0 whitespace-pre-line break-keep text-[0.92rem] leading-relaxed text-gray-600">{{ message }}</p>
            <div class="mt-6 flex gap-3">
              <button
                type="button"
                class="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white py-3 text-[0.92rem] font-semibold text-gray-700 transition hover:bg-gray-50"
                @click="cancel"
              >
                {{ cancelText ?? "취소" }}
              </button>
              <button
                ref="okBtn"
                type="button"
                class="flex-1 cursor-pointer rounded-xl border-0 py-3 text-[0.92rem] font-bold text-white transition hover:brightness-95 active:scale-[0.99]"
                :style="{ background: tone.color }"
                @click="confirm"
              >
                {{ confirmText ?? "확인" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

// 종류별 아이콘/색상 — 일반 확인은 물음표(테마색), 위험(삭제 등)은 경고 삼각형(빨강)
const tone = computed(() => (props.variant === "danger" ? { icon: "fas fa-exclamation-triangle", color: "#dc2626", bg: "#fef2f2" } : { icon: "fas fa-question", color: "#bc8246", bg: "#faf3ea" }));

const okBtn = ref<HTMLButtonElement | null>(null);
watch(() => props.open, (v) => { if (v) nextTick(() => okBtn.value?.focus()); });

function confirm() {
  emit("confirm");
}
function cancel() {
  emit("cancel");
}
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
.confirm-fade-enter-active .confirm-dialog,
.confirm-fade-leave-active .confirm-dialog {
  transition: transform 0.2s ease;
}
.confirm-fade-enter-from .confirm-dialog,
.confirm-fade-leave-to .confirm-dialog {
  transform: scale(0.94) translateY(8px);
}
</style>
