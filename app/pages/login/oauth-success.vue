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
    const res = await authStore.socialLogin(provider, providerToken);
    if (res.ok) {
      router.replace("/");
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
    router.replace("/");
  });
});

useHead({ title: "로그인 완료" });
</script>
