<template>
  <!-- 로그인한 소셜(카카오/네이버/구글)을 나타내는 작은 원형 아이콘 — 이름 옆에 붙여 쓴다. provider 가 없거나 모르는 값이면 아무것도 그리지 않는다. -->
  <span v-if="meta" class="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold leading-none" :class="meta.cls" :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.58)}px` }" :title="`${meta.nm} 로그인`" :aria-label="`${meta.nm} 로그인`">{{ meta.ch }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ provider?: string; size?: number }>(), { provider: "", size: 16 });
const META: Record<string, { nm: string; ch: string; cls: string }> = {
  KAKAO: { nm: "카카오", ch: "K", cls: "bg-[#FEE500] text-[#3c1e1e]" },
  NAVER: { nm: "네이버", ch: "N", cls: "bg-[#03C75A] text-white" },
  GOOGLE: { nm: "구글", ch: "G", cls: "bg-[#EA4335] text-white" },
};
const meta = computed(() => META[props.provider.toUpperCase()]);
</script>
