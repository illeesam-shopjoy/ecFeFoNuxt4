<template>
  <Teleport to="body">
    <Transition name="terms-agree-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="terms-agree-title" @click.self="close">
        <div class="terms-agree-dialog relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-xl p-6">
          <button type="button" class="absolute top-4 right-4 p-2 rounded hover:bg-gray-100" @click="close" aria-label="닫기">
            <i class="fal fa-times"></i>
          </button>
          <div class="-mx-6 -mt-6 mb-5 rounded-t-xl border-b border-[#f0e2cf] bg-[#faf3ea] px-6 pb-4 pt-5">
            <h3 id="terms-agree-title" class="text-lg font-semibold text-gray-900 mb-1 text-center">이용약관 동의</h3>
            <p class="text-sm text-gray-500 mb-0 text-center">서비스 이용을 위해 약관에 동의해 주세요</p>
          </div>

          <label class="flex items-center gap-2 p-3 mb-3 rounded-lg bg-gray-100 cursor-pointer">
            <input type="checkbox" :checked="allChecked" @change="toggleAll(($event.target as HTMLInputElement).checked)" />
            <span class="font-medium text-gray-900">전체 동의</span>
          </label>

          <ul class="flex flex-col gap-1 mb-5">
            <li v-for="item in items" :key="item.key">
              <label class="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" v-model="item.checked" />
                <span class="text-sm text-gray-800">
                  <span :class="item.required ? 'text-danger' : 'text-gray-400'">[{{ item.required ? "필수" : "선택" }}]</span>
                  {{ item.label }}
                </span>
              </label>
            </li>
          </ul>

          <div class="flex gap-2">
            <button type="button" class="os-btn flex-1 !border !border-[#c9ced6] !bg-[#f3f4f6] !text-gray-700 hover:!bg-[#e5e7eb]" @click="close">이전</button>
            <button type="button" class="os-btn os-btn-green flex-1" :disabled="!requiredAgreed" @click="confirm">다음</button>
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
