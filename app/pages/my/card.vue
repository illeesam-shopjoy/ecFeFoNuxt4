<template>
  <my-shell active="card" title="결제카드 등록" :file-path="currentFilePath">
    <div class="mb-4 flex items-center justify-between">
      <p class="m-0 text-[0.85rem] text-gray-500">카드번호는 저장하지 않고 결제사(토스페이먼츠)에 안전하게 등록됩니다. 기본 카드가 먼저 사용됩니다.</p>
      <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white disabled:opacity-60" :disabled="busy" @click="registerCard">{{ busy ? "처리 중..." : "+ 카드 등록" }}</button>
    </div>
    <div v-if="loading" class="py-12 text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-400">등록된 결제카드가 없습니다.</div>
    <ul v-else class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
      <li v-for="c in list" :key="c.cardId" class="rounded-2xl border bg-gradient-to-br from-[#2b2f3a] to-[#111827] p-5 text-white" :class="c.isDefault === 'Y' ? 'border-[#bc8246] shadow-[0_0_0_2px_#bc8246]' : 'border-transparent'">
        <div class="flex items-center gap-2">
          <span class="text-[0.95rem] font-bold">{{ c.cardCompany || "카드" }}</span>
          <span v-if="c.isDefault === 'Y'" class="rounded-full bg-[#bc8246] px-2 py-px text-[0.7rem] font-bold">기본</span>
          <span class="ml-auto text-[0.75rem] text-white/60">{{ c.cardType }}</span>
        </div>
        <div class="my-4 font-mono text-[1.05rem] tracking-widest">{{ c.cardNoMasked || "****" }}</div>
        <div class="flex gap-3 text-[0.8rem]">
          <button v-if="c.isDefault !== 'Y'" type="button" class="cursor-pointer border-0 bg-transparent p-0 text-white underline" @click="setDefault(c)">기본으로 설정</button>
          <button type="button" class="ml-auto cursor-pointer border-0 bg-transparent p-0 text-[#fca5a5] underline" @click="remove(c)">삭제</button>
        </div>
      </li>
    </ul>
  </my-shell>
</template>

<script setup lang="ts">
import MyShell from "~/components/my/MyShell.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { myCardSvc } from "~/svc/fo/ec/my/myCardSvc";
import { loadScriptOnce } from "~/utils/loadScript";
import type { MbMemberCardType } from "~/types/mb/mbMemberCardType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 결제카드" });
usePageTitle("마이페이지 - 결제카드");

const cfg = useRuntimeConfig().public as { mode?: string; tossBillingClientKey?: string };
const loading = ref(true);
const busy = ref(false);
const list = ref<MbMemberCardType[]>([]);
const maskKey = (k?: string) => (!k ? "(미설정)" : k.length <= 12 ? "***" : `${k.slice(0, 8)}***${k.slice(-4)}`);
const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

async function load() {
  try {
    list.value = await myCardSvc.getCards();
  } finally {
    loading.value = false;
  }
}

/** 토스 빌링 인증(카드 등록창) — 성공하면 이 화면으로 authKey 와 함께 돌아온다 */
async function registerCard() {
  const key = cfg.tossBillingClientKey;
  const info = [{ label: "실행 모드(RUN_MODE)", value: String(cfg.mode ?? "-") }, { label: "빌링 클라이언트 키", value: maskKey(key) }];
  if (!key) {
    await useAlert().openAlert({ title: "카드 등록 연동 실패", variant: "error", message: "카드 등록(토스 빌링) 클라이언트 키가 설정되지 않았습니다.\n(.env 의 NUXT_PUBLIC_TOSSPAYMENTS_BILLING_CLIENT_KEY — 토스 'API 개별 연동' 클라이언트 키)", details: info });
    return;
  }
  busy.value = true;
  try {
    await loadScriptOnce("https://js.tosspayments.com/v2/standard");
    const T = (window as unknown as { TossPayments?: (k: string) => { payment: (o: { customerKey: string }) => { requestBillingAuth: (o: Record<string, unknown>) => Promise<void> } } }).TossPayments;
    if (!T) throw new Error("토스페이먼츠 SDK 를 초기화하지 못했습니다.");
    const memberId = useAuthStore().user?.memberId;
    if (!memberId) throw new Error("로그인 정보가 없습니다.");
    await T(key).payment({ customerKey: memberId }).requestBillingAuth({ method: "CARD", successUrl: `${location.origin}/my/card`, failUrl: `${location.origin}/my/card`, customerEmail: useAuthStore().user?.userEmail });
  } catch (e) {
    const x = e as { code?: string; message?: string };
    if (x?.code !== "USER_CANCEL") await useAlert().openAlert({ title: "카드 등록 실패", variant: "error", message: `${x?.message ?? "카드 등록창을 열지 못했습니다."}${x?.code ? `\n(오류 코드: ${x.code})` : ""}`, details: info });
  } finally {
    busy.value = false;
  }
}
async function setDefault(c: MbMemberCardType) {
  try {
    list.value = await myCardSvc.setDefault(c.cardId);
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "기본 카드 설정에 실패했습니다."));
  }
}
async function remove(c: MbMemberCardType) {
  if (!(await useConfirm().openConfirm({ title: "카드 삭제", message: `${c.cardCompany ?? "카드"} ${c.cardNoMasked ?? ""} 를 삭제할까요?`, confirmText: "삭제", cancelText: "취소", variant: "danger" }))) return;
  try {
    list.value = await myCardSvc.removeCard(c.cardId);
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "삭제에 실패했습니다."));
  }
}
onMounted(async () => {
  const auth = useAuthStore();
  auth.loadStToken();
  if (!auth.isStLoggedIn) return void (await navigateTo("/login"));
  const q = useRoute().query;
  // 토스 카드 등록창에서 돌아옴: authKey → 서버가 빌링키 발급·보관
  if (q.authKey) {
    try {
      list.value = await myCardSvc.addCard(String(q.authKey));
      useNuxtApp().$toast.success("카드가 등록되었습니다.");
    } catch (e) {
      await useAlert().openAlert({ title: "카드 등록 실패", variant: "error", message: errText(e, "카드 등록에 실패했습니다.") });
    }
    history.replaceState(null, "", location.pathname);
    loading.value = false;
    return;
  }
  if (q.code) await useAlert().openAlert({ title: "카드 등록 실패", variant: "error", message: `${String(q.message ?? "카드 등록에 실패했습니다.")}\n(오류 코드: ${String(q.code)})` });
  await load();
});
</script>
