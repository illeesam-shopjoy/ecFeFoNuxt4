<template>
  <!-- 가로 스크롤 칩 — 홈 카테고리/커뮤니티 주제/부동산 매물종류. value 가 modelValue 와 같으면 선택 표시. to 가 있는 항목은 필터가 아니라 바로가기(링크) -->
  <div class="dm-chips no-scrollbar" role="tablist">
    <template v-for="c in items" :key="c.value">
      <nuxt-link v-if="c.to" :to="c.to" class="dm-chip dm-chip--link">
        <i v-if="c.icon" :class="c.icon" aria-hidden="true"></i>
        <span>{{ c.label }}</span>
      </nuxt-link>
      <button
        v-else
        type="button"
        class="dm-chip"
        :class="{ on: c.value === modelValue }"
        role="tab"
        :aria-selected="c.value === modelValue"
        @click="emit('update:modelValue', c.value === modelValue && clearable ? '' : c.value)"
      >
        <i v-if="c.icon" :class="c.icon" aria-hidden="true"></i>
        <span>{{ c.label }}</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
export interface DmChipItem { value: string; label: string; icon?: string; to?: string }
defineProps<{ items: DmChipItem[]; modelValue: string; clearable?: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();
</script>

<style scoped>
.dm-chips { display: flex; gap: 8px; padding: 10px 16px; overflow-x: auto; white-space: nowrap; }
.dm-chip { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 18px; background: var(--dm-chip); font-size: 14px; font-weight: 600; flex: none; }
.dm-chip.on { background: var(--dm-text); color: var(--dm-bg); }
.dm-chip--link { background: var(--dm-primary-soft); color: var(--dm-primary); }
</style>
