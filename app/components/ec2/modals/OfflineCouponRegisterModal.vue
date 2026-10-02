<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9600] flex items-center justify-center bg-[#1a1410]/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="오프라인 쿠폰 신규등록" @click.self="hide">
      <div class="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
        <!-- 헤더 -->
        <div class="flex items-center justify-between border-b border-[#eceef1] px-5 py-3.5">
          <h3 class="m-0 flex items-center gap-2 text-[1.05rem] font-bold text-gray-900"><span aria-hidden="true">🎁</span> 오프라인 쿠폰 신규등록</h3>
          <button type="button" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f1f2f4] text-xl leading-none text-gray-600 hover:bg-[#e4e6ea]" aria-label="닫기" @click="hide">×</button>
        </div>

        <div class="overflow-y-auto px-5 py-4">
          <p class="mb-4 mt-0 rounded-lg bg-[#faf3ea] px-3.5 py-3 text-[0.8rem] leading-relaxed text-[#7a5a35]">
            무료로 미리 만들어 둔 쿠폰입니다. 코드마다 등록 가능한 수량이 정해져 있어(대부분 1명), 다른 분이 먼저 등록하면 "이미 등록되었습니다"로 표시됩니다.
            <button type="button" class="ml-1 cursor-pointer border-0 bg-transparent p-0 font-semibold text-theme underline" @click="load">새로고침</button>
          </p>

          <p v-if="loading" class="py-10 text-center text-sm text-gray-400">불러오는 중…</p>
          <p v-else-if="!items.length" class="py-10 text-center text-sm text-gray-400">등록 가능한 오프라인 쿠폰이 없습니다.</p>

          <div v-else class="flex flex-col gap-2.5">
            <div
              v-for="c in items"
              :key="c.couponId"
              class="flex items-center gap-3 rounded-xl border p-3.5"
              :class="rowBlockedReason(c) ? 'border-[#e5e7eb] bg-gray-50' : 'border-[#f0e2cf] bg-[#fffaf2]'"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-[0.92rem] font-bold text-gray-900">{{ c.couponNm }}</span>
                  <span class="rounded-full bg-[#faf3ea] px-2 py-px text-[11px] font-semibold text-theme">{{ c.couponTypeCdNm }}</span>
                </div>
                <div class="mt-1 flex items-center gap-1.5 text-[0.78rem] text-gray-500">
                  <span>발급코드</span>
                  <code class="rounded bg-[#f1f2f4] px-1.5 py-0.5 font-mono text-[0.8rem] font-semibold text-gray-800">{{ c.couponCd }}</code>
                </div>
                <p v-if="rowBlockedReason(c)" class="m-0 mt-1 text-[0.78rem] font-medium text-red-500">{{ rowBlockedReason(c) }}</p>
              </div>
              <button
                type="button"
                class="mbtn mbtn-primary shrink-0 !px-4 !py-2 !text-[0.82rem]"
                :disabled="!!rowBlockedReason(c) || claimingId === c.couponId"
                @click="doClaim(c)"
              >
                {{ claimingId === c.couponId ? "등록 중…" : "등록" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * OfflineCouponRegisterModal — 마이페이지 > 쿠폰 화면의 "오프라인 쿠폰 신규등록" 버튼에서 연다.
 * 2026-09-22(요청사항: "무료등록쿠폰 아래처럼 제시해줘 ... 쿠폰발급번호는 유일해야하며 ...
 * 이미등록되었다고해줘 ... 새로고침하여 등록안된 발급쿠폰중 새로 받을수 있게해줘") —
 * ecBeBo가 미리 만들어 둔 9종(주문/상품/배송할인/무료배송) 쿠폰 코드를 목록으로 보여주고,
 * 등록 버튼으로 claim한다. 등록 성공 시 부모(my/coupon.vue)에 알려 보유 쿠폰 목록을 새로고침시킨다.
 */
import { ref, onBeforeUnmount } from "vue";
import { offlineCouponSvc, type OfflineCouponItemType } from "~/svc/fo/ec/pm/offlineCouponSvc";

const emit = defineEmits<{ (e: "claimed"): void }>();

const open = ref(false);
const loading = ref(false);
const items = ref<OfflineCouponItemType[]>([]);
const claimingId = ref<string | null>(null);

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") hide();
}

async function load() {
  loading.value = true;
  try {
    items.value = await offlineCouponSvc.getAvailable();
  } catch (err) {
    useNuxtApp().$toast.error((err as Error)?.message || "쿠폰 목록을 불러오지 못했습니다.");
  } finally {
    loading.value = false;
  }
}

function rowBlockedReason(c: OfflineCouponItemType): string {
  if (c.claimedByMe) return "이미 등록하셨습니다.";
  if (c.remaining <= 0) return "이미 등록되었습니다. (모두 소진)";
  return "";
}

async function doClaim(c: OfflineCouponItemType) {
  if (rowBlockedReason(c)) return;
  claimingId.value = c.couponId;
  try {
    await offlineCouponSvc.claim(c.couponCd);
    await useAlert().openAlert(`"${c.couponNm}" 쿠폰이 등록되었습니다.`);
    emit("claimed");
    await load(); // 방금 소진된/내가 등록한 상태 반영
  } catch (err) {
    useNuxtApp().$toast.error((err as Error)?.message || "등록에 실패했습니다.");
    await load(); // 다른 사람이 먼저 등록해 소진됐을 수 있으니 최신 상태로 갱신
  } finally {
    claimingId.value = null;
  }
}

function show() {
  open.value = true;
  window.addEventListener("keydown", onKey);
  load();
}
function hide() {
  open.value = false;
  window.removeEventListener("keydown", onKey);
}
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
defineExpose({ show, hide });
</script>
