<template>
  <!-- 2026-09-19(요청사항: "ecFeBo pages/fo/my/MyOrder.js 처럼 app/pages/my 아래 페이지") — 마이페이지 > 주문 (/my/order).
       ecFeBo MyOrder.js 이식. 기간 + 주문상태 서버 페이징, 행 클릭 시 상품/결제/배송 펼침. 목록은 <fo-grid>. -->
  <my-page-frame tab="order" :my="my" :file-path="currentFilePath" empty-text="주문 내역이 없습니다.">
    <template #top>
      <div class="flex flex-wrap items-center gap-1 px-3.5 py-2.5 mb-4 bg-[#f4f6f8] rounded-lg text-[0.8rem]">
        <button type="button" class="px-3 py-1 rounded-full border-0 cursor-pointer font-bold" :class="orderStatus === '' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'" @click="setStatus('')">주문</button>
        <template v-for="s in ORDER_STEPS" :key="s.cd">
          <span class="text-gray-300">·</span>
          <button type="button" class="px-2 py-1 rounded-full border-0 bg-transparent cursor-pointer" :class="orderStatus === s.cd ? 'font-bold text-gray-900 underline' : 'text-gray-400'" @click="setStatus(s.cd)">{{ s.label }}</button>
        </template>
        <button type="button" class="ml-auto w-6 h-6 rounded-full border border-[#d1d5db] bg-white text-gray-500 text-[0.72rem] cursor-pointer" aria-label="주문 진행 안내" @click="helpOpen = true">?</button>
      </div>
    </template>

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="orderId" :row-click="(r) => my.toggle(r.orderId)" :is-expanded="(r) => my.openId === r.orderId" :loading="my.loading">
        <template #row-expand="{ row, colspan }">
          <td :colspan="colspan" class="!p-0 !border-b !border-[#f3f4f6]">
            <div class="px-4 pb-4 text-[0.85rem]">
              <!-- 진행 프로세스 -->
              <div v-if="ORDER_FLOW.includes(row.status) || row.status === '취소됨'" class="flex items-center gap-1 flex-wrap py-3 text-[0.75rem]">
                <template v-for="(f, si) in ORDER_FLOW" :key="f">
                  <span class="px-2.5 py-1 rounded-full font-semibold" :style="flowStyle(row.status, si)">{{ f === "완료" ? "구매확정" : f }}</span>
                  <span v-if="si < ORDER_FLOW.length - 1" class="text-gray-300">›</span>
                </template>
              </div>
              <!-- 상품 -->
              <div class="divide-y divide-[#f3f4f6]">
                <div v-for="(it, ix) in row.items" :key="ix" class="flex items-center gap-3 py-2.5">
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-gray-900 truncate">{{ it.prodNm }}</div>
                    <div class="text-[0.75rem] text-gray-400">{{ [it.color, it.size].filter(Boolean).join(" / ") }}<template v-if="it.color || it.size"> · </template>{{ it.qty }}개</div>
                  </div>
                  <div class="text-gray-700 whitespace-nowrap">{{ formatPrice(it.price * it.qty) }}</div>
                </div>
                <div v-if="!row.items.length" class="py-3 text-gray-400">주문 상품 정보가 없습니다.</div>
              </div>
              <!-- 결제/배송 -->
              <div class="mt-2 grid gap-1 text-[0.8rem] text-gray-500">
                <div v-for="(p, pi) in row.pays" :key="pi" class="flex justify-between"><span>{{ p.type }}<template v-if="p.datetime"> · {{ p.datetime }}</template></span><span class="font-semibold text-gray-800">{{ formatPrice(p.amount) }}</span></div>
                <div v-if="row.shippingFee" class="flex justify-between"><span>배송비</span><span>{{ formatPrice(row.shippingFee) }}</span></div>
                <div v-if="row.cashPaid" class="flex justify-between"><span>캐쉬 사용</span><span>-{{ formatPrice(row.cashPaid) }}</span></div>
                <div v-if="row.courier || row.trackingNo" class="flex justify-between"><span>택배</span><span class="font-semibold text-gray-800">{{ row.courier }} {{ row.trackingNo }}</span></div>
              </div>
            </div>
          </td>
        </template>
      </fo-grid>
    </div>

    <template #modal>
      <!-- 주문 진행 안내 모달 -->
      <Teleport to="body">
        <div v-if="helpOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/45" role="dialog" aria-modal="true" @click.self="helpOpen = false">
          <div class="relative w-full max-w-[460px] max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <button type="button" class="absolute top-3 right-3 p-1 text-gray-400 bg-transparent border-0 cursor-pointer" aria-label="닫기" @click="helpOpen = false"><i class="fal fa-times"></i></button>
            <h3 class="text-lg font-extrabold text-gray-900 mb-1">주문 진행 안내</h3>
            <p class="text-[0.8rem] text-gray-400 mb-4">주문 접수부터 구매확정까지 아래 순서로 진행됩니다.</p>
            <ol class="list-none m-0 p-0 grid gap-2.5">
              <li v-for="s in FLOW_HELP" :key="s.status" class="flex gap-3 p-3 rounded-lg bg-[#f9fafb]">
                <span class="text-xl">{{ s.icon }}</span>
                <div><div class="font-bold text-gray-900 text-[0.88rem]">{{ s.status }}</div><div class="text-[0.78rem] text-gray-500 leading-relaxed">{{ s.desc }}</div></div>
              </li>
            </ol>
          </div>
        </div>
      </Teleport>
    </template>
  </my-page-frame>
</template>

<script setup lang="ts">
import MyPageFrame from "~/components/my/MyPageFrame.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useMyList, kor, ymd } from "~/composables/useMyList";
import { myOrderSvc } from "~/svc/fo/my/myOrderSvc";
import type { MyRow } from "~/types/foMyType";
import type { FoGridColumn } from "~/types/foCompType";

const currentFilePath = useCurrentFilePath();
const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 주문" });
usePageTitle("마이페이지 - 주문");

const ORDER_STEPS = [
  { cd: "ORDER", label: "주문완료" },
  { cd: "PAID", label: "결제완료" },
  { cd: "PREPARING", label: "배송준비중" },
  { cd: "SHIPPING", label: "배송중" },
  { cd: "DELIVERED", label: "배송완료" },
  { cd: "COMPLT", label: "구매확정" },
];
const ORDER_FLOW = ["주문완료", "결제완료", "배송준비중", "배송중", "배송완료", "완료"];
const ORDER_STATUS_KOR: Record<string, string> = {
  ORDER: "주문완료", PAID: "결제완료", PREPARING: "배송준비중", SHIPPING: "배송중", SHIPPED: "배송완료", DELIVERED: "배송완료",
  COMPLT: "완료", COMPLETED: "완료", DONE: "완료", CANCEL: "취소됨", CANCELED: "취소됨", CANCELLED: "취소됨", EXCHANGE: "교환요청", RETURN: "반품요청",
};
const ORDER_STATUS_COLOR: Record<string, string> = {
  주문완료: "#3b82f6", 결제완료: "#8b5cf6", 배송준비중: "#f59e0b", 배송중: "#f97316", 배송완료: "#22c55e", 완료: "#6b7280", 교환요청: "#f59e0b", 반품요청: "#f97316", 취소됨: "#9ca3af",
};
const FLOW_HELP = [
  { icon: "📋", status: "주문완료", desc: "주문이 접수되었습니다. 계좌이체의 경우 입금 확인 후 다음 단계로 진행됩니다." },
  { icon: "💳", status: "결제완료", desc: "결제가 확인되었습니다. 이 단계까지는 주문 취소가 가능합니다." },
  { icon: "📦", status: "배송준비중", desc: "상품을 포장하고 있습니다. 이후에는 반품으로 처리해 주세요." },
  { icon: "🚚", status: "배송중", desc: "택배사에 인계되어 배송 중입니다. 송장번호로 배송을 조회할 수 있습니다." },
  { icon: "✅", status: "배송완료", desc: "상품이 도착했습니다. 교환·반품은 수령 후 정해진 기간 안에 가능합니다." },
  { icon: "🏁", status: "구매확정", desc: "구매가 확정되었습니다." },
];

const orderStatus = ref("");
const helpOpen = ref(false);

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptOrder)
function adapt(o: MyRow) {
    const dliv = Array.isArray(o.orderDlivs) && o.orderDlivs.length ? o.orderDlivs[0] : null;
    return {
      orderId: String(o.orderId),
      orderDate: ymd(o.orderDate),
      status: kor(o.orderStatusCdNm, o.orderStatusCd, ORDER_STATUS_KOR),
      totalPrice: Number(o.payAmt ?? o.totalAmt ?? 0),
      shippingFee: Number(o.shippingFee ?? 0),
      cashPaid: Number(o.saveUseAmt ?? 0),
      courier: dliv ? dliv.outboundCourierCdNm || dliv.outboundCourierCd || "" : "",
      trackingNo: dliv ? dliv.outboundTrackingNo || "" : "",
      items: (Array.isArray(o.orderItems) ? o.orderItems : []).map((it: MyRow) => ({ prodNm: it.prodNm, color: it.optItemNm1 || "", size: it.optItemNm2 || "", qty: Number(it.orderQty ?? 0), price: Number(it.unitPrice ?? 0) })),
      pays: (Array.isArray(o.orderPays) ? o.orderPays : []).map((p: MyRow) => ({ type: p.payMethodCdNm || p.payMethodCd || "결제", amount: Number(p.payAmt ?? 0), datetime: ymd(p.payDate) })),
    };
}

const my = useMyList({
  dateType: "order_date",
  loader: async (p) => {
    const r = await myOrderSvc.getPage(p);
    return { rows: (r.pageList ?? []).map(adapt), total: r.pageTotalCount ?? 0, totalPage: r.pageTotalPage || 1 };
  },
  extra: () => (orderStatus.value ? { orderStatusCd: orderStatus.value } : {}),
});

const columns: FoGridColumn[] = [
  { key: "orderId", label: "주문번호", width: "200px", mono: true, align: "left", cellStyle: "font-weight:700;color:#111827" },
  { key: "orderDate", label: "주문일", width: "120px" },
  { key: "status", label: "상태", width: "110px", align: "center", badge: (r) => ORDER_STATUS_COLOR[r.status] || "#9ca3af" },
  { key: "totalPrice", label: "결제금액", align: "right", fmt: (v) => formatPrice(Number(v)), cellStyle: "font-weight:800;color:#111827" },
];

function setStatus(cd: string) {
  orderStatus.value = cd;
  my.search();
}
function flowStyle(status: string, si: number) {
  const done = status !== "취소됨" && ORDER_FLOW.indexOf(status) >= si;
  return { background: status === "취소됨" ? "#e5e7eb" : done ? "#dcfce7" : "#f3f4f6", color: status === "취소됨" ? "#9ca3af" : done ? "#15803d" : "#9ca3af" };
}
</script>
