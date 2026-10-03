<template>
  <!-- homepg1 확인창 — app.vue 의 useConfirm() 이 이 빌드의 모듈 것으로 띄운다. 원본 홈페이지 확인 모달 모양(⚠️ 아이콘, 취소/확인) -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-show="open" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="hp-confirm-title" @click.self="cancel" @keydown.esc="cancel">
        <div class="modal-box">
          <div class="modal-icon" :class="variant === 'danger' ? 'icon-error' : 'icon-warning'">{{ variant === "danger" ? "⛔" : "⚠️" }}</div>
          <div id="hp-confirm-title" class="modal-title">{{ title ?? "확인" }}</div>
          <div class="modal-msg">{{ message }}</div>
          <div class="modal-actions">
            <button type="button" class="btn-outline" style="padding: 10px 20px" @click="cancel">{{ cancelText ?? "취소" }}</button>
            <button ref="okBtn" type="button" class="btn-blue" style="padding: 10px 20px" @click="confirm">{{ confirmText ?? "확인" }}</button>
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
