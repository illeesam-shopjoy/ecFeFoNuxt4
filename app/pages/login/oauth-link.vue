<template>
  <layout :transparent="true">
    <div class="min-h-[40vh] flex items-center justify-center">
      <p class="text-gray-600">{{ message }}</p>
    </div>
  </layout>
</template>

<script setup lang="ts">
/**
 * 소셜 연동 마무리 — /api/auth/{kakao|naver|google}?link=1 흐름의 콜백이 제공자 accessToken 을 주소 조각(#)으로 넘겨준다.
 * 여기서 내 JWT 와 함께 ecBeBo 에 넘기면 서버가 제공자에게 직접 검증해 mb_member_sns 에 연동한다. 끝나면 회원정보(프로필 수정)로 돌아간다.
 */
import Layout from "~/layout/Layout.vue";
import { useAuthStore } from "~/store/useAuthStore";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";

const message = ref("소셜 계정 연동 중...");
const back = (q: string) => navigateTo(`/account?${q}`, { replace: true });

onMounted(async () => {
  const frag = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const provider = frag.get("provider") ?? "";
  const at = frag.get("at") ?? "";
  history.replaceState(null, "", window.location.pathname); // 주소 조각(토큰)을 주소창/기록에서 지운다
  const auth = useAuthStore();
  auth.loadStToken();
  if (!provider || !at) return void (await back("snsError=" + encodeURIComponent("소셜 인증 정보가 없습니다.")));
  if (!auth.isStLoggedIn) return void (await navigateTo("/login", { replace: true }));
  try {
    await myInfoSvc.linkSns(provider, at);
    await back(`openProfile=1&snsLinked=${encodeURIComponent(provider)}`);
  } catch (e) {
    const x = e as { data?: { message?: string }; statusMessage?: string; message?: string };
    message.value = "연동에 실패했습니다.";
    await back("openProfile=1&snsError=" + encodeURIComponent(String(x?.data?.message ?? x?.statusMessage ?? x?.message ?? "연동에 실패했습니다.").split("::")[0]!));
  }
});
</script>
