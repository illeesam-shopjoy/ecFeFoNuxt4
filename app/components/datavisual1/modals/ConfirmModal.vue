<template>
  <!-- datavisual1 확인창 — app.vue 의 useConfirm() 이 이 빌드의 모듈 것으로 띄운다. 원본 대시보드 모달 모양(제목·문구·오른쪽 버튼) -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-show="open" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="dv-confirm-title" @click.self="cancel" @keydown.esc="cancel">
        <div class="modal-box">
          <div id="dv-confirm-title" class="modal-title">{{ variant === "danger" ? "⚠️ " : "" }}{{ title ?? "확인" }}</div>
          <div class="modal-msg">{{ message }}</div>
          <div class="modal-actions">
            <button type="button" class="btn-outline" @click="cancel">{{ cancelText ?? "취소" }}</button>
            <button ref="okBtn" type="button" :class="variant === 'danger' ? 'btn-danger' : 'btn-primary'" style="padding: 8px 18px; font-size: 0.82rem" @click="confirm">{{ confirmText ?? "확인" }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

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

const okBtn = ref<HTMLButtonElement | null>(null);
watch(() => props.open, (v) => { if (v) nextTick(() => okBtn.value?.focus()); });

function confirm() {
  emit("confirm");
}
function cancel() {
  emit("cancel");
}
</script>
