<template>
  <Teleport to="body">
    <Transition name="wpm-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1a1410]/60 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="wpm-title" @click.self="finish(null)" @keydown.esc="finish(null)">
        <div class="w-full max-w-[380px] rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.28)] p-6">
          <div class="-mx-6 -mt-6 mb-4 rounded-t-2xl border-b border-[#f0e2cf] bg-[#faf3ea] px-6 pb-3 pt-5">
            <h3 id="wpm-title" class="text-[1.05rem] font-bold text-gray-900 m-0 mb-1">🔒 글 비밀번호 확인</h3>
            <p class="text-[0.84rem] text-gray-500 m-0">{{ message }}</p>
          </div>
          <input ref="inputRef" v-model="pwd" type="password" maxlength="20" autocomplete="off" placeholder="글 비밀번호" class="w-full px-[13px] py-[10px] border-[1.5px] border-[#e5e7eb] rounded-lg text-[0.9rem] outline-none focus:border-[#bc8246]" @keydown.enter.prevent="submit" />
          <p v-if="error" class="text-[0.78rem] text-red-500 mt-2 mb-0">{{ error }}</p>
          <div class="flex justify-end gap-2 mt-5">
            <button type="button" class="px-4 py-2 rounded-lg border border-[#c9ced6] bg-[#f3f4f6] text-[0.85rem] font-semibold text-gray-700 cursor-pointer shadow-sm hover:bg-[#e5e7eb] transition" @click="finish(null)">취소</button>
            <button type="button" class="px-4 py-2 rounded-lg border-0 bg-gray-900 text-white text-[0.85rem] font-bold cursor-pointer" @click="submit">확인</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 2026-09-20(요청사항: "비로그인 사용자는 글비밀번호가 맞아야 수정 및 삭제 가능") — 비회원이 쓴 상품평/Q&A 를 수정·삭제할 때 글 비밀번호를 묻는 모달.
 * 사용: `const pwd = await pwdModalRef.value?.ask("삭제하려면 …"); if (pwd === null) return;` (취소하면 null)
 * 비밀번호가 맞는지는 서버가 판정한다(틀리면 서버 오류 메시지를 화면 토스트로 보여준다).
 */
import { nextTick, ref } from "vue";

const visible = ref(false);
const message = ref("");
const pwd = ref("");
const error = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
let resolver: ((v: string | null) => void) | null = null;

function ask(msg = "작성할 때 정한 글 비밀번호를 입력해 주세요."): Promise<string | null> {
  message.value = msg;
  pwd.value = "";
  error.value = "";
  visible.value = true;
  nextTick(() => inputRef.value?.focus());
  return new Promise((resolve) => { resolver = resolve; });
}
function finish(v: string | null) {
  visible.value = false;
  resolver?.(v);
  resolver = null;
}
function submit() {
  if (!pwd.value) { error.value = "글 비밀번호를 입력해 주세요."; return; }
  finish(pwd.value);
}

defineExpose({ ask });
</script>

<style scoped>
.wpm-fade-enter-active, .wpm-fade-leave-active { transition: opacity 0.2s ease; }
.wpm-fade-enter-from, .wpm-fade-leave-to { opacity: 0; }
</style>
