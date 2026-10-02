<template>
  <!-- 제목형 상단바 — 뒤로가기 + 제목(+ 오른쪽 아이콘 슬롯). 하위 화면(검색·알림·설정·상세 등) 공통 -->
  <div class="dm-titlebar">
    <button v-if="back" type="button" class="icon-btn" aria-label="뒤로" @click="goBack"><i class="fas fa-chevron-left"></i></button>
    <button v-else-if="close" type="button" class="icon-btn" aria-label="닫기" @click="goBack"><i class="fas fa-times"></i></button>
    <div class="dm-titlebar__title" :class="{ center }">
      <slot name="title"><span class="truncate">{{ title }}</span></slot>
    </div>
    <div class="dm-titlebar__right"><slot name="right" /></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: { type: String, default: "" },
  back: { type: Boolean, default: true },
  close: { type: Boolean, default: false },
  center: { type: Boolean, default: false },
  /** 뒤로갈 곳이 없을 때(새 탭 진입 등) 대신 갈 주소 */
  fallback: { type: String, default: "/" },
});
const router = useRouter();
function goBack() {
  if (import.meta.client && window.history.length > 1) router.back();
  else router.push(props.fallback);
}
</script>

<style scoped>
.dm-titlebar { display: flex; align-items: center; gap: 4px; height: 56px; padding: 0 8px; border-bottom: 1px solid var(--dm-line); }
.dm-titlebar__title { flex: 1; min-width: 0; display: flex; align-items: center; font-size: 18px; font-weight: 700; }
.dm-titlebar__title.center { justify-content: center; }
.dm-titlebar__right { display: flex; align-items: center; gap: 2px; min-width: 40px; justify-content: flex-end; }
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
</style>
