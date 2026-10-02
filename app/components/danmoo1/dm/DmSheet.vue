<template>
  <!-- 바닥 시트 — 내 동네 선택·필터·가격 제안·알바/부동산 상세 등 공통. body 로 Teleport 되므로 변수(--dm-*)는 :root 에 있다(Layout.vue) -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="dm-sheet-bg" @click.self="emit('close')">
        <div class="dm-sheet" role="dialog" aria-modal="true">
          <div class="dm-sheet__grip"></div>
          <div v-if="title || $slots.head" class="dm-sheet__head">
            <slot name="head"><b class="text-[17px]">{{ title }}</b></slot>
            <button type="button" class="icon-btn" aria-label="닫기" @click="emit('close')"><i class="fas fa-times"></i></button>
          </div>
          <div class="dm-sheet__body"><slot /></div>
          <div v-if="$slots.foot" class="dm-sheet__foot"><slot name="foot" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ (e: "close"): void }>();
</script>

<style>
.dm-sheet-bg { position: fixed; inset: 0; z-index: 900; display: flex; align-items: flex-end; justify-content: center; background: rgba(0, 0, 0, 0.45); }
.dm-sheet { width: 100%; max-width: 640px; max-height: 88vh; display: flex; flex-direction: column; border-radius: 18px 18px 0 0; background: var(--dm-bg); color: var(--dm-text); font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; font-size: 15px; line-height: 1.45; }
.dm-sheet__grip { width: 40px; height: 4px; border-radius: 2px; background: var(--dm-line); margin: 10px auto 0; }
.dm-sheet__head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px 6px 20px; }
.dm-sheet__body { overflow-y: auto; padding: 4px 20px 20px; }
.dm-sheet__foot { padding: 8px 20px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid var(--dm-line); }
.dm-sheet button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
.dm-sheet input, .dm-sheet select, .dm-sheet textarea { font: inherit; color: var(--dm-text); }
.dm-sheet .icon-btn { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 20px; }
.dm-sheet .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 48px; padding: 0 18px; border-radius: 8px; font-weight: 700; font-size: 15px; background: var(--dm-primary); color: #fff; }
.dm-sheet .btn-primary:disabled { opacity: 0.5; cursor: default; }
.dm-sheet .btn-soft { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; padding: 0 14px; border-radius: 8px; font-weight: 600; font-size: 14px; background: var(--dm-chip); color: var(--dm-text); }
.dm-sheet .input { width: 100%; height: 44px; padding: 0 12px; border-radius: 8px; background: var(--dm-chip); border: 1px solid transparent; outline: 0; }
.dm-sheet .input:focus { border-color: var(--dm-primary); background: var(--dm-bg); }
.dm-sheet .muted { color: var(--dm-text-2); }
.dm-sheet .primary { color: var(--dm-primary); }
.dm-sheet h1, .dm-sheet h2, .dm-sheet h3, .dm-sheet p, .dm-sheet ul { margin: 0; }
.dm-sheet ul { padding: 0; list-style: none; }
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.22s ease; }
.sheet-enter-active .dm-sheet, .sheet-leave-active .dm-sheet { transition: transform 0.22s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .dm-sheet, .sheet-leave-to .dm-sheet { transform: translateY(100%); }
</style>
