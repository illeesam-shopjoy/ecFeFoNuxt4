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

/** 소셜 인증 팝업으로 열렸는가 — 시작 라우트가 심은 쿠키(oauth_link_popup). window.opener 는 소셜 페이지를 거치며 끊길 수 있어(COOP) 쓰지 않는다 */
const isPopup = () => document.cookie.split("; ").some((c) => c === "oauth_link_popup=1");
/** 결과를 부모 창(프로필 수정)에 알리고 창을 닫는다 — 같은 출처 BroadcastChannel */
function notifyOpener(ok: boolean, provider: string, msg = "") {
  document.cookie = "oauth_link_popup=; path=/; max-age=0";
  const ch = new BroadcastChannel("sns-link");
  ch.postMessage({ type: "sns-link", ok, provider, message: msg });
  ch.close();
  window.close();
}
const errMsg = (e: unknown) => {
  const x = e as { data?: { message?: string }; statusMessage?: string; message?: string };
  return String(x?.data?.message ?? x?.statusMessage ?? x?.message ?? "연동에 실패했습니다.").split("::")[0]!;
};

onMounted(async () => {
  const frag = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const provider = frag.get("provider") ?? "";
  const at = frag.get("at") ?? "";
  const error = frag.get("error") ?? "";
  history.replaceState(null, "", window.location.pathname); // 주소 조각(토큰)을 주소창/기록에서 지운다
  const popup = isPopup();

  if (error) {
    message.value = error;
    return popup ? notifyOpener(false, provider, error) : void (await back("openProfile=1&snsError=" + encodeURIComponent(error)));
  }
  const auth = useAuthStore();
  auth.loadStToken();
  if (!provider || !at) {
    const m = "소셜 인증 정보가 없습니다.";
    return popup ? notifyOpener(false, provider, m) : void (await back("snsError=" + encodeURIComponent(m)));
  }
  if (!auth.isStLoggedIn) return popup ? notifyOpener(false, provider, "로그인이 필요합니다.") : void (await navigateTo("/login", { replace: true }));
  try {
    await myInfoSvc.linkSns(provider, at);
    message.value = "연동되었습니다.";
    if (popup) return notifyOpener(true, provider);
    await back(`openProfile=1&snsLinked=${encodeURIComponent(provider)}`);
  } catch (e) {
    message.value = "연동에 실패했습니다.";
    if (popup) return notifyOpener(false, provider, errMsg(e));
    await back("openProfile=1&snsError=" + encodeURIComponent(errMsg(e)));
  }
});
</script>
