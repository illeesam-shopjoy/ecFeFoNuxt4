<template>
  <Teleport to="body">
    <Transition name="demo-login-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="demo-login-title" @click.self="close">
        <div class="demo-login-dialog relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-xl p-6">
          <button type="button" class="absolute top-4 right-4 p-2 rounded hover:bg-gray-100" @click="close" aria-label="닫기">
            <i class="fal fa-times"></i>
          </button>
          <h3 id="demo-login-title" class="text-lg font-semibold text-gray-900 mb-1">회원 목록에서 로그인</h3>
          <p class="text-sm text-gray-500 mb-5">한 명을 선택하면 비밀번호 <code class="bg-gray-100 px-1 rounded">1111</code>로 바로 로그인됩니다.</p>

          <ul class="flex flex-col gap-2">
            <li v-for="m in DEMO_MEMBERS" :key="m.loginId">
              <button
                type="button"
                class="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 hover:border-theme hover:bg-theme/5 transition text-left disabled:opacity-50"
                :disabled="loggingIn !== null"
                @click="loginAs(m)"
              >
                <span>
                  <span class="block text-sm font-medium text-gray-900">{{ m.name }}</span>
                  <span class="block text-xs text-gray-500">{{ m.loginId }}</span>
                </span>
                <span v-if="loggingIn === m.loginId" class="text-xs text-gray-400">로그인 중…</span>
                <i v-else class="fal fa-chevron-right text-gray-300"></i>
              </button>
            </li>
          </ul>

          <p v-if="errorMsg" class="text-danger text-sm mt-4">{{ errorMsg }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 2026-09-14(요청사항: "회원가입 아래 회원목록 모달 호출해줘 그 중에서 한명 선택하여
 * 로그인되게 해줘 비밀번호 1111 로 보내면 로그인될거야") — 실 DB(shopjoy_2604.mb_member)에서
 * 확인한, 비밀번호가 전부 "1111"인 활성 시뮬레이션 회원 계정 목록으로 원클릭 로그인.
 * ecBeBo의 회원목록 API(/api/base/ec/mb/member)는 내부 전용(인증 필요, 실사용 금지 경로)이라
 * 그대로 못 쓰고, 실제 조회해서 확인한 값을 고정 목록으로 둔다 — CouponModal.vue의 목업
 * 쿠폰 목록과 같은 방식.
 */
import { ref } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";

const DEMO_PASSWORD = "1111";
const DEMO_MEMBERS = [
  { loginId: "sim_95084@gmail.com", name: "simul임은서" },
  { loginId: "sim_24043@zzkakao.com", name: "simul한민준" },
  { loginId: "sim_22179@zznaver.com", name: "simul류민준" },
  { loginId: "sim_74353", name: "simul홍윤서" },
  { loginId: "sim_29993", name: "simul서은서" },
  { loginId: "sim_09960", name: "simul박지민" },
  { loginId: "sim_23696", name: "simul류나연" },
  { loginId: "sim_22768", name: "simul장채원" },
  { loginId: "sim_22312", name: "simul강도윤" },
  { loginId: "sim_71720", name: "simul안은서" },
];

const emit = defineEmits<{ (e: "loggedIn"): void }>();

const authStore = useAuthStore();
const router = useRouter();
const visible = ref(false);
const loggingIn = ref<string | null>(null);
const errorMsg = ref("");

function show() {
  visible.value = true;
  errorMsg.value = "";
}
function close() {
  visible.value = false;
}

async function loginAs(m: { loginId: string; name: string }) {
  loggingIn.value = m.loginId;
  errorMsg.value = "";
  const result = await authStore.login(m.loginId, DEMO_PASSWORD);
  loggingIn.value = null;
  if (result.ok) {
    visible.value = false;
    emit("loggedIn");
    router.push("/");
  } else {
    errorMsg.value = result.message ?? "로그인에 실패했습니다.";
  }
}

defineExpose({ show });
</script>

<style scoped>
.demo-login-fade-enter-active,
.demo-login-fade-leave-active {
  transition: opacity 0.2s ease;
}
.demo-login-fade-enter-from,
.demo-login-fade-leave-to {
  opacity: 0;
}
.demo-login-fade-enter-active .demo-login-dialog,
.demo-login-fade-leave-active .demo-login-dialog {
  transition: transform 0.2s ease;
}
.demo-login-fade-enter-from .demo-login-dialog,
.demo-login-fade-leave-to .demo-login-dialog {
  transform: scale(0.95);
}
</style>
