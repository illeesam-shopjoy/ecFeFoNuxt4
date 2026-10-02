<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9600] flex items-center justify-center bg-[#1a1410]/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="캐시 충전" @click.self="hide">
      <div class="flex max-h-[85vh] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
        <div class="flex items-center justify-between border-b border-[#eceef1] px-5 py-3.5">
          <h3 class="m-0 flex items-center gap-2 text-[1.05rem] font-bold text-gray-900"><span aria-hidden="true">💰</span> 캐시 충전</h3>
          <button type="button" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f1f2f4] text-xl leading-none text-gray-600 hover:bg-[#e4e6ea]" aria-label="닫기" @click="hide">×</button>
        </div>

        <div class="overflow-y-auto px-5 py-4">
          <div class="mb-4 rounded-xl px-5 py-4 text-gray-900" style="background: linear-gradient(135deg, #fbbf24, #f59e0b)">
            <div class="text-[0.8rem] font-semibold opacity-80">보유 캐시</div>
            <div class="mt-0.5 text-[1.6rem] font-black">{{ formatPrice(props.balance) }}</div>
          </div>

          <!-- 실제 결제(토스) 충전 -->
          <label class="mb-1.5 block text-[0.82rem] font-semibold text-gray-700">충전 금액</label>
          <input v-model="amountInput" inputmode="numeric" placeholder="충전 금액 입력 (1,000~1,000,000원)" class="fo-my-in mb-2.5 w-full" @input="amountInput = amountInput.replace(/[^0-9]/g, '')" />
          <div class="mb-3 flex flex-wrap gap-1.5">
            <button v-for="a in [5000, 10000, 30000, 50000]" :key="a" type="button" class="rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-gray-700 hover:border-gray-400" @click="amountInput = String(Number(amountInput || 0) + a)">+{{ a.toLocaleString() }}원</button>
          </div>
          <button type="button" class="w-full rounded-md border-0 bg-gray-900 py-2.5 text-[0.88rem] font-bold text-white hover:bg-gray-800" @click="goCharge">{{ amountInput ? `${formatPrice(Number(amountInput))} ` : "" }}충전하기</button>

          <div class="my-4 border-t border-[#f0f0f0]"></div>

          <!-- 2026-09-23(요청사항: "하단에 무료충전 란 넣어줘 0~1만원까지 무료충전할수 있게해줘 -금액을 입력 후 충전 누르면
               강제차감시켜줘") — 실 결제 없이 잔액을 바로 조정하는 테스트용 섹션. 양수=무료충전(최대 10,000원),
               음수=강제차감(서버가 강제로, 잔액이 모자라도 그대로 반영). -->
          <label class="mb-1.5 block text-[0.82rem] font-semibold text-gray-700">🧪 무료충전 (테스트)</label>
          <p class="m-0 mb-2 text-[0.74rem] leading-relaxed text-gray-400">0~10,000원은 무료로 충전됩니다. 음수를 입력하면 잔액에서 강제로 차감합니다(테스트용).</p>
          <div class="flex gap-2">
            <input v-model="freeAmountInput" inputmode="numeric" placeholder="-1,000,000 ~ 10,000" class="fo-my-in flex-1" @input="freeAmountInput = freeAmountInput.replace(/[^0-9-]/g, '')" />
            <button type="button" class="shrink-0 rounded-md border-0 bg-[#bc8246] px-4 py-2 text-[0.84rem] font-bold text-white hover:bg-[#a06a35] disabled:opacity-60" :disabled="freeCharging" @click="doFreeCharge">
              {{ freeCharging ? "처리 중…" : "무료충전" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * CashChargeModal — 마이페이지 > 캐시 화면의 "캐시 충전하기" 버튼에서 연다.
 * 2026-09-23(요청사항: "캐시란에 캐시충전하기 기능넣어줘 캐시충전 버튼 클릭하면 모달로 캐시충전화면 띄워주고
 * 하단에 무료충전 란 넣어줘") — 위쪽은 기존 실 결제(토스) 충전 흐름(그대로 /my/charge로 이동), 아래쪽은
 * 실 결제 없이 잔액을 직접 조정하는 무료충전/강제차감 테스트 섹션.
 */
import { ref, onBeforeUnmount } from "vue";
import { myCashChargeSvc } from "~/svc/fo/ec/my/myCashChargeSvc";

const props = defineProps<{ balance: number }>();
const emit = defineEmits<{ (e: "charged"): void }>();

const { formatPrice } = usePrice();
const open = ref(false);
const amountInput = ref("");
const freeAmountInput = ref("");
const freeCharging = ref(false);

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") hide();
}

function show() {
  amountInput.value = "";
  freeAmountInput.value = "";
  open.value = true;
  window.addEventListener("keydown", onKey);
}
function hide() {
  open.value = false;
  window.removeEventListener("keydown", onKey);
}
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

function goCharge() {
  const amt = Math.floor(Number(amountInput.value || 0));
  if (!amt || amt < 1000) return void useNuxtApp().$toast.error("충전 금액은 1,000원 이상 입력해 주세요.");
  if (amt > 1_000_000) return void useNuxtApp().$toast.error("1회 충전은 1,000,000원까지 가능합니다.");
  open.value = false;
  navigateTo({ path: "/my/charge", query: { amount: String(amt) } });
}

async function doFreeCharge() {
  const amt = Math.trunc(Number(freeAmountInput.value || 0));
  if (!amt) return void useNuxtApp().$toast.error("금액을 입력해 주세요.");
  if (amt > 10_000) return void useNuxtApp().$toast.error("무료충전은 최대 10,000원까지 가능합니다.");
  if (amt < -1_000_000) return void useNuxtApp().$toast.error("강제차감은 최대 1,000,000원까지 가능합니다.");
  freeCharging.value = true;
  try {
    const res = await myCashChargeSvc.freeCharge(amt);
    await useAlert().openAlert(amt > 0 ? `${formatPrice(amt)} 무료충전되었습니다.\n잔액: ${formatPrice(res.balance)}` : `${formatPrice(Math.abs(amt))} 강제차감되었습니다.\n잔액: ${formatPrice(res.balance)}`);
    freeAmountInput.value = "";
    emit("charged");
  } catch (err) {
    useNuxtApp().$toast.error((err as Error)?.message || "처리에 실패했습니다.");
  } finally {
    freeCharging.value = false;
  }
}

defineExpose({ show, hide });
</script>
