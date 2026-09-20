<template>
  <layout :transparent="true">
    <breadcrumb-area title="결제 완료" subtitle="결제 완료" />
    <section class="checkout-area pb-70">
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <template v-if="status === 'loading'">
          <p class="text-gray-600">결제를 확인하고 있습니다...</p>
        </template>
        <template v-else-if="status === 'success'">
          <h2 class="text-2xl font-bold text-green-700 mb-4">결제가 완료되었습니다</h2>
          <p class="text-gray-600 mb-2">주문번호: {{ orderId }}</p>
          <p class="text-gray-600 mb-8">결제 금액: {{ formatPrice(amount) }}</p>
          <nuxt-link class="os-btn os-btn-black" to="/">쇼핑 계속하기</nuxt-link>
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

const cartStore = useCartStore();

const route = useRoute();
const { formatPrice } = usePrice();

const status = ref<"loading" | "success" | "fail">("loading");
const orderId = ref("");
const amount = ref(0);
const errorMessage = ref("");

const paymentKey = route.query.paymentKey as string;
const orderIdQuery = route.query.orderId as string;
const amountQuery = route.query.amount as string;

onMounted(async () => {
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

    await foOrderSvc.createOrder({ payAmt: amount.value, totalAmt: amount.value, items });

    await paymentSvc.confirmPayment({ paymentKey, orderId: orderIdQuery, amount: amount.value });
    status.value = "success";
    cartStore.cartProducts = [];
    if (process.client) localStorage.setItem("cart_products", JSON.stringify([]));
  } catch (e: unknown) {
    status.value = "fail";
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMessage.value = err?.data?.statusMessage ?? err?.statusMessage ?? "주문 처리에 실패했습니다. 결제는 청구되지 않았습니다.";
  }
});

useHead({ title: "결제 완료" });
</script>
