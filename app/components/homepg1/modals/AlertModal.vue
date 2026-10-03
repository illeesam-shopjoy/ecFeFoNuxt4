<template>
  <!-- homepg1 알림창 — app.vue 의 useAlert() 가 이 빌드의 모듈 것으로 띄운다. 원본 홈페이지 알림 모달 모양(✅/❌/ℹ️ 아이콘, 확인) -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-show="open" class="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="hp-alert-title" @click.self="close" @keydown.esc="close">
        <div class="modal-box">
          <div class="modal-icon" :class="'icon-' + tone">{{ ICONS[tone] }}</div>
          <div id="hp-alert-title" class="modal-title">{{ title ?? "알림" }}</div>
          <div class="modal-msg">{{ message }}</div>
          <!-- 상세 정보(라벨: 값) — 접수번호 등 -->
          <dl v-if="details?.length" class="modal-details">
            <div v-for="d in details" :key="d.label">
              <dt>{{ d.label }}</dt>
              <dd>{{ d.value }}</dd>
            </div>
          </dl>
          <div class="modal-actions">
            <button ref="okBtn" type="button" class="btn-blue" style="padding: 10px 28px" @click="close">{{ confirmText ?? "확인" }}</button>
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
