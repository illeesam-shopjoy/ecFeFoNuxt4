<template>
  <layout :transparent="true">
    <breadcrumb-area title="결제 완료" subtitle="결제 완료" />
    <section class="checkout-area pb-70">
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <template v-if="status === 'loading'">
          <p class="text-gray-600">결제를 확인하고 있습니다...</p>
        </template>
        <template v-else-if="status === 'success'">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[1.7rem] text-[#16a34a]"><i class="fas fa-check"></i></div>
          <h2 class="text-2xl font-bold mb-2" :class="waitingDeposit ? 'text-[#b45309]' : 'text-green-700'">{{ waitingDeposit ? "입금 대기 중입니다" : "결제가 완료되었습니다" }}</h2>
          <p class="text-gray-500 mb-8 text-[0.9rem]">{{ waitingDeposit ? "아래 가상계좌로 입금기한 안에 입금해 주세요. 입금이 확인되면 주문이 처리됩니다." : "주문해 주셔서 감사합니다. 아래 결제 내용을 확인해 주세요." }}</p>
          <dl class="mx-auto mb-8 max-w-xl overflow-hidden rounded-xl border border-[#e5e7eb] bg-white text-left text-[0.9rem]">
            <div v-for="r in payRows" :key="r.label" class="flex items-baseline justify-between gap-4 border-b border-[#f0f0f0] px-5 py-3 last:border-b-0">
              <dt class="shrink-0 text-gray-500">{{ r.label }}</dt>
              <dd class="m-0 min-w-0 break-all text-right font-semibold text-gray-800" :class="r.strong ? 'text-[1.05rem] !text-[#bc8246]' : ''">{{ r.value }}</dd>
            </div>
          </dl>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a v-if="pay?.receipt?.url" :href="pay.receipt.url" target="_blank" rel="noopener" class="os-btn">영수증 보기</a>
            <nuxt-link class="os-btn" to="/my/order">주문 내역</nuxt-link>
            <nuxt-link class="os-btn os-btn-black" to="/">쇼핑 계속하기</nuxt-link>
          </div>
        </template>
        <template v-else>
          <h2 class="text-2xl font-bold text-red-600 mb-4">결제 확인 실패</h2>
          <p class="text-gray-600 mb-8">{{ errorMessage }}</p>
          <nuxt-link class="os-btn os-btn-black" to="/checkout">결제 페이지로</nuxt-link>
        </template>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { usePrice } from "~/composables/usePrice";
import { paymentSvc } from "~/svc/co/payments/paymentSvc";
import { foOrderSvc } from "~/svc/fo/ec/order/foOrderSvc";
import { useCartStore } from "~/store/useCartStore";
import { useAuthStore } from "~/store/useAuthStore";
import type { OdPayConfirmResType } from "~/types/od/odPayConfirmResType";

const cartStore = useCartStore();

const route = useRoute();
const { formatPrice } = usePrice();

const status = ref<"loading" | "success" | "fail">("loading");
const orderId = ref("");
const amount = ref(0);
const pay = ref<OdPayConfirmResType | null>(null); // 토스 결제 승인 결과 — 결제완료 화면에 보여준다
const errorMessage = ref("");

const paymentKey = route.query.paymentKey as string;
const orderIdQuery = route.query.orderId as string;
const amountQuery = route.query.amount as string;

onMounted(async () => {
  // 토스에서 돌아오면 전체 새로고침이라 스토어에 토큰이 없다 — app.vue 의 복원보다 이 화면 마운트가 먼저라 여기서 직접 복원한다(없으면 주문 생성이 401)
  useAuthStore().loadStToken();
  if (!paymentKey || !orderIdQuery || !amountQuery) {
    status.value = "fail";
    errorMessage.value = "결제 정보가 없습니다.";
    return;
  }
  orderId.value = orderIdQuery;
  amount.value = Number(amountQuery) || 0;

  // 2026-09(요청사항: "결제→재고 순서 역전 문제") — Toss는 이 successUrl 리다이렉트 시점엔
  // 아직 결제가 확정(과금)되지 않은 "승인 대기" 상태다. 실제 과금은 아래 confirmPayment()가
  // /v1/payments/confirm 을 호출하는 순간 일어난다. 그래서 재고 확인/차감(createOrder)을
  // confirmPayment보다 먼저 실행해, 재고가 없으면 confirmPayment 자체를 호출하지 않는다 —
  // 이러면 재고 부족 상품에 대해 고객에게 과금되는 일 자체가 없어진다(기존엔 결제 먼저 확정한
  // 뒤 주문 생성에서 재고부족이 나도 이미 돈은 빠져나간 상태였음).
  // 잔여 리스크: createOrder 성공 후 confirmPayment 가 실패하면(네트워크 등) 재고만 차감되고
  // 결제는 안 잡힌 주문이 PENDING 상태로 남는다 — 자동 롤백은 후속 과제, 현재는 안내만 한다.
  try {
    const items = cartStore.cartProducts.map((p) => ({
      prodId: p.prodId,
      prodSkuId: p.selectedProdSkuId,
      prodNm: p.prodNm,
      unitPrice: p.salePrice,
      orderQty: p.orderQuantity ?? 1,
    }));
    if (!items.length) {
      status.value = "fail";
      errorMessage.value = "주문할 상품 정보가 없습니다. 결제는 청구되지 않았습니다.";
      return;
    }

    // 결제 화면에서 저장해 둔 적용 쿠폰/상품합계
    let ctx: { couponId?: string; totalAmt?: number } = {};
    try {
      ctx = JSON.parse(sessionStorage.getItem("checkout_ctx") ?? "{}");
    } catch {
      /* 무시 */
    }
    await foOrderSvc.createOrder({ payAmt: amount.value, totalAmt: ctx.totalAmt ?? amount.value, couponId: ctx.couponId, items });

    pay.value = await paymentSvc.confirmPayment({ paymentKey, orderId: orderIdQuery, amount: amount.value, keyType: "pay" });
    status.value = "success";
    try {
      sessionStorage.removeItem("checkout_ctx");
    } catch {
      /* 무시 */
    }
    cartStore.cartProducts = [];
    if (process.client) localStorage.setItem("cart_products", JSON.stringify([]));
  } catch (e: unknown) {
    status.value = "fail";
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMessage.value = err?.data?.statusMessage ?? err?.statusMessage ?? "주문 처리에 실패했습니다. 결제는 청구되지 않았습니다.";
  }
});

const BANKS: Record<string, string> = { "02": "산업", "03": "기업", "04": "국민", "07": "수협", "11": "농협", "20": "우리", "23": "SC제일", "27": "씨티", "31": "대구", "32": "부산", "34": "광주", "35": "제주", "37": "전북", "39": "경남", "45": "새마을금고", "48": "신협", "71": "우체국", "81": "하나", "88": "신한", "89": "케이뱅크", "90": "카카오뱅크", "92": "토스뱅크" };
/** 가상계좌 결제는 승인 시점에 "입금 대기" 상태다 — 입금이 확인되면 주문이 처리된다 */
const waitingDeposit = computed(() => pay.value?.status === "WAITING_FOR_DEPOSIT");
const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("ko-KR", { hour12: false }) : "");

/** 결제완료 화면에 보여줄 결제 내용 (토스 승인 응답 기준, 값이 있는 것만) */
const payRows = computed(() => {
  const p = pay.value;
  const method = [p?.method, p?.easyPay?.provider].filter(Boolean).join(" · ");
  const card = p?.card?.number ? `${p.card.number}${p.card.installmentPlanMonths ? ` (${p.card.installmentPlanMonths}개월 할부)` : " (일시불)"}` : "";
  const rows = [
    { label: "주문번호", value: p?.orderId || orderId.value, strong: false },
    { label: "거래번호", value: p?.lastTransactionKey ?? "", strong: false },
    { label: "결제키", value: p?.paymentKey || paymentKey, strong: false },
    { label: "주문명", value: p?.orderName ?? "", strong: false },
    { label: "결제수단", value: method, strong: false },
    { label: "카드", value: card, strong: false },
    { label: "승인번호", value: p?.card?.approveNo ?? "", strong: false },
    { label: "결제 상태", value: p?.status === "DONE" ? "결제 완료" : p?.status === "WAITING_FOR_DEPOSIT" ? "입금 대기" : (p?.status ?? ""), strong: false },
    { label: "입금 은행", value: p?.virtualAccount?.bankCode ? `${BANKS[p.virtualAccount.bankCode] ?? p.virtualAccount.bankCode}은행` : "", strong: false },
    { label: "입금 계좌번호", value: p?.virtualAccount?.accountNumber ?? "", strong: true },
    { label: "예금주", value: p?.virtualAccount?.customerName ?? "", strong: false },
    { label: "입금 기한", value: fmtDateTime(p?.virtualAccount?.dueDate), strong: false },
    { label: "응답코드", value: p?.failure?.code ?? (p?.status ? `${p.status} (정상)` : ""), strong: false },
    { label: "거래시간", value: fmtDateTime(p?.approvedAt || p?.requestedAt), strong: false },
    { label: "결제 금액", value: formatPrice(p?.totalAmount ?? amount.value), strong: true },
  ];
  return rows.filter((r) => r.value);
});

useHead({ title: "결제 완료" });
</script>
