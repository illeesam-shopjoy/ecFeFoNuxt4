<template>
  <!-- datavisual1 알림창 — app.vue 의 useAlert() 가 이 빌드의 모듈 것으로 띄운다. 원본 대시보드 모달 모양 -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-show="open" class="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="dv-alert-title" @click.self="close" @keydown.esc="close">
        <div class="modal-box">
          <div id="dv-alert-title" class="modal-title">{{ ICONS[tone] }} {{ title ?? "알림" }}</div>
          <div class="modal-msg">{{ message }}</div>
          <dl v-if="details?.length" class="modal-details">
            <div v-for="d in details" :key="d.label">
              <dt>{{ d.label }}</dt>
              <dd>{{ d.value }}</dd>
            </div>
          </dl>
          <div class="modal-actions">
            <button ref="okBtn" type="button" class="btn-primary" @click="close">{{ confirmText ?? "확인" }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { CoAlertDetailType, CoAlertVariantType } from "~/types/co/coAlertType";

const props = defineProps<{
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  variant?: CoAlertVariantType;
  details?: CoAlertDetailType[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const ICONS: Record<CoAlertVariantType, string> = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };
const tone = computed<CoAlertVariantType>(() => props.variant ?? "info");

const okBtn = ref<HTMLButtonElement | null>(null);
watch(() => props.open, (v) => { if (v) nextTick(() => okBtn.value?.focus()); });

function close() {
  emit("close");
}
</script>
