<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="마이페이지" subtitle="마이페이지" />

    <!-- 2026-09-19(요청사항: "주문 / 취소·반품·교환 / 쿠폰 / 캐쉬 / 문의 / 채팅 도 ecFeFoNuxt4 에 만들어주고, 특정영역별 컴포넌트로 분리 안해도 되") —
         ecFeBo(pages/fo/my/My*.js + foMyStore) 이식. 6개 탭을 이 파일 하나에 두고 /my/order · claim · coupon · cache · contact · chatt 로 접근한다.
         로그인 필요(FO_ONLY) — 비로그인이면 로그인 화면으로 보낸다. 목록은 전부 서버 페이징(기간 + 탭별 필터). -->
    <section class="pt-14 pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 탭 -->
        <nav class="flex flex-wrap gap-1 p-1.5 mb-5 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]" aria-label="마이페이지 메뉴">
          <nuxt-link
            v-for="t in TABS"
            :key="t.key"
            :to="`/my/${t.key}`"
            class="flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[0.9rem] font-semibold no-underline transition-colors"
            :class="tab === t.key ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-[#f5f5f5]'"
          >
            <span>{{ t.icon }}</span>{{ t.label }}
          </nuxt-link>
        </nav>

        <!-- 기간 조회 -->
        <div class="flex flex-wrap items-center gap-2 px-4 py-3 mb-4 bg-white border border-[#e5e7eb] rounded-lg">
          <span class="text-[0.85rem] text-gray-500 mr-1">등록기간</span>
          <input v-model="dateStart" type="date" class="my-in" aria-label="시작일" />
          <span class="text-gray-400">~</span>
          <input v-model="dateEnd" type="date" class="my-in" aria-label="종료일" />
          <select v-model="preset" class="my-in cursor-pointer" aria-label="기간 선택" @change="applyPreset">
            <option v-for="p in PRESETS" :key="p.months" :value="p.months">{{ p.label }}</option>
          </select>
          <button type="button" class="h-10 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.85rem] font-semibold cursor-pointer" @click="search">조회</button>
          <button type="button" class="h-10 px-4 bg-white text-gray-600 border border-[#e5e7eb] rounded-md text-[0.85rem] font-medium cursor-pointer" @click="resetSearch">초기화</button>
        </div>

        <!-- ═══ 주문 ═══ -->
        <template v-if="tab === 'order'">
          <div class="flex flex-wrap items-center gap-1 px-3.5 py-2.5 mb-4 bg-[#f4f6f8] rounded-lg text-[0.8rem]">
            <button type="button" class="px-3 py-1 rounded-full border-0 cursor-pointer font-bold" :class="orderStatus === '' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'" @click="setOrderStatus('')">주문</button>
            <template v-for="s in ORDER_STEPS" :key="s.cd">
              <span class="text-gray-300">·</span>
              <button type="button" class="px-2 py-1 rounded-full border-0 bg-transparent cursor-pointer" :class="orderStatus === s.cd ? 'font-bold text-gray-900 underline' : 'text-gray-400'" @click="setOrderStatus(s.cd)">{{ s.label }}</button>
            </template>
            <button type="button" class="ml-auto w-6 h-6 rounded-full border border-[#d1d5db] bg-white text-gray-500 text-[0.72rem] cursor-pointer" aria-label="주문 진행 안내" @click="helpOpen = true">?</button>
          </div>
        </template>

        <!-- ═══ 취소/반품/교환 : 유형 필터 ═══ -->
        <div v-if="tab === 'claim'" class="flex flex-wrap gap-2 mb-4">
          <button v-for="c in CLAIM_FILTERS" :key="c.key" type="button" class="px-4 py-2 rounded-full border-2 text-[0.85rem] font-semibold cursor-pointer" :class="claimType === c.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-[#e5e7eb]'" @click="setClaimType(c.key)">
            {{ c.label }} <span class="opacity-70 font-normal">({{ claimCounts[c.key] ?? 0 }})</span>
          </button>
        </div>

        <!-- ═══ 쿠폰 : 등록 + 사용여부 탭 ═══ -->
        <template v-if="tab === 'coupon'">
          <form class="flex gap-2 p-4 mb-4 bg-white border border-[#e5e7eb] rounded-lg" @submit.prevent="notReady('쿠폰 코드 등록')">
            <input v-model="couponCode" class="my-in flex-1" placeholder="쿠폰 코드 입력 (예: SPRING5000)" />
            <button type="submit" class="h-10 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.85rem] font-bold cursor-pointer">쿠폰 등록</button>
          </form>
          <div class="flex border-b border-[#e5e7eb] mb-2">
            <button v-for="c in COUPON_TABS" :key="c.key" type="button" class="px-6 py-3 bg-transparent border-0 border-b-2 -mb-px cursor-pointer text-[0.88rem]" :class="couponTab === c.key ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-400'" @click="couponTab = c.key">
              {{ c.label }} <span class="font-normal">({{ couponCount(c.key) }})</span>
            </button>
          </div>
        </template>

        <!-- ═══ 캐쉬 : 잔액 + 충전 ═══ -->
        <template v-if="tab === 'cache'">
          <div class="rounded-xl px-6 py-5 mb-4 text-gray-900" style="background: linear-gradient(135deg, #fbbf24, #f59e0b)">
            <div class="text-[0.85rem] font-semibold opacity-80">보유 캐쉬</div>
            <div class="text-[2rem] font-black mt-1">{{ formatPrice(cashBalance) }}</div>
          </div>
          <form class="flex gap-2 p-4 mb-2 bg-white border border-[#e5e7eb] rounded-lg" @submit.prevent="notReady('캐쉬 충전')">
            <input v-model="chargeAmount" class="my-in flex-1" inputmode="numeric" placeholder="충전 금액 입력 (최소 1,000원)" />
            <button type="submit" class="h-10 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.85rem] font-bold cursor-pointer">충전하기</button>
          </form>
          <div class="flex flex-wrap gap-2 mb-4">
            <button v-for="a in [5000, 10000, 30000, 50000]" :key="a" type="button" class="px-4 py-2 rounded-full border border-[#e5e7eb] bg-white text-[0.82rem] font-semibold text-gray-700 cursor-pointer hover:border-gray-400" @click="chargeAmount = String(Number(chargeAmount || 0) + a)">+{{ a.toLocaleString() }}원</button>
          </div>
        </template>

        <!-- 총건수 + 페이지 크기 -->
        <div class="flex items-center justify-between my-3.5 text-[0.88rem] text-gray-600">
          <span>총 <b class="text-gray-900">{{ tab === "coupon" ? shownRows.length : total }}</b>건</span>
          <select v-model.number="pageSize" class="my-in cursor-pointer" aria-label="페이지 크기" @change="changePageSize">
            <option v-for="s in [10, 20, 50, 100]" :key="s" :value="s">{{ s }}개씩</option>
          </select>
        </div>

        <!-- 로딩/오류/빈 상태 -->
        <div v-if="loading && !rows.length" class="py-16 text-center text-gray-400">불러오는 중...</div>
        <div v-else-if="errorMsg" class="py-16 text-center text-red-500">{{ errorMsg }}</div>
        <div v-else-if="!shownRows.length" class="py-16 text-center text-gray-400 text-[1rem]">
          {{ EMPTY[tab] }}
          <div v-if="tab === 'contact'" class="mt-4"><nuxt-link to="/contact" class="os-btn os-btn-black os-btn-3 inline-block">1:1 문의하기</nuxt-link></div>
        </div>

        <!-- ═══ 목록 ═══ -->
        <ul v-else class="list-none m-0 p-0 flex flex-col gap-3">
          <!-- 주문 -->
          <template v-if="tab === 'order'">
            <li v-for="o in orderRows" :key="o.orderId" class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
              <button type="button" class="w-full flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 bg-transparent border-0 text-left cursor-pointer" :aria-expanded="openId === o.orderId" @click="toggle(o.orderId)">
                <span class="font-bold text-gray-900 text-[0.92rem]">{{ o.orderId }}</span>
                <span class="text-[0.8rem] text-gray-400">{{ o.orderDate }}</span>
                <span class="px-2 py-0.5 rounded text-[0.72rem] font-bold text-white" :style="{ background: orderColor(o.status) }">{{ o.status }}</span>
                <span class="ml-auto font-black text-gray-900">{{ formatPrice(o.totalPrice) }}</span>
                <span class="text-[0.7rem] text-gray-400 transition-transform" :class="{ 'rotate-180': openId === o.orderId }">▼</span>
              </button>
              <div v-if="openId === o.orderId" class="px-4 pb-4 border-t border-[#f3f4f6] text-[0.85rem]">
                <!-- 진행 프로세스 -->
                <div v-if="ORDER_FLOW.includes(o.status) || o.status === '취소됨'" class="flex items-center gap-1 flex-wrap py-3 text-[0.75rem]">
                  <template v-for="(f, si) in ORDER_FLOW" :key="f">
                    <span class="px-2.5 py-1 rounded-full font-semibold" :style="{ background: o.status === '취소됨' ? '#e5e7eb' : ORDER_FLOW.indexOf(o.status) >= si ? '#dcfce7' : '#f3f4f6', color: o.status === '취소됨' ? '#9ca3af' : ORDER_FLOW.indexOf(o.status) >= si ? '#15803d' : '#9ca3af' }">{{ f === "완료" ? "구매확정" : f }}</span>
                    <span v-if="si < ORDER_FLOW.length - 1" class="text-gray-300">›</span>
                  </template>
                </div>
                <!-- 상품 -->
                <div class="divide-y divide-[#f3f4f6]">
                  <div v-for="(it, ix) in o.items" :key="ix" class="flex items-center gap-3 py-2.5">
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-gray-900 truncate">{{ it.prodNm }}</div>
                      <div class="text-[0.75rem] text-gray-400">{{ [it.color, it.size].filter(Boolean).join(" / ") }}<template v-if="it.color || it.size"> · </template>{{ it.qty }}개</div>
                    </div>
                    <div class="text-gray-700 whitespace-nowrap">{{ formatPrice(it.price * it.qty) }}</div>
                  </div>
                  <div v-if="!o.items.length" class="py-3 text-gray-400">주문 상품 정보가 없습니다.</div>
                </div>
                <!-- 결제/배송 -->
                <div class="mt-2 grid gap-1 text-[0.8rem] text-gray-500">
                  <div v-for="(p, pi) in o.pays" :key="pi" class="flex justify-between"><span>{{ p.type }}<template v-if="p.datetime"> · {{ p.datetime }}</template></span><span class="font-semibold text-gray-800">{{ formatPrice(p.amount) }}</span></div>
                  <div v-if="o.shippingFee" class="flex justify-between"><span>배송비</span><span>{{ formatPrice(o.shippingFee) }}</span></div>
                  <div v-if="o.cashPaid" class="flex justify-between"><span>캐쉬 사용</span><span>-{{ formatPrice(o.cashPaid) }}</span></div>
                  <div v-if="o.courier || o.trackingNo" class="flex justify-between"><span>택배</span><span class="font-semibold text-gray-800">{{ o.courier }} {{ o.trackingNo }}</span></div>
                </div>
              </div>
            </li>
          </template>

          <!-- 취소/반품/교환 -->
          <template v-else-if="tab === 'claim'">
            <li v-for="c in claimRows" :key="c.claimId" class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
              <button type="button" class="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5 bg-transparent border-0 text-left cursor-pointer" :aria-expanded="openId === c.claimId" @click="toggle(c.claimId)">
                <span class="px-2 py-0.5 rounded text-[0.72rem] font-bold text-white" :style="{ background: CLAIM_TYPE_COLOR[c.type] || '#6b7280' }">{{ c.type }}</span>
                <span class="px-2 py-0.5 rounded text-[0.72rem] font-bold text-white" :style="{ background: CLAIM_STATUS_COLOR[c.status] || '#9ca3af' }">{{ c.status }}</span>
                <span class="text-[0.85rem] font-semibold text-gray-900">{{ c.claimId }}</span>
                <span class="text-[0.78rem] text-gray-400">주문 {{ c.orderId }} · 신청 {{ c.requestDate }}</span>
                <span v-if="c.refundAmount" class="ml-auto font-black text-gray-900">{{ formatPrice(c.refundAmount) }}</span>
              </button>
              <div v-if="openId === c.claimId" class="px-4 pb-4 pt-1 border-t border-[#f3f4f6] text-[0.83rem] text-gray-600 grid gap-1">
                <div v-if="c.reason">사유: <b class="text-gray-800">{{ c.reason }}</b><template v-if="c.reasonDetail"> — {{ c.reasonDetail }}</template></div>
                <div v-if="c.completeDate">처리일: {{ c.completeDate }}</div>
                <div v-if="c.refundMethod">환불수단: {{ c.refundMethod }}</div>
                <div v-if="c.courier || c.trackingNo">수거 택배: {{ c.courier }} {{ c.trackingNo }}</div>
              </div>
            </li>
          </template>

          <!-- 쿠폰 -->
          <template v-else-if="tab === 'coupon'">
            <li v-for="c in couponRows" :key="c.couponId" class="flex items-center gap-4 px-4 py-3.5 bg-white border border-[#e5e7eb] rounded-lg" :class="{ 'opacity-50': c.used }">
              <div class="w-24 shrink-0 text-center py-2 rounded-md bg-[#fdf6ee] text-theme font-black text-[0.95rem]">{{ discountLabel(c) }}</div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-900 truncate">{{ c.name }}</div>
                <div class="text-[0.78rem] text-gray-400">
                  <template v-if="c.minOrder">{{ formatPrice(c.minOrder) }} 이상 구매 시 · </template><template v-if="c.expiry">~ {{ c.expiry }}</template>
                  <template v-if="c.applicableTo"> · {{ c.applicableTo }}</template>
                </div>
              </div>
              <span v-if="c.code" class="text-[0.72rem] text-gray-400 font-mono">{{ c.code }}</span>
            </li>
          </template>

          <!-- 캐쉬 -->
          <template v-else-if="tab === 'cache'">
            <li v-for="h in cashRows" :key="h.cashId" class="flex items-center gap-3 px-4 py-3 bg-white border border-[#e5e7eb] rounded-lg">
              <span class="px-2 py-0.5 rounded text-[0.72rem] font-bold" :class="h.amount >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'">{{ h.type || (h.amount >= 0 ? "적립" : "사용") }}</span>
              <div class="flex-1 min-w-0"><div class="text-[0.85rem] text-gray-800 truncate">{{ h.desc || "-" }}</div><div class="text-[0.75rem] text-gray-400">{{ h.date }}</div></div>
              <div class="text-right"><div class="font-black" :class="h.amount >= 0 ? 'text-blue-600' : 'text-red-500'">{{ h.amount >= 0 ? "+" : "" }}{{ formatPrice(h.amount) }}</div><div class="text-[0.72rem] text-gray-400">잔액 {{ formatPrice(h.balance) }}</div></div>
            </li>
          </template>

          <!-- 문의 -->
          <template v-else-if="tab === 'contact'">
            <li v-for="q in contactRows" :key="q.inquiryId" class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
              <button type="button" class="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5 bg-transparent border-0 text-left cursor-pointer" :aria-expanded="openId === q.inquiryId" @click="toggle(q.inquiryId)">
                <span class="px-2 py-0.5 rounded text-[0.72rem] font-bold text-white" :style="{ background: CONTACT_COLOR[q.status] || '#9ca3af' }">{{ q.status }}</span>
                <span class="font-semibold text-gray-900 text-[0.9rem]">{{ q.title }}</span>
                <span v-if="q.category" class="text-[0.75rem] text-gray-400">[{{ q.category }}]</span>
                <span class="ml-auto text-[0.78rem] text-gray-400">{{ q.date }}</span>
              </button>
              <div v-if="openId === q.inquiryId" class="px-4 pb-4 pt-2 border-t border-[#f3f4f6] text-[0.85rem]">
                <div class="whitespace-pre-line text-gray-700 leading-relaxed">{{ q.content }}</div>
                <div v-if="q.answer" class="mt-3 p-3 bg-[#f9fafb] rounded-md text-gray-700 leading-relaxed whitespace-pre-line"><b class="text-gray-900">답변</b><br />{{ q.answer }}</div>
              </div>
            </li>
          </template>

          <!-- 채팅 -->
          <template v-else-if="tab === 'chatt'">
            <li v-for="c in chatRows" :key="c.chatId" class="flex items-center gap-3 px-4 py-3.5 bg-white border border-[#e5e7eb] rounded-lg">
              <span class="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center text-gray-400"><i class="fas fa-comment-dots"></i></span>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-900 truncate">{{ c.subject || "채팅 상담" }} <span class="ml-1 px-2 py-0.5 rounded text-[0.7rem] font-bold" :class="c.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ c.status }}</span></div>
                <div class="text-[0.78rem] text-gray-400 truncate">{{ c.lastMsg || "새 채팅" }}</div>
              </div>
              <span class="text-[0.78rem] text-gray-400 whitespace-nowrap">{{ c.date }}</span>
            </li>
          </template>
        </ul>
        <p v-if="tab === 'chatt' && rows.length" class="mt-3 text-[0.78rem] text-gray-400">채팅 상담은 화면 우측 하단의 채팅 버튼에서 이어서 진행할 수 있습니다.</p>

        <!-- 페이지네이션 -->
        <div v-if="pageTotalPage > 1" class="flex flex-wrap items-center justify-center gap-1.5 mt-8">
          <button type="button" class="pg-btn" :disabled="pageNo <= 1" aria-label="이전" @click="goPage(pageNo - 1)">‹</button>
          <button v-for="n in pageNumbers" :key="n" type="button" class="pg-btn" :class="{ 'pg-on': n === pageNo }" @click="goPage(n)">{{ n }}</button>
          <button type="button" class="pg-btn" :disabled="pageNo >= pageTotalPage" aria-label="다음" @click="goPage(pageNo + 1)">›</button>
        </div>
      </div>
    </section>

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
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { myOrderSvc } from "~/svc/fo/my/myOrderSvc";
import { myClaimSvc } from "~/svc/fo/my/myClaimSvc";
import { myCouponSvc } from "~/svc/fo/my/myCouponSvc";
import { myCashSvc } from "~/svc/fo/my/myCashSvc";
import { myInquirySvc } from "~/svc/fo/my/myInquirySvc";
import { myChatSvc } from "~/svc/fo/my/myChatSvc";
import type { MyListParams, MyPageResult, MyRow } from "~/types/foMyType";
import { useAuthStore } from "~/store/useAuthStore";
import { usePageTitle } from "~/composables/usePageTitle";

const TABS = [
  { key: "order", label: "주문", icon: "📦" },
  { key: "claim", label: "취소/반품/교환", icon: "↩️" },
  { key: "coupon", label: "쿠폰", icon: "🎟️" },
  { key: "cache", label: "캐쉬", icon: "💰" },
  { key: "contact", label: "문의", icon: "📩" },
  { key: "chatt", label: "채팅", icon: "💬" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { formatPrice } = usePrice();

const tab = computed<TabKey>(() => (TABS.some((t) => t.key === route.params.tab) ? (route.params.tab as TabKey) : "order"));
useHead({ title: "마이페이지" });
usePageTitle("마이페이지");

// ── 상수 (ecFeBo foConsts 와 동일) ──────────────────────────────────────
const EMPTY: Record<TabKey, string> = {
  order: "주문 내역이 없습니다.",
  claim: "해당 내역이 없습니다.",
  coupon: "사용 가능한 쿠폰이 없습니다.",
  cache: "캐쉬 내역이 없습니다.",
  contact: "문의 내역이 없습니다.",
  chatt: "채팅 내역이 없습니다.",
};
const PRESETS = [
  { months: 1, label: "1달" },
  { months: 3, label: "3달" },
  { months: 6, label: "6달" },
  { months: 12, label: "1년" },
];
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
const orderColor = (s: string) => ORDER_STATUS_COLOR[s] || "#9ca3af";
const CLAIM_FILTERS = [
  { key: "", label: "전체" },
  { key: "CANCEL", label: "취소" },
  { key: "RETURN", label: "반품" },
  { key: "EXCHANGE", label: "교환" },
];
const CLAIM_TYPE_KOR: Record<string, string> = { CANCEL: "취소", RETURN: "반품", EXCHANGE: "교환" };
const CLAIM_TYPE_COLOR: Record<string, string> = { 취소: "#ef4444", 반품: "#f97316", 교환: "#3b82f6" };
const CLAIM_STATUS_COLOR: Record<string, string> = {
  취소요청: "#ef4444", 취소처리중: "#f97316", 취소완료: "#9ca3af", 반품요청: "#ef4444", 수거예정: "#f59e0b", 수거중: "#fb923c",
  검수중: "#8b5cf6", 환불대기: "#f97316", 환불완료: "#9ca3af", 교환요청: "#3b82f6", 교환완료: "#9ca3af",
};
const CONTACT_STATUS_KOR: Record<string, string> = { REQUEST: "요청", REQUESTED: "요청", PROCESSING: "처리중", COMPLETE: "답변완료", CANCEL: "취소됨" };
const CONTACT_COLOR: Record<string, string> = { 요청: "#3b82f6", 처리중: "#f97316", 답변완료: "#22c55e", 취소됨: "#9ca3af" };
const COUPON_TABS = [
  { key: "unused", label: "미사용" },
  { key: "used", label: "사용" },
] as const;
const FLOW_HELP = [
  { icon: "📋", status: "주문완료", desc: "주문이 접수되었습니다. 계좌이체의 경우 입금 확인 후 다음 단계로 진행됩니다." },
  { icon: "💳", status: "결제완료", desc: "결제가 확인되었습니다. 이 단계까지는 주문 취소가 가능합니다." },
  { icon: "📦", status: "배송준비중", desc: "상품을 포장하고 있습니다. 이후에는 반품으로 처리해 주세요." },
  { icon: "🚚", status: "배송중", desc: "택배사에 인계되어 배송 중입니다. 송장번호로 배송을 조회할 수 있습니다." },
  { icon: "✅", status: "배송완료", desc: "상품이 도착했습니다. 교환·반품은 수령 후 정해진 기간 안에 가능합니다." },
  { icon: "🏁", status: "구매확정", desc: "구매가 확정되었습니다." },
];

// ── 조회 조건 ───────────────────────────────────────────────────────────
const fmtYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function rangeOf(months: number) {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return { start: fmtYmd(start), end: fmtYmd(end) };
}
const init = rangeOf(6);
const dateStart = ref(init.start);
const dateEnd = ref(init.end);
const preset = ref(6);
const pageNo = ref(1);
const pageSize = ref(50);
const pageTotalPage = ref(1);
const total = ref(0);
const rows = ref<MyRow[]>([]);
const cashBalance = ref(0);
const loading = ref(false);
const errorMsg = ref("");
const openId = ref<string | null>(null);
const helpOpen = ref(false);
const orderStatus = ref("");
const claimType = ref("");
const claimCounts = ref<Record<string, number>>({});
const couponTab = ref<"unused" | "used">("unused");
const couponCode = ref("");
const chargeAmount = ref("");

// ── 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adapt* 와 동일 규칙) ────────────────────
const ymd = (v: unknown) => (v ? String(v).slice(0, 10) : "");
const kor = (nm: unknown, cd: unknown, map: Record<string, string>) => (nm && /[가-힣]/.test(String(nm)) ? String(nm) : map[String(cd ?? "").toUpperCase()] || String(nm || cd || ""));

const orderRows = computed(() =>
  rows.value.map((o) => {
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
  })
);
const claimRows = computed(() =>
  rows.value.map((c) => {
    const tnm = String(c.claimTypeCdNm ?? "");
    return {
      claimId: String(c.claimId),
      orderId: String(c.orderId ?? ""),
      type: /[가-힣]/.test(tnm) ? (tnm.includes("취소") ? "취소" : tnm.includes("반품") ? "반품" : tnm.includes("교환") ? "교환" : tnm) : CLAIM_TYPE_KOR[String(c.claimTypeCd ?? "")] || String(c.claimTypeCd ?? ""),
      status: c.claimStatusCdNm && /[가-힣]/.test(String(c.claimStatusCdNm)) ? String(c.claimStatusCdNm) : String(c.claimStatusCd ?? ""),
      requestDate: ymd(c.requestDate),
      completeDate: ymd(c.procDate),
      reason: String(c.reasonCd ?? ""),
      reasonDetail: String(c.reasonDetail ?? ""),
      refundAmount: Number(c.refundAmt ?? 0),
      refundMethod: String(c.refundMethodCdNm || c.refundMethodCd || ""),
      courier: String(c.returnCourierCdNm || c.returnCourierCd || ""),
      trackingNo: String(c.returnTrackingNo || ""),
    };
  })
);
function couponType(c: MyRow): "rate" | "amount" | "shipping" {
  const cd = String(c.couponTypeCd ?? "").toUpperCase();
  const nm = String(c.couponTypeCdNm ?? "");
  if (cd.includes("SHIP") || nm.includes("배송")) return "shipping";
  if (cd.includes("RATE") || cd.includes("PCT") || nm.includes("율") || nm.includes("%")) return "rate";
  if (cd.includes("AMT") || cd.includes("AMOUNT") || nm.includes("금액") || nm.includes("원")) return "amount";
  return Number(c.discountRate ?? 0) > 0 ? "rate" : "amount";
}
const couponAll = computed(() =>
  rows.value.map((c) => {
    const type = couponType(c);
    const status = String(c.couponStatusCd ?? "").toUpperCase();
    return {
      couponId: String(c.couponId),
      name: String(c.couponNm ?? ""),
      code: String(c.couponCd ?? ""),
      type,
      value: type === "rate" ? Number(c.discountRate ?? 0) : Number(c.discountAmt ?? 0),
      minOrder: Number(c.minOrderAmt ?? 0),
      expiry: ymd(c.validTo),
      applicableTo: String(c.targetTypeCdNm ?? ""),
      used: status.includes("USED") || status.includes("USE_DONE") || c.couponStatusCdNm === "사용완료",
    };
  })
);
const discountLabel = (c: { type: string; value: number }) => (c.type === "rate" ? `${c.value}% 할인` : c.type === "shipping" ? "무료배송" : `${c.value.toLocaleString()}원 할인`);
const couponRows = computed(() => couponAll.value.filter((c) => (couponTab.value === "used" ? c.used : !c.used)));
const couponCount = (k: string) => couponAll.value.filter((c) => (k === "used" ? c.used : !c.used)).length;
const cashRows = computed(() =>
  rows.value.map((h) => ({
    cashId: String(h.cacheId ?? h.cashId ?? ""),
    type: kor(h.cacheTypeCdNm, h.cacheTypeCd, {}),
    amount: Number(h.cacheAmt ?? h.amount ?? 0),
    balance: Number(h.balanceAmt ?? h.balance ?? 0),
    date: ymd(h.cacheDate ?? h.date),
    desc: String(h.cacheDesc ?? h.desc ?? ""),
  }))
);
const contactRows = computed(() =>
  rows.value.map((q) => ({
    inquiryId: String(q.contactId),
    category: String(q.categoryCd ?? ""),
    title: String(q.contactTitle ?? ""),
    content: String(q.contactContent ?? ""),
    status: kor(q.contactStatusCdNm, q.contactStatusCd, CONTACT_STATUS_KOR),
    date: ymd(q.contactDate),
    answer: String(q.contactAnswer ?? ""),
  }))
);
const chatRows = computed(() =>
  rows.value.map((c) => ({
    chatId: String(c.chattId ?? c.chattRoomId ?? ""),
    subject: String(c.subject ?? ""),
    status: kor(c.chattStatusCdNm, c.chattStatusCd, {}),
    date: ymd(c.lastMsgDate),
    lastMsg: typeof c.lastMsg === "string" ? c.lastMsg : String((c.lastMsg as MyRow | null)?.msgContent ?? (c.lastMsg as MyRow | null)?.chattMsg ?? ""),
  }))
);
const shownRows = computed<unknown[]>(() => {
  switch (tab.value) {
    case "order": return orderRows.value;
    case "claim": return claimRows.value;
    case "coupon": return couponRows.value;
    case "cache": return cashRows.value;
    case "contact": return contactRows.value;
    default: return chatRows.value;
  }
});

// ── 조회 ────────────────────────────────────────────────────────────────
// 탭별 서버 페이징 조회 (svc/fo/my/*Svc.ts — BFF /api/fo/my/{kind}/page)
const PAGE_LOADERS: Record<Exclude<TabKey, "cache">, (p: MyListParams) => Promise<MyPageResult<MyRow>>> = {
  order: myOrderSvc.getPage,
  claim: myClaimSvc.getPage,
  coupon: myCouponSvc.getPage,
  contact: myInquirySvc.getPage,
  chatt: myChatSvc.getPage,
};
const DATE_TYPE: Record<TabKey, string> = { order: "order_date", claim: "request_date", coupon: "reg_date", cache: "reg_date", contact: "reg_date", chatt: "reg_date" };
let reqSeq = 0;
async function load() {
  const seq = ++reqSeq;
  loading.value = true;
  errorMsg.value = "";
  openId.value = null;
  const params = {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    dateRangeType: DATE_TYPE[tab.value],
    dateRangeStart: dateStart.value,
    dateRangeEnd: dateEnd.value,
    ...(tab.value === "order" && orderStatus.value ? { orderStatusCd: orderStatus.value } : {}),
    ...(tab.value === "claim" && claimType.value ? { claimTypeCd: claimType.value } : {}),
  };
  try {
    if (tab.value === "cache") {
      const r = await myCashSvc.getPage(params);
      if (seq !== reqSeq) return;
      cashBalance.value = Number(r.balance ?? 0);
      rows.value = r.history?.pageList ?? [];
      total.value = r.history?.pageTotalCount ?? 0;
      pageTotalPage.value = r.history?.pageTotalPage || 1;
    } else {
      const r = await PAGE_LOADERS[tab.value as Exclude<TabKey, "cache">](params);
      if (seq !== reqSeq) return;
      rows.value = r.pageList ?? [];
      total.value = r.pageTotalCount ?? 0;
      pageTotalPage.value = r.pageTotalPage || 1;
    }
    // 취소/반품/교환 탭의 유형별 건수 배지 — 같은 기간으로 유형별 1건씩만 조회해 총건수만 사용
    if (tab.value === "claim") {
      const { pageNo: _p, pageSize: _s, claimTypeCd: _c, ...base } = params as Record<string, unknown>;
      Promise.all(CLAIM_FILTERS.map((f) => myClaimSvc.getPage({ ...(base as object), pageNo: 1, pageSize: 1, ...(f.key ? { claimTypeCd: f.key } : {}) } as MyListParams).then((r) => [f.key, r.pageTotalCount ?? 0] as const)))
        .then((arr) => {
          if (seq === reqSeq) claimCounts.value = Object.fromEntries(arr);
        })
        .catch(() => {});
    }
  } catch (e) {
    if (seq !== reqSeq) return;
    rows.value = [];
    total.value = 0;
    pageTotalPage.value = 1;
    const st = (e as { statusCode?: number; status?: number })?.statusCode ?? (e as { status?: number })?.status;
    if (st === 401) {
      authStore.setStLogout();
      await navigateTo("/login");
      return;
    }
    errorMsg.value = "목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    if (seq === reqSeq) loading.value = false;
  }
}

function search() {
  pageNo.value = 1;
  load();
}
function resetSearch() {
  const r = rangeOf(6);
  dateStart.value = r.start;
  dateEnd.value = r.end;
  preset.value = 6;
  orderStatus.value = "";
  claimType.value = "";
  search();
}
function applyPreset() {
  const r = rangeOf(preset.value);
  dateStart.value = r.start;
  dateEnd.value = r.end;
  search();
}
function setOrderStatus(cd: string) {
  orderStatus.value = cd;
  search();
}
function setClaimType(k: string) {
  claimType.value = k;
  search();
}
function goPage(n: number) {
  if (n < 1 || n > pageTotalPage.value || n === pageNo.value) return;
  pageNo.value = n;
  load();
}
function changePageSize() {
  pageNo.value = 1;
  load();
}
const pageNumbers = computed(() => {
  const t = pageTotalPage.value;
  const s = Math.max(1, Math.min(pageNo.value - 2, t - 4));
  return Array.from({ length: Math.min(t, s + 4) - s + 1 }, (_, i) => s + i);
});
function toggle(id: string) {
  openId.value = openId.value === id ? null : id;
}
function notReady(what: string) {
  useNuxtApp().$toast.info(`${what} 기능은 준비 중입니다.`);
}

// 탭이 바뀌면 필터를 초기화하고 다시 조회
watch(tab, () => {
  pageNo.value = 1;
  orderStatus.value = "";
  claimType.value = "";
  rows.value = [];
  load();
});

onMounted(async () => {
  authStore.loadStToken();
  if (!authStore.token) {
    await router.replace("/login");
    return;
  }
  if (route.params.tab !== tab.value) await router.replace(`/my/${tab.value}`);
  load();
});
</script>

<style scoped>
.my-in {
  height: 40px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font-size: 0.85rem;
}
.pg-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 0.85rem;
  cursor: pointer;
}
.pg-btn:hover:not(:disabled) {
  border-color: #9ca3af;
}
.pg-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.pg-on {
  background: #171717;
  border-color: #171717;
  color: #fff;
  font-weight: 700;
}
</style>
