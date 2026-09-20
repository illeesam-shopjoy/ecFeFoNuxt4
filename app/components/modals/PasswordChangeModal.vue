<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/45" role="dialog" aria-modal="true" aria-labelledby="pw-change-title" @click.self="handleBtnAction('modal-close')">
      <div class="relative w-full max-w-[400px] rounded-xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <button type="button" class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer" aria-label="닫기" @click="handleBtnAction('modal-close')">
          <i class="fal fa-times"></i>
        </button>

        <div class="-mx-7 -mt-7 mb-5 rounded-t-xl border-b border-[#f0e2cf] bg-[#faf3ea] px-7 pb-4 pt-6">
          <h3 id="pw-change-title" class="text-[1.2rem] font-extrabold text-gray-900 m-0"><i class="fas fa-key text-theme mr-2 text-base"></i>비밀번호 변경</h3>
          <div class="text-[0.8rem] text-gray-400 mt-1">현재 비밀번호 확인 후 변경할 수 있습니다</div>
        </div>

        <div v-if="done" class="text-center py-5">
          <div class="text-[2.5rem] mb-3 text-green-500"><i class="fas fa-check-circle"></i></div>
          <div class="text-base font-bold text-green-600">비밀번호가 변경되었습니다!</div>
        </div>

        <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — 입력칸을 <fo-form> 으로 교체 -->
        <fo-form v-else :columns="formCols" :form="form" :cols="1" :gap="12" @submit="handleBtnAction('form-save')">
          <!-- 규칙 충족 표시 -->
          <template #rules>
            <password-rules class="-mt-2" :value="form.next" />
          </template>

          <template #match>
            <field-msg v-if="form.next2" class="-mt-2" :ok="form.next2 === form.next" :text="form.next2 === form.next ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'" />
          </template>

          <template #actions>
            <div v-if="errorMsg" class="text-[0.82rem] text-red-500 px-3 py-2 mb-3 bg-red-50 rounded-md">{{ errorMsg }}</div>

            <div class="flex gap-2.5 mt-2">
              <button type="button" class="flex-1 py-3 border border-[#c9ced6] rounded-lg bg-[#f3f4f6] text-gray-700 text-[0.88rem] font-semibold cursor-pointer shadow-sm hover:bg-[#e5e7eb] transition" @click="handleBtnAction('modal-close')">취소</button>
              <button type="submit" class="flex-[2] py-3 border-0 rounded-lg bg-gray-900 text-white text-[0.88rem] font-bold cursor-pointer disabled:opacity-50" :disabled="saving">
                {{ saving ? "변경 중..." : "변경하기" }}
              </button>
            </div>
          </template>
        </fo-form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 비밀번호 변경 모달 (2026-09-19, ecFeBo foAppHeader 의 비밀번호 변경 모달 이식).
 * POST /api/fo/ec/my/password(ecBeBo FoMyPageController.changePassword) — 현재 비밀번호가 틀리면 서버 메시지를 그대로 보여준다.
 */
import { reactive, ref, watch } from "vue";
import FoForm from "~/components/fo/FoForm.vue";
import PasswordRules from "~/components/fo/PasswordRules.vue";
import FieldMsg from "~/components/fo/FieldMsg.vue";
import { isPasswordValid, PASSWORD_RULE_MESSAGE } from "~/utils/passwordPolicy";
import type { FoFormColumn } from "~/types/fo/foCompType";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";

// ProfileEditModal 과 같은 방식 — 부모가 ref.show() / ref.close() 로 연다.
const visible = ref(false);
function show() {
  visible.value = true;
}
function close() {
  visible.value = false;
}
defineExpose({ show, close });

const form = reactive({ current: "", next: "", next2: "" });
const formCols: FoFormColumn[] = [
  { key: "current", label: "현재 비밀번호", type: "password", placeholder: "현재 비밀번호 입력", autocomplete: "current-password" },
  { key: "next", label: "새 비밀번호", type: "password", placeholder: "새 비밀번호 입력", autocomplete: "new-password" },
  { key: "rules", type: "slot" },
  { key: "next2", label: "새 비밀번호 확인", type: "password", placeholder: "새 비밀번호 재입력", autocomplete: "new-password" },
  { key: "match", type: "slot" },
];
const errorMsg = ref("");
const saving = ref(false);
const done = ref(false);

watch(
  visible,
  (v) => {
    if (!v) return;
    form.current = form.next = form.next2 = errorMsg.value = "";
    done.value = false;
  }
);

async function save() {
  errorMsg.value = "";
  if (!form.current) return void (errorMsg.value = "현재 비밀번호를 입력하세요.");
  if (!isPasswordValid(form.next)) return void (errorMsg.value = PASSWORD_RULE_MESSAGE);
  if (form.next !== form.next2) return void (errorMsg.value = "새 비밀번호가 일치하지 않습니다.");
  if (form.next === form.current) return void (errorMsg.value = "현재 비밀번호와 다른 비밀번호를 입력하세요.");
  saving.value = true;
  try {
    await myInfoSvc.changePassword(form.current, form.next);
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

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ PasswordChangeModal.vue : handleBtnAction -> ", cmd, param);
  // 비밀번호 변경 저장
  if (cmd === "form-save") {
    return save();
  // 모달 닫기
  } else if (cmd === "modal-close") {
    return close();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
