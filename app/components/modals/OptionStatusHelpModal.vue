<template>
  <!-- 2026-09-22(요청사항: "색상/사이즈 우측에 상태 도움말 아이콘, 판매중지·재고없음 표식을 색상·사이즈에 통일") —
       옵션(색상/사이즈) 위에 표시하는 표식(대각선 줄) 의미를 설명하는 공용 도움말. ProductDetailsContent.vue 의 색상·사이즈 라벨 옆
       ⓘ 아이콘에서 연다. -->
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9600] flex items-center justify-center bg-[#1a1410]/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="옵션 표시 도움말" @click.self="hide">
      <div class="flex max-h-[85vh] w-full max-w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
        <div class="flex items-center justify-between border-b border-[#eceef1] px-5 py-3.5">
          <h3 class="m-0 flex items-center gap-2 text-[1.02rem] font-bold text-gray-900"><span aria-hidden="true">🏷️</span> {{ title }} 표시 안내</h3>
          <button type="button" class="modal-x" aria-label="닫기" @click="hide">×</button>
        </div>
        <div class="overflow-y-auto px-5 py-4">
          <ul class="m-0 flex list-none flex-col gap-3 p-0">
            <li class="flex items-start gap-3">
              <span class="relative mt-0.5 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#e5e7eb]">
                <span class="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded bg-[#c0392b]"></span>
              </span>
              <span class="text-[0.86rem] leading-relaxed text-gray-700"><b class="font-bold text-gray-900">재고없음(품절)</b> — 지금 재고가 없어 담을 수 없어요. 입고되면 다시 표시됩니다.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="relative mt-0.5 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#e5e7eb] opacity-50">
                <span class="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded bg-[#8a8a8a]"></span>
              </span>
              <span class="text-[0.86rem] leading-relaxed text-gray-700"><b class="font-bold text-gray-900">판매중지</b> — 더 이상 판매하지 않는 {{ title }}이에요. 다시 판매될 예정이 없습니다.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-0.5 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[11px] font-bold text-[#c0392b]">+금액</span>
              <span class="text-[0.86rem] leading-relaxed text-gray-700">숫자가 붙어 있으면 그 {{ title }}을 고를 때 <b class="font-bold text-gray-900">추가 비용</b>이 더해져요.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

/** title: "색상" | "사이즈" — 문구에 그대로 들어간다 */
defineProps<{ title: string }>();

const open = ref(false);
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") hide();
}
function show() {
  open.value = true;
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", onKey);
}
function hide() {
  open.value = false;
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKey);
}
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKey);
  }
});
defineExpose({ show, hide });
</script>
