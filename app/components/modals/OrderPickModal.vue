<template>
  <Teleport to="body">
    <Transition name="order-pick-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1a1410]/60 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="order-pick-title" @click.self="close">
        <div class="relative w-full max-w-[520px] max-h-[80vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.28)]">
          <div class="flex items-center justify-between px-6 py-4 border-b border-[#eee]">
            <h3 id="order-pick-title" class="text-[1.05rem] font-bold text-gray-900 m-0">📋 주문 선택</h3>
            <button type="button" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border-0 cursor-pointer" aria-label="닫기" @click="close"><i class="fal fa-times"></i></button>
          </div>
          <div class="overflow-y-auto p-4 bg-[#faf7f2]">
            <p v-if="loading" class="text-center text-sm text-gray-400 py-8 m-0">불러오는 중…</p>
            <p v-else-if="errorMsg" class="text-center text-sm text-red-500 py-8 m-0">{{ errorMsg }}</p>
            <p v-else-if="!orders.length" class="text-center text-sm text-gray-400 py-8 m-0">주문 내역이 없습니다.</p>
            <ul v-else class="list-none m-0 p-0 flex flex-col gap-2">
              <li v-for="o in orders" :key="o.orderId">
                <button type="button" class="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-[#ece4d8] text-left cursor-pointer transition-all hover:border-theme hover:shadow-[0_6px_18px_rgba(160,106,46,0.18)]" @click="pick(o.orderId)">
                  <span class="min-w-0 flex-1">
                    <span class="block font-mono text-[0.85rem] font-bold text-gray-900 truncate">{{ o.orderId }}</span>
                    <span class="block text-[0.74rem] text-gray-400">{{ o.orderDate }}<template v-if="o.status"> · {{ o.status }}</template></span>
                  </span>
                  <span class="text-[0.85rem] font-extrabold text-gray-900 shrink-0">{{ o.payAmt.toLocaleString() }}원</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 2026-09-20(요청사항: "문의하기 주문번호") — ecFeBo cmPopup-myMemberOrder-pick(내 주문 선택 공통팝업) 대응.
 * 로그인 회원의 주문 목록(myOrderSvc.getList)에서 하나를 고르면 select(orderId) 로 알려준다.
 */
import { ref } from "vue";
import { myOrderSvc } from "~/svc/fo/my/myOrderSvc";

interface OrderRow { orderId: string; orderDate: string; status: string; payAmt: number }

const emit = defineEmits<{ (e: "select", orderId: string): void }>();
const visible = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const orders = ref<OrderRow[]>([]);

const ymd = (v: unknown) => String(v ?? "").slice(0, 10);

async function show() {
  visible.value = true;
  loading.value = true;
  errorMsg.value = "";
  try {
    const rows = await myOrderSvc.getList();
    orders.value = rows.map((o) => ({ orderId: String(o.orderId), orderDate: ymd(o.orderDate), status: String(o.orderStatusCdNm ?? ""), payAmt: Number(o.payAmt ?? o.totalAmt ?? 0) }));
  } catch {
    errorMsg.value = "주문 내역을 불러오지 못했습니다. 로그인 상태를 확인해 주세요.";
  } finally {
    loading.value = false;
  }
}
function close() { visible.value = false; }
function pick(orderId: string) { emit("select", orderId); visible.value = false; }

defineExpose({ show });
</script>

<style scoped>
.order-pick-fade-enter-active, .order-pick-fade-leave-active { transition: opacity 0.2s ease; }
.order-pick-fade-enter-from, .order-pick-fade-leave-to { opacity: 0; }
</style>
