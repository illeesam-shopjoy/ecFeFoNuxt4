<template>
  <!-- 위젯 카드 틀 — 머리(아이콘·제목·버튼) + 본문. 모든 차트 위젯이 같이 쓴다(원본은 위젯마다 같은 마크업을 반복했다) -->
  <div class="widget-card" style="height: 100%">
    <div class="widget-header">
      <span class="widget-title"><span>{{ icon }}</span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ title }}</span></span>
      <div class="widget-actions">
        <slot name="actions" />
        <button v-if="refreshable" type="button" class="widget-btn" title="새로고침" aria-label="새로고침" @click="emit('refresh')">↻</button>
      </div>
    </div>
    <div class="widget-body" :style="bodyStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string; icon?: string; refreshable?: boolean; bodyStyle?: string }>(), { icon: "📊", refreshable: true, bodyStyle: "" });
const emit = defineEmits<{ (e: "refresh"): void }>();
</script>
