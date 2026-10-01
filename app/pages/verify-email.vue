<template>
  <!-- 이메일 인증 링크 도착 페이지 (/verify-email?token=...) — 메일의 [이메일 인증하기] 링크가 연다. 여러 목적의 링크가 이 페이지를 같이 쓴다.
       링크 유형에 따라 처리가 갈린다:
         · SIMPLE(단순 확인) — 가입·계정찾기·비회원 결제/채팅: 링크를 열면 바로 인증 완료
         · IDENTITY(본인인증 확인) — 마이페이지·판매자신청: 본인 재확인(PC=비밀번호 재입력, 모바일=지문·얼굴 등 기기 인증)을 거쳐야 완료
       인증을 마치면 안내 메시지를 보여주고 서버가 정한 경로(redirectPath)로 자동 이동한다. -->
  <layout :transparent="true">
    <breadcrumb-area title="이메일 인증" subtitle="이메일 인증" />
    <section class="login-area pt-[16px] md:pt-[100px] pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="mx-auto max-w-[480px] rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center">
          <template v-if="state === 'loading'">
            <p class="m-0 text-[0.95rem] text-gray-500">이메일 인증을 확인하고 있습니다...</p>
          </template>

          <!-- 본인인증 확인 (IDENTITY) — 본인 재확인 -->
          <template v-else-if="state === 'reauth'">
            <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#fffbeb] text-[1.5rem] text-[#d97706]"><i class="fas fa-user-shield"></i></div>
            <p class="m-0 mb-1 text-[1.05rem] font-bold text-gray-900">본인 확인이 필요합니다</p>
            <p v-if="maskedEmail" class="m-0 mb-1 text-[0.85rem] text-gray-500">{{ maskedEmail }}</p>
            <p class="m-0 mb-4 text-[0.85rem] text-gray-600">{{ canBiometric ? "지문·얼굴 등 기기 인증으로 본인을 확인해 주세요." : "보안을 위해 비밀번호를 다시 입력(재로그인)해 주세요." }}</p>

            <template v-if="canBiometric && !usePassword">
              <button type="button" class="mb-3 w-full cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-3 text-[0.95rem] font-bold text-white disabled:opacity-60" :disabled="busy" @click="runBiometric"><i class="fas fa-fingerprint mr-1"></i>{{ busy ? "확인 중..." : "지문·얼굴로 인증" }}</button>
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] text-gray-500 underline" @click="usePassword = true">비밀번호로 확인할게요</button>
            </template>
            <template v-else>
              <input v-model="password" type="password" autocomplete="current-password" placeholder="비밀번호" class="mb-3 h-11 w-full rounded-lg border border-[#e5e7eb] px-3 text-[0.95rem] outline-none focus:border-[#bc8246]" @keyup.enter="runPassword" />
              <button type="button" class="w-full cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-3 text-[0.95rem] font-bold text-white disabled:opacity-60" :disabled="busy || !password" @click="runPassword">{{ busy ? "확인 중..." : "확인" }}</button>
              <button v-if="canBiometric" type="button" class="mt-3 cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] text-gray-500 underline" @click="usePassword = false">지문·얼굴로 인증할게요</button>
            </template>
            <p v-if="reauthErr" class="m-0 mt-3 whitespace-pre-line text-[0.82rem] text-red-500">{{ reauthErr }}</p>
          </template>

          <template v-else-if="state === 'done'">
            <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4] text-[1.5rem] text-[#16a34a]"><i class="fas fa-check"></i></div>
            <p class="m-0 mb-1 text-[1.05rem] font-bold text-gray-900">이메일 인증이 완료되었습니다.</p>
            <p v-if="maskedEmail" class="m-0 mb-1 text-[0.85rem] text-gray-500">{{ maskedEmail }}</p>
            <p class="m-0 mb-5 text-[0.85rem] text-gray-600">{{ remain }}초 후 {{ purposeLabel }} 화면으로 자동 이동합니다.</p>
            <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-6 py-2.5 text-[0.9rem] font-bold text-white" @click="goNow">지금 이동</button>
          </template>
          <template v-else>
            <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#fef2f2] text-[1.5rem] text-red-500"><i class="fas fa-times"></i></div>
            <p class="m-0 mb-1 text-[1.05rem] font-bold text-gray-900">이메일 인증에 실패했습니다.</p>
            <p class="m-0 mb-5 whitespace-pre-line text-[0.85rem] text-gray-600">{{ errMsg }}</p>
            <nuxt-link to="/" class="inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-[0.9rem] font-bold text-white no-underline">홈으로</nuxt-link>
          </template>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { usePageTitle } from "~/composables/usePageTitle";
import { emailVerifySvc } from "~/svc/co/auth/emailVerifySvc";
import type { MbEmailVerifyPreviewType, MbEmailVerifyPurposeType, MbEmailVerifyReauthType } from "~/types/mb/mbEmailVerifyType";

useHead({ title: "이메일 인증" });
usePageTitle("이메일 인증");

const PURPOSE_LABEL: Record<MbEmailVerifyPurposeType, string> = {
  JOIN: "회원가입",
  SELLER_APPLY: "판매자 신청",
  CHECKOUT_GUEST: "주문",
  FIND_ACCOUNT: "아이디·비밀번호 찾기",
  CHAT_GUEST: "홈",
  MYPAGE: "내 정보",
};
const REDIRECT_SECONDS = 3;

const route = useRoute();
const state = ref<"loading" | "reauth" | "done" | "error">("loading");
const errMsg = ref("");
const maskedEmail = ref("");
const redirectPath = ref("/");
const purposeLabel = ref("");
const remain = ref(REDIRECT_SECONDS);
let timer: ReturnType<typeof setInterval> | null = null;

// 본인 재확인(IDENTITY 링크) — PC 는 비밀번호, 모바일은 기기 인증(지문·얼굴), 모바일에서 지원 안 되면 비밀번호
const token = String(route.query.token ?? "");
const challenge = ref("");
const canBiometric = ref(false);
const usePassword = ref(false);
const password = ref("");
const busy = ref(false);
const reauthErr = ref("");

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;
const b64url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

function goNow() {
  if (timer) clearInterval(timer);
  // redirectPath 는 서버가 목적별로 고정한 사이트 내부 경로 — 그래도 내부 경로(/로 시작, //로 시작 안 함)인지 한 번 더 확인
  const p = redirectPath.value;
  navigateTo(p.startsWith("/") && !p.startsWith("//") ? p : "/");
}

/** 인증 완료 처리 — 링크 유형 SIMPLE 은 reauth 없이, IDENTITY 는 재확인 값과 함께 */
async function doConfirm(reauth: MbEmailVerifyReauthType = {}): Promise<boolean> {
  try {
    const r = await emailVerifySvc.confirm(token, reauth);
    maskedEmail.value = r.maskedEmail;
    redirectPath.value = r.redirectPath;
    purposeLabel.value = PURPOSE_LABEL[r.purposeCd] ?? "";
    state.value = "done";
    timer = setInterval(() => {
      remain.value -= 1;
      if (remain.value <= 0) goNow();
    }, 1000);
    return true;
  } catch (e) {
    const msg = errText(e, "인증에 실패했습니다.");
    // 반복 실패로 서버가 인증 건을 무효화했거나 링크가 만료된 경우는 되돌릴 수 없으니 실패 화면, 그 외(비밀번호 오류 등)는 재시도
    if (state.value === "reauth" && /\(\d\/\d\)$/.test(msg)) reauthErr.value = msg;
    else {
      state.value = "error";
      errMsg.value = msg;
    }
    return false;
  }
}

/** PC / 모바일 비밀번호 폴백: 비밀번호 재입력(재로그인)으로 본인 확인 */
async function runPassword() {
  if (!password.value) return;
  busy.value = true;
  reauthErr.value = "";
  try {
    await doConfirm({ password: password.value });
  } finally {
    password.value = "";
    busy.value = false;
  }
}

/** 모바일 기기 인증 — WebAuthn(플랫폼 인증기, userVerification=required)으로 지문·얼굴·PIN 확인. 서버가 challenge/origin/UV 플래그를 검증한다 */
async function runBiometric() {
  busy.value = true;
  reauthErr.value = "";
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: fromB64url(challenge.value),
        rp: { name: "ShopJoy", id: location.hostname },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: maskedEmail.value || "shopjoy", displayName: "ShopJoy" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" },
        attestation: "none",
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;
    const res = cred?.response as (AuthenticatorAttestationResponse & { getAuthenticatorData?: () => ArrayBuffer }) | undefined;
    if (!res?.getAuthenticatorData) {
      // 인증 데이터를 읽지 못하는 브라우저 — 비밀번호로 확인하도록 안내
      usePassword.value = true;
      reauthErr.value = "이 기기에서는 기기 인증을 사용할 수 없습니다. 비밀번호로 확인해 주세요.";
      return;
    }
    await doConfirm({ clientDataJSON: b64url(res.clientDataJSON), authenticatorData: b64url(res.getAuthenticatorData()) });
  } catch (e) {
    const name = (e as { name?: string })?.name;
    reauthErr.value = name === "NotAllowedError" ? "기기 인증이 취소되었거나 시간이 지났습니다. 다시 시도하거나 비밀번호로 확인해 주세요." : "기기 인증에 실패했습니다. 비밀번호로 확인해 주세요.";
  } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  if (!token) {
    state.value = "error";
    errMsg.value = "인증 링크가 올바르지 않습니다.";
    return;
  }
  let pv: MbEmailVerifyPreviewType;
  try {
    pv = await emailVerifySvc.preview(token); // 링크 유형 확인(인증 상태는 바뀌지 않음)
  } catch (e) {
    state.value = "error";
    errMsg.value = errText(e, "인증에 실패했습니다.");
    return;
  }
  maskedEmail.value = pv.maskedEmail;
  purposeLabel.value = PURPOSE_LABEL[pv.purposeCd] ?? "";
  if (pv.linkType === "IDENTITY" && pv.reauthRequired) {
    // 본인인증 확인 링크 — 재확인 UI. 모바일(터치 기기)이고 플랫폼 인증기(지문·얼굴)가 있으면 기기 인증, 아니면 비밀번호(PC=재로그인)
    challenge.value = pv.challenge ?? "";
    const touch = window.matchMedia?.("(pointer: coarse)").matches === true;
    try {
      canBiometric.value = touch && !!window.PublicKeyCredential && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) && !!challenge.value;
    } catch {
      canBiometric.value = false;
    }
    state.value = "reauth";
    return;
  }
  await doConfirm(); // 단순 확인 링크(또는 이미 인증 완료된 링크 재방문) — 링크를 연 것만으로 완료
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
