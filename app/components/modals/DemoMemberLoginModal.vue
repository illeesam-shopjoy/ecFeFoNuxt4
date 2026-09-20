<template>
  <Teleport to="body">
    <Transition name="demo-login-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1a1410]/60 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="demo-login-title" @click.self="close">
        <div class="demo-login-dialog relative w-full max-w-[560px] max-h-[88vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.28)]">
          <!-- 헤더 -->
          <div class="relative shrink-0 px-7 pt-7 pb-5 text-white bg-[linear-gradient(135deg,#c08a4b_0%,#a06a2e_100%)]">
            <button type="button" class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 transition" @click="close" aria-label="닫기">
              <i class="fal fa-times"></i>
            </button>
            <div class="flex items-center gap-3">
              <span class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl"><i class="fas fa-user-friends"></i></span>
              <div>
                <h3 id="demo-login-title" class="text-[1.15rem] font-bold leading-tight m-0 text-white">테스트 회원으로 로그인</h3>
                <p class="text-[0.82rem] text-white/85 mt-1 mb-0">회원을 선택하면 비밀번호 <code class="px-1.5 py-0.5 rounded bg-black/25 text-white font-semibold">1111</code> 로 바로 로그인됩니다.</p>
              </div>
            </div>
          </div>

          <!-- 회원 목록 -->
          <div class="overflow-y-auto p-5 bg-[#faf7f2]">
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none m-0 p-0">
              <li v-for="(m, i) in DEMO_MEMBERS" :key="m.loginId">
                <button
                  type="button"
                  class="group w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-[#ece4d8] text-left transition-all hover:border-theme hover:shadow-[0_6px_18px_rgba(160,106,46,0.18)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                  :disabled="loggingIn !== null"
                  @click="loginAs(m)"
                >
                  <span class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[0.95rem]" :style="{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }">{{ initial(m.name) }}</span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center gap-1.5">
                      <span class="text-[0.9rem] font-semibold text-gray-900 truncate">{{ m.name }}</span>
                      <span class="shrink-0 px-1.5 py-px rounded text-[0.65rem] font-bold" :style="joinBadge(m.loginId).style">{{ joinBadge(m.loginId).label }}</span>
                    </span>
                    <span class="block text-[0.74rem] text-gray-400 truncate">{{ m.loginId }}</span>
                  </span>
                  <span v-if="loggingIn === m.loginId" class="text-[0.72rem] text-theme font-semibold shrink-0">로그인 중…</span>
                  <i v-else class="fal fa-chevron-right text-gray-300 group-hover:text-theme transition-colors"></i>
                </button>
              </li>
            </ul>

            <p v-if="errorMsg" class="mt-4 mb-0 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[0.82rem]"><i class="fas fa-exclamation-circle mr-1.5"></i>{{ errorMsg }}</p>
          </div>
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

// 아바타 색상 / 이름 첫 글자("simul" 접두어 제외) / 가입 경로 뱃지(로그인ID 형태로 구분)
const AVATAR_COLORS = ["#c08a4b", "#5b8def", "#e0678a", "#3bb08f", "#8a6fdf", "#e59a3b", "#4aa3c7", "#d9695f", "#6b9a4a", "#9a7a5a"];
function initial(name: string) {
  const n = name.replace(/^simul/i, "");
  return (n || name).charAt(0);
}
function joinBadge(loginId: string) {
  if (loginId.includes("@zzkakao.com")) return { label: "카카오", style: { background: "#fee500", color: "#3c1e1e" } };
  if (loginId.includes("@zznaver.com")) return { label: "네이버", style: { background: "#03c75a", color: "#fff" } };
  if (loginId.includes("@gmail.com")) return { label: "구글", style: { background: "#e8f0fe", color: "#1a56c4" } };
  return { label: "일반", style: { background: "#f0ebe3", color: "#7a6a55" } };
}

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
