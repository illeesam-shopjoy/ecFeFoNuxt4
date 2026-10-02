<template>
  <Teleport to="body">
    <Transition name="terms-agree-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1a1410]/55 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="terms-agree-title" @click.self="close">
        <div class="terms-agree-dialog relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.28)] p-6">
          <button type="button" class="modal-x" @click="close" aria-label="닫기">
            <i class="fal fa-times text-[0.95rem]"></i>
          </button>
          <div class="-mx-6 -mt-6 mb-5 rounded-t-2xl border-b border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] px-6 pb-4 pt-5">
            <h3 id="terms-agree-title" class="text-lg font-semibold text-gray-900 mb-1 text-center">이용약관 동의</h3>
            <p class="text-sm text-gray-500 mb-0 text-center">서비스 이용을 위해 약관에 동의해 주세요</p>
          </div>

          <label class="mb-3 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition" :class="allChecked ? 'border-[#bc8246] bg-[#fdf6ee]' : 'border-[#e5e7eb] bg-[#f8f9fb] hover:border-[#cfd4db]'">
            <input type="checkbox" class="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#bc8246]" :checked="allChecked" @change="toggleAll(($event.target as HTMLInputElement).checked)" />
            <span class="text-[0.98rem] font-bold text-gray-900">전체 동의</span>
          </label>

          <ul class="m-0 mb-6 flex list-none flex-col gap-0.5 p-0">
            <li v-for="item in items" :key="item.key">
              <label class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 hover:bg-[#f8f9fb]">
                <input type="checkbox" class="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#bc8246]" v-model="item.checked" />
                <span class="text-[0.9rem] leading-snug text-gray-800">
                  <span class="mr-1 font-semibold" :class="item.required ? 'text-[#d9534f]' : 'text-gray-400'">[{{ item.required ? "필수" : "선택" }}]</span>{{ item.label }}
                </span>
              </label>
            </li>
          </ul>

          <div class="flex gap-2.5">
            <button type="button" class="mbtn mbtn-ghost flex-1" @click="close">이전</button>
            <button type="button" class="mbtn mbtn-primary flex-[1.4]" :disabled="!requiredAgreed" @click="confirm">다음</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 2026-09-15(요청사항: "회원가입 버튼 클릭하면 약관동의 페이지 중간에 넣어줘") — 로그인 화면의
 * 회원가입 버튼 클릭 시 회원가입 폼으로 바로 이동하지 않고, 이 이용약관 동의 모달을 먼저 띄운 뒤
 * 필수 항목에 모두 동의해야 "다음"을 눌러 회원가입 폼(/register)으로 진행할 수 있게 한다.
 */
import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const visible = ref(false);

const items = reactive([
  { key: "service", label: "서비스 이용약관", required: true, checked: false },
  { key: "privacy", label: "개인정보 수집·이용 동의", required: true, checked: false },
  { key: "age14", label: "만 14세 이상 확인", required: true, checked: false },
  { key: "marketing", label: "마케팅 정보 수신 동의 (선택)", required: false, checked: false },
]);

const allChecked = computed(() => items.every((i) => i.checked));
const requiredAgreed = computed(() => items.filter((i) => i.required).every((i) => i.checked));

function toggleAll(checked: boolean) {
  items.forEach((i) => (i.checked = checked));
}

function show() {
  items.forEach((i) => (i.checked = false));
  visible.value = true;
}
function close() {
  visible.value = false;
}
function confirm() {
  if (!requiredAgreed.value) return;
  visible.value = false;
  router.push("/register");
}

defineExpose({ show });
</script>

<style scoped>
.terms-agree-fade-enter-active,
.terms-agree-fade-leave-active {
  transition: opacity 0.2s ease;
}
.terms-agree-fade-enter-from,
.terms-agree-fade-leave-to {
  opacity: 0;
}
.terms-agree-fade-enter-active .terms-agree-dialog,
.terms-agree-fade-leave-active .terms-agree-dialog {
  transition: transform 0.2s ease;
}
.terms-agree-fade-enter-from .terms-agree-dialog,
.terms-agree-fade-leave-to .terms-agree-dialog {
  transform: scale(0.95);
}
</style>
