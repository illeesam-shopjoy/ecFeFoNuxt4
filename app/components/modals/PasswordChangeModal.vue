<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/45" role="dialog" aria-modal="true" aria-labelledby="pw-change-title" @click.self="close">
      <div class="relative w-full max-w-[400px] rounded-xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <button type="button" class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer" aria-label="닫기" @click="close">
          <i class="fal fa-times"></i>
        </button>

        <div class="mb-5">
          <h3 id="pw-change-title" class="text-[1.2rem] font-extrabold text-gray-900 m-0"><i class="fas fa-key text-theme mr-2 text-base"></i>비밀번호 변경</h3>
          <div class="text-[0.8rem] text-gray-400 mt-1">현재 비밀번호 확인 후 변경할 수 있습니다</div>
        </div>

        <div v-if="done" class="text-center py-5">
          <div class="text-[2.5rem] mb-3 text-green-500"><i class="fas fa-check-circle"></i></div>
          <div class="text-base font-bold text-green-600">비밀번호가 변경되었습니다!</div>
        </div>

        <form v-else class="flex flex-col gap-3" @submit.prevent="save">
          <label class="block">
            <span class="block text-[0.78rem] text-gray-400 mb-1">현재 비밀번호</span>
            <input v-model="current" type="password" class="pw-input" placeholder="현재 비밀번호 입력" autocomplete="current-password" />
          </label>
          <label class="block">
            <span class="block text-[0.78rem] text-gray-400 mb-1">새 비밀번호 <span class="text-[0.72rem]">(6자 이상)</span></span>
            <input v-model="next" type="password" class="pw-input" placeholder="새 비밀번호 입력" autocomplete="new-password" />
          </label>
          <label class="block">
            <span class="block text-[0.78rem] text-gray-400 mb-1">새 비밀번호 확인</span>
            <input v-model="next2" type="password" class="pw-input" placeholder="새 비밀번호 재입력" autocomplete="new-password" />
          </label>

          <!-- 강도 표시 -->
          <div v-if="next" class="flex gap-1 items-center">
            <div v-for="i in 4" :key="i" class="flex-1 h-[3px] rounded-sm transition-colors" :class="i <= strength.level ? 'bg-theme' : 'bg-[#e5e7eb]'"></div>
            <span class="text-[0.72rem] text-gray-400 ml-1.5 whitespace-nowrap">{{ strength.label }}</span>
          </div>

          <div v-if="errorMsg" class="text-[0.82rem] text-red-500 px-3 py-2 bg-red-50 rounded-md">{{ errorMsg }}</div>

          <div class="flex gap-2.5 mt-2">
            <button type="button" class="flex-1 py-3 border-[1.5px] border-[#e5e7eb] rounded-lg bg-transparent text-gray-500 text-[0.88rem] font-semibold cursor-pointer" @click="close">취소</button>
            <button type="submit" class="flex-[2] py-3 border-0 rounded-lg bg-gray-900 text-white text-[0.88rem] font-bold cursor-pointer disabled:opacity-50" :disabled="saving">
              {{ saving ? "변경 중..." : "변경하기" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 비밀번호 변경 모달 (2026-09-19, ecFeBo foAppHeader 의 비밀번호 변경 모달 이식).
 * POST /api/fo/ec/my/password(ecBeBo FoMyPageController.changePassword) — 현재 비밀번호가 틀리면 서버 메시지를 그대로 보여준다.
 */
import { computed, ref, watch } from "vue";
import { myPageSvc } from "~/svc/fo/ec/my/myPageSvc";

// ProfileEditModal 과 같은 방식 — 부모가 ref.show() / ref.close() 로 연다.
const visible = ref(false);
function show() {
  visible.value = true;
}
function close() {
  visible.value = false;
}
defineExpose({ show, close });

const current = ref("");
const next = ref("");
const next2 = ref("");
const errorMsg = ref("");
const saving = ref(false);
const done = ref(false);

watch(
  visible,
  (v) => {
    if (!v) return;
    current.value = next.value = next2.value = errorMsg.value = "";
    done.value = false;
  }
);

const strength = computed(() => {
  const n = next.value;
  const level = n.length < 6 ? 1 : n.length < 8 ? 2 : /[^a-zA-Z0-9]/.test(n) ? 4 : 3;
  return { level, label: ["", "약함", "보통", "양호", "강함"][level] };
});

async function save() {
  errorMsg.value = "";
  if (!current.value) return void (errorMsg.value = "현재 비밀번호를 입력하세요.");
  if (next.value.length < 6) return void (errorMsg.value = "새 비밀번호는 6자 이상이어야 합니다.");
  if (next.value !== next2.value) return void (errorMsg.value = "새 비밀번호가 일치하지 않습니다.");
  if (next.value === current.value) return void (errorMsg.value = "현재 비밀번호와 다른 비밀번호를 입력하세요.");
  saving.value = true;
  try {
    await myPageSvc.changePassword(current.value, next.value);
    done.value = true;
    setTimeout(close, 1400);
  } catch (e) {
    const x = e as { data?: { statusMessage?: string; message?: string }; statusMessage?: string };
    // 서버 메시지 끝의 "::클래스::메서드:줄" 내부 표기는 사용자에게 보이지 않게 잘라낸다
    errorMsg.value = (x?.data?.statusMessage || x?.data?.message || x?.statusMessage || "비밀번호 변경에 실패했습니다.").split("::")[0]!;
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.pw-input {
  width: 100%;
  padding: 10px 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.88rem;
  outline: none;
}
.pw-input:focus {
  border-color: #bc8246;
}
</style>
