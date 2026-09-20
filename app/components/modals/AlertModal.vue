<template>
  <Teleport to="body">
    <Transition name="alert-fade">
      <div
        v-show="open"
        class="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-[#1a1410]/55 backdrop-blur-[2px]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-msg"
        @click.self="close"
        @keydown.esc="close"
      >
        <div class="alert-dialog relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
          <!-- 상단 강조선 -->
          <div class="h-1.5" :style="{ background: tone.color }"></div>
          <div class="px-7 pt-7 pb-6 text-center">
            <!-- 아이콘 -->
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-[1.7rem]" :style="{ background: tone.bg, color: tone.color }">
              <i :class="tone.icon" aria-hidden="true"></i>
            </div>
            <h3 id="alert-dialog-title" class="m-0 mb-2 text-[1.15rem] font-bold text-gray-900">{{ title ?? "알림" }}</h3>
            <p id="alert-dialog-msg" class="m-0 whitespace-pre-line break-keep text-[0.92rem] leading-relaxed text-gray-600">{{ message }}</p>

            <!-- 상세 정보(라벨: 값) — 연동 키 정보 등 -->
            <dl v-if="details?.length" class="mt-4 mb-0 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-left">
              <div v-for="d in details" :key="d.label" class="flex items-baseline justify-between gap-3 py-1 text-[0.8rem]">
                <dt class="shrink-0 text-gray-500">{{ d.label }}</dt>
                <dd class="m-0 min-w-0 break-all text-right font-mono font-semibold text-gray-800">{{ d.value }}</dd>
              </div>
            </dl>

            <button
              ref="okBtn"
              type="button"
              class="mt-6 w-full cursor-pointer rounded-xl border-0 py-3 text-[0.95rem] font-bold text-white transition hover:brightness-95 active:scale-[0.99]"
              :style="{ background: tone.color }"
              @click="close"
            >
              {{ confirmText ?? "확인" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { AlertVariant } from "~/composables/useAlert";

const props = defineProps<{
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  variant?: AlertVariant;
  details?: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// 종류별 아이콘/색상
const TONES: Record<AlertVariant, { icon: string; color: string; bg: string }> = {
  info: { icon: "fas fa-info", color: "#3b82f6", bg: "#eff6ff" },
  success: { icon: "fas fa-check", color: "#16a34a", bg: "#f0fdf4" },
  warning: { icon: "fas fa-exclamation", color: "#d97706", bg: "#fffbeb" },
  error: { icon: "fas fa-times", color: "#dc2626", bg: "#fef2f2" },
};
const tone = computed(() => TONES[props.variant ?? "info"]);

const okBtn = ref<HTMLButtonElement | null>(null);
watch(() => props.open, (v) => { if (v) nextTick(() => okBtn.value?.focus()); });

function close() {
  emit("close");
}
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.2s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}
.alert-fade-enter-active .alert-dialog,
.alert-fade-leave-active .alert-dialog {
  transition: transform 0.2s ease;
}
.alert-fade-enter-from .alert-dialog,
.alert-fade-leave-to .alert-dialog {
  transform: scale(0.94) translateY(8px);
}
</style>
