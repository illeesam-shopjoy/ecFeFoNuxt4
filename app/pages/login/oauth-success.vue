<template>
  <layout :transparent="true">
    <div class="min-h-[40vh] flex items-center justify-center">
      <p class="text-gray-600">{{ message }}</p>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import { useAuthStore } from "~/store/useAuthStore";
import { consumeLoginReturn } from "~/utils/loginReturn";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const message = ref("로그인 처리 중...");

onMounted(async () => {
  // 소셜 제공자 accessToken(URL 해시) → ecBeBo 가 검증·회원매칭/가입·자체 토큰 발급
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const provider = hash.get("provider");
  const providerToken = hash.get("accessToken");
  if (provider && providerToken) {
    history.replaceState(null, "", location.pathname); // 주소창/히스토리에서 토큰 제거
    // 네이버: 연동 취소 계정이 제공자 쪽 연결 해제 + 동의 화면을 다시 거쳐 왔으면 재연동을 허용받는다
    const reconsent = provider === "naver" && sessionStorage.getItem("naver_reconsent") === "1";
    if (reconsent) sessionStorage.removeItem("naver_reconsent");
    const res = await authStore.socialLogin(provider, providerToken, reconsent);
    if (res.ok) {
      router.replace(consumeLoginReturn());
    } else if (res.message?.includes("KAKAO_RECONSENT") && Date.now() - Number(sessionStorage.getItem("kakao_reconsent") ?? 0) > 60_000) {
      // 연동을 취소했던 카카오 계정 — 서버가 카카오 쪽 동의를 지웠으니 카카오 인증을 다시 시작해 동의 화면(필수/선택)을 띄운다(무한 반복 방지: 60초에 한 번)
      sessionStorage.setItem("kakao_reconsent", String(Date.now()));
      message.value = "카카오 동의 화면으로 이동합니다...";
      window.location.replace(`/api/auth/${provider}`);
    } else if (res.message?.includes("NAVER_RECONSENT") && Date.now() - Number(sessionStorage.getItem("naver_reconsent_at") ?? 0) > 60_000) {
      // 연동을 취소했던 네이버 계정 — 방금 받은 토큰으로 네이버 쪽 연결을 지우고(서버), 네이버 인증을 다시 시작해 동의 화면을 띄운다(무한 반복 방지: 60초에 한 번)
      sessionStorage.setItem("naver_reconsent_at", String(Date.now()));
      message.value = "네이버 동의 화면으로 이동합니다...";
      const r = await $fetch<{ ok: boolean }>("/api/auth/naver-revoke", { method: "POST", body: { accessToken: providerToken } }).catch(() => ({ ok: false }));
      if (r.ok) {
        sessionStorage.setItem("naver_reconsent", "1");
        window.location.replace("/api/auth/naver");
      } else {
        message.value = "네이버 연결을 다시 설정하지 못했습니다. 이메일/비밀번호로 로그인한 뒤 프로필에서 다시 연동해 주세요.";
        router.replace(`/login?error=${encodeURIComponent(message.value)}`);
      }
    } else {
      message.value = res.message ?? "소셜 로그인에 실패했습니다.";
      router.replace(`/login?error=${encodeURIComponent(message.value)}`);
    }
    return;
  }

  const token = route.query.token as string;
  if (!token) {
    message.value = "토큰이 없습니다.";
    router.replace("/login");
    return;
  }
  authStore.setToken(token);
  authStore.loadStAuthInfo().then(() => {
    router.replace(consumeLoginReturn());
  });
});

useHead({ title: "로그인 완료" });
</script>
