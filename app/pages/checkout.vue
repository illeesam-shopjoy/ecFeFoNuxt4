<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="주문/결제" subtitle="주문/결제" />
    <client-only>
      <div v-if="state.cartProducts.length === 0" class="text-center pt-100 pb-100">
        <h3>주문할 장바구니 상품이 없습니다</h3>
        <nuxt-link class="os-btn os-btn-black mt-15" to="/shop"> Shop Now </nuxt-link>
      </div>
      <div v-if="state.cartProducts.length > 0">
        <section class="coupon-area pt-100 pb-30">
          <div class="max-w-7xl mx-auto px-4">
            <div class="row">
              <div class="col-md-6">
                <div class="coupon-accordion">
                  <!-- 아코디언 시작 -->
                  <h3>
                    기존 회원이신가요?
                    <span @click="handleBtnAction('login-toggle')" id="showlogin">로그인하려면 클릭</span>
                  </h3>
                  <div v-if="checkoutLogin" id="checkout-login" class="coupon-content">
                    <div class="coupon-info">
                      <p class="coupon-text">기존 회원은 로그인 후 주문을 이어가실 수 있습니다.</p>
                      <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — <fo-form> 으로 교체 -->
                      <fo-form :columns="loginCols" :form="formValue" :cols="1" :gap="12" @submit="handleBtnAction('login-submit')">
                        <template #actions>
                          <p class="form-row">
                            <button class="os-btn os-btn-black" type="submit">로그인</button>
                            <label>
                              <input type="checkbox" v-model="formValue.isChecked" />
                              로그인 상태 유지
                            </label>
                          </p>
                          <p class="lost-password">
                            <nuxt-link href="/login">비밀번호를 잊으셨나요?</nuxt-link>
                          </p>
                        </template>
                      </fo-form>
                    </div>
                  </div>
                  <!-- 아코디언 끝 -->
                </div>
              </div>
              <div class="col-md-6">
                <div class="coupon-accordion">
                  <!-- 2026-09-14(요청사항: "주문할인쿠폰 상품할인쿠폰 배송비할인쿠폰 선택하여
                       적용할 수 있게 모달연결해주고") — 기존 텍스트 코드 입력(어디에도 실제로
                       반영 안 되던 목업)을 종류별로 골라 적용하는 CouponModal로 교체. -->
                  <h3>
                    쿠폰이 있으신가요?
                    <span @click="handleBtnAction('coupon-modalOpen')" id="showcoupon">쿠폰 선택하기</span>
                  </h3>
                  <div v-if="appliedCouponList.length" class="coupon-checkout-content">
                    <ul class="mt-10">
                      <li v-for="c in appliedCouponList" :key="c.couponId" class="text-[14px] text-[#606060] mb-5">
                        {{ c.name }}
                        <a href="#" class="ml-10 text-[12px] text-[#999] hover:text-danger" @click.prevent="handleBtnAction('coupon-remove', c.category)">제거</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="checkout-area pb-70">
          <div class="max-w-7xl mx-auto px-4">
            <form @submit.prevent="handleBtnAction('order-submit')">
              <div class="row">
                <div class="col-lg-6">
                  <div class="checkbox-form">
                    <h3 class="flex items-center justify-between">
                      <span>결제 정보</span>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold whitespace-nowrap"
                        @click="handleBtnAction('billing-autoFill')"
                      >
                        ⚡ 자동입력
                      </button>
                    </h3>
                    <!-- 청구 정보 시작 -->
                    <fo-form as="div" :columns="billingCols" :form="billingForm" :cols="2" :gap="16">
                      <template #country><country-select /></template>
                      <template #addr="{ form }">
                        <span class="flex items-center justify-between text-[0.78rem] text-gray-500 mb-1">
                          <span>주소 <span class="text-theme">*</span></span>
                          <!-- 2026-09-15(요청사항: "주문하기의 카카오주소검색이야 모달처럼 띄워지는데 http://localhost:3100/checkout 에도 추가해줘") -->
                          <button
                            type="button"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs font-semibold whitespace-nowrap"
                            @click="handleBtnAction('addr-search')"
                          >
                            📮 주소 검색
                          </button>
                        </span>
                        <input type="text" class="w-full px-[13px] py-[10px] border-[1.5px] border-[#e5e7eb] rounded-lg bg-[#f9fafb] text-[0.88rem] outline-none" placeholder="도로명 주소" v-model="form.address" readonly />
                      </template>
                    </fo-form>
                    <div class="row">
                      <div class="col-md-12">
                        <div class="checkout-form-list create-acc">
                          <input @click="handleBtnAction('account-toggle')" id="cbox" type="checkbox" />
                          <label for="cbox">계정을 만들까요?</label>
                        </div>
                        <div v-if="createAccount" id="cbox_info" class="checkout-form-list create-account">
                          <p>아래 정보를 입력하여 계정을 만드세요. 기존 회원은 상단에서 로그인하세요.</p>
                          <label>계정 비밀번호 <span class="required">*</span></label>
                          <input type="password" placeholder="비밀번호" />
                        </div>
                      </div>
                    </div>
                    <!-- 청구 정보 끝 -->

                    <!-- 다른 배송지 시작 -->
                    <div class="different-address">
                      <div class="ship-different-title">
                        <h3>
                          <label for="ship-box">배송지가 다르면 체크</label>
                          <input @click="handleBtnAction('shipBox-toggle')" id="ship-box" type="checkbox" />
                        </h3>
                      </div>
                      <div v-if="shipBox" id="ship-box-info">
                        <fo-form as="div" :columns="shipCols" :form="shipForm" :cols="2" :gap="16">
                          <template #country><country-select /></template>
                        </fo-form>
                      </div>
                      <div class="order-notes">
                        <fo-form as="div" :columns="memoCols" :form="memoForm" :cols="1" />
                      </div>
                    </div>
                    <!-- 다른 배송지 끝 -->
                  </div>
                </div>
                <div class="col-lg-6">
                  <!-- 주문 영역 시작 -->
                  <div class="your-order mb-30">
                    <h3>주문 내역</h3>
                    <div class="your-order-table">
                      <fo-grid bare :columns="orderCols" :rows="state.cartProducts">
                        <template #cell-prodNm="{ row }">
                          <td class="product-name text-left">{{ row.prodNm }} <strong class="product-quantity"> x {{ row.orderQuantity }}</strong></td>
                        </template>
                        <template #cell-total="{ row }">
                          <td class="product-total text-right"><span class="amount">{{ formatPrice(row.salePrice) }}</span></td>
                        </template>
                        <template #tfoot>
                          <tr class="cart-subtotal">
                            <th>장바구니 소계</th>
                            <td>
                              <span class="amount">{{ formatPrice(state.getStTotalPriceQuantity.total) }}</span>
                            </td>
                          </tr>
                          <tr class="shipping">
                            <th>배송비</th>
                            <td>
                              <ul>
                                <li>
                                  <input v-model="ship_cost" :value="7000" id="flat-rate" name="ship-cost" type="radio" />
                                  <label for="flat-rate">
                                    고정 배송비: <span class="amount">{{ formatPrice(7000) }}</span>
                                  </label>
                                </li>
                                <li>
                                  <input v-model="ship_cost" id="free" value="free" name="ship-cost" type="radio" />
                                  <label for="free">무료 배송:</label>
                                </li>
                              </ul>
                            </td>
                          </tr>
                          <!-- 2026-09-14(요청사항: "쿠폰 선택하여 적용할 수 있게") — 적용된
                               쿠폰이 있으면 할인 금액을 별도 줄로 보여준다. -->
                          <tr v-if="couponDiscountTotal > 0" class="order-total">
                            <th>쿠폰 할인</th>
                            <td>
                              <span class="amount text-danger">-{{ formatPrice(couponDiscountTotal) }}</span>
                            </td>
                          </tr>
                          <tr class="order-total">
                            <th>주문 합계</th>
                            <td>
                              <strong>
                                <span class="amount">{{ formatPrice(orderTotalRef) }}</span>
                              </strong>
                            </td>
                          </tr>
                        </template>
                      </fo-grid>
                    </div>

                    <div class="payment-method">
                      <div class="accordion" id="accordionExample">
                        <div class="card">
                          <div class="card-header" id="headingOne">
                            <h5 class="mb-0">
                              <button class="btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">계좌이체</button>
                            </h5>
                          </div>

                          <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div class="card-body">당사 계좌로 직접 입금해 주세요. 결제 시 주문 번호를 참조란에 기입해 주세요. 입금 확인 후 배송됩니다.</div>
                          </div>
                        </div>
                        <div class="card">
                          <div class="card-header" id="headingTwo">
                            <h5 class="mb-0">
                              <button class="btn-link collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">수표 결제</button>
                            </h5>
                          </div>
                          <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                            <div class="card-body">수표는 당사 주소로 발송해 주세요.</div>
                          </div>
                        </div>
                      </div>
                      <div class="order-button-payment mt-20">
                        <button type="submit" class="os-btn os-btn-black">주문하기</button>
                      </div>
                    </div>
                  </div>
                  <!-- 주문 영역 끝 -->
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </client-only>
    <coupon-modal ref="couponModalRef" :applied-coupons="appliedCoupons" @apply="handleApplyCoupons" />
    <addr-search-modal ref="addrSearchModalRef" @select="handleAddrSelected" />
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import CountrySelect from "~/components/checkout/CountrySelect.vue";
import FoForm from "~/components/fo/FoForm.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import type { FoFormColumn, FoGridColumn } from "~/types/fo/foCompType";
import CouponModal from "~/components/modals/CouponModal.vue";
import AddrSearchModal, { type AddrSearchResult } from "~/components/modals/AddrSearchModal.vue";
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useCartStore } from "~/store/useCartStore";
import { useAuthStore } from "~/store/useAuthStore";
import { myAddrSvc } from "~/svc/fo/ec/my/myAddrSvc";
import type { SyCheckoutLoginFormType } from "~/types/sy/syCheckoutLoginFormType";
import type { AppliedCoupons, CouponCategory } from "~/types/pm/pmCouponType";

const state = useCartStore();
import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "주문/결제",
});
usePageTitle("주문/결제");

const { formatPrice } = usePrice();

// 결제 정보(청구 정보) — 주소 검색/기본 배송지 프리필 대상.
// 2026-09-15(요청사항: "주문하기의 카카오주소검색이야 모달처럼 띄워지는데
// http://localhost:3100/checkout 에도 추가해줘", "로그인사용자의 기본주소 있으면 넣어주면되")
const billingForm = reactive({
  name: "",
  lastName: "",
  company: "",
  address: "",
  addressDetail: "",
  sigungu: "",
  sido: "",
  zipCode: "",
  email: "",
  phone: "",
});
// 결제 정보 입력 필드 정의(<fo-form>) — 주소 행은 검색 버튼이 있어 슬롯으로 그린다
const billingCols: FoFormColumn[] = [
  { key: "country", type: "slot", name: "country", colSpan: 2 },
  { key: "name", label: "이름", type: "text", required: true, placeholder: "이름" },
  { key: "lastName", label: "성", type: "text", required: true, placeholder: "성" },
  { key: "company", label: "회사명", type: "text", placeholder: "회사명 (선택)", colSpan: 2 },
  { key: "addr", type: "slot", colSpan: 2 },
  { key: "addressDetail", type: "text", hideLabel: true, placeholder: "상세 주소 (동, 호수 등, 선택)", colSpan: 2 },
  { key: "sigungu", label: "시/군/구", type: "text", required: true, placeholder: "시/군/구", colSpan: 2 },
  { key: "sido", label: "시/도", type: "text", required: true, placeholder: "시/도" },
  { key: "zipCode", label: "우편번호", type: "text", required: true, placeholder: "우편번호", readonly: true },
  { key: "email", label: "이메일", type: "email", required: true, placeholder: "이메일" },
  { key: "phone", label: "연락처", type: "text", required: true, placeholder: "연락처" },
];
// 다른 배송지(화면 입력만 — 결제 요청에는 아직 쓰지 않는다)
const shipForm = reactive({ name: "", lastName: "", company: "", address: "", addressDetail: "", sigungu: "", sido: "", zipCode: "", email: "", phone: "" });
const shipCols: FoFormColumn[] = [
  { key: "country", type: "slot", name: "country", colSpan: 2 },
  { key: "name", label: "이름", type: "text", required: true, placeholder: "이름" },
  { key: "lastName", label: "성", type: "text", required: true, placeholder: "성" },
  { key: "company", label: "회사명", type: "text", placeholder: "회사명 (선택)", colSpan: 2 },
  { key: "address", label: "주소", type: "text", required: true, placeholder: "도로명 주소", colSpan: 2 },
  { key: "addressDetail", type: "text", hideLabel: true, placeholder: "상세 주소 (동, 호수 등, 선택)", colSpan: 2 },
  { key: "sigungu", label: "시/군/구", type: "text", required: true, placeholder: "시/군/구", colSpan: 2 },
  { key: "sido", label: "시/도", type: "text", required: true, placeholder: "시/도" },
  { key: "zipCode", label: "우편번호", type: "text", required: true, placeholder: "우편번호" },
  { key: "email", label: "이메일", type: "email", required: true, placeholder: "이메일" },
  { key: "phone", label: "연락처", type: "text", required: true, placeholder: "연락처" },
];
const memoForm = reactive({ memo: "" });
const memoCols: FoFormColumn[] = [{ key: "memo", label: "배송 메모", type: "textarea", rows: 10, placeholder: "주문/배송 시 요청사항을 입력하세요." }];
const loginCols: FoFormColumn[] = [
  { key: "name_or_email", label: "아이디 또는 이메일", type: "text", required: true },
  { key: "password", label: "비밀번호", type: "password", required: true },
];
// 주문 내역 표(<fo-grid>) 컬럼 — 셀은 슬롯으로 그린다
const orderCols: FoGridColumn[] = [
  { key: "prodNm", label: "상품", align: "left" },
  { key: "total", label: "합계", width: "160px", align: "right" },
];

// [자동입력] 버튼 — 이름/성/회사명/이메일/연락처처럼 검색 없이 바로 채울 수 있는 간단한
// 항목만 대상. 주소는 이미 "주소 검색" 모달 + 로그인 시 기본배송지 자동채움이 있어 제외.
// 로그인 상태면 회원 프로필 값으로, 비로그인/미보유 값은 테스트용 기본값으로 채운다.
function handleAutoFillBilling() {
  const authStore = useAuthStore();
  const user = authStore.user;
  billingForm.name = user?.userNm || "홍길동";
  billingForm.lastName = billingForm.lastName || "-";
  billingForm.company = billingForm.company || "-";
  billingForm.email = user?.userEmail || "illeesam@gmail.com";
  billingForm.phone = user?.userPhone || "01038050206";
}

const addrSearchModalRef = ref<InstanceType<typeof AddrSearchModal> | null>(null);
function handleAddrSelected(result: AddrSearchResult) {
  billingForm.zipCode = result.zonecode;
  billingForm.address = result.address;
  billingForm.sido = result.sido;
  billingForm.sigungu = result.sigungu;
}

// 로그인 회원의 기본 배송지가 있으면 결제 정보에 미리 채워준다.
onMounted(async () => {
  const authStore = useAuthStore();
  authStore.loadStToken(); // app.vue 의 토큰 복원보다 페이지 마운트가 먼저라(자식 onMounted 가 먼저) 새로고침 시 로그인 상태가 비어 있었다 — useMyList.ts 와 같은 처리
  if (!authStore.isStLoggedIn) return;
  try {
    const addrs = await myAddrSvc.getMyAddrs();
    const defaultAddr = addrs.find((a) => a.defaultYn === "Y") ?? addrs[0];
    if (!defaultAddr) return;
    billingForm.name = defaultAddr.recvNm ?? billingForm.name;
    billingForm.phone = defaultAddr.recvPhone ?? billingForm.phone;
    billingForm.zipCode = defaultAddr.zipCode ?? billingForm.zipCode;
    billingForm.address = defaultAddr.addr ?? billingForm.address;
    billingForm.addressDetail = defaultAddr.addrDetail ?? billingForm.addressDetail;
    if (!billingForm.email) billingForm.email = authStore.user?.userEmail ?? "";
  } catch (err) {
    console.warn("[checkout] 기본 배송지 조회 실패:", err);
  }
});

// 로그인 아코디언 (옛 CouponArea)
const checkoutLogin = ref(false);
const formValue = reactive<SyCheckoutLoginFormType>({
  name_or_email: "",
  password: "",
  isChecked: false,
});

function handleCheckoutLogin() {
  checkoutLogin.value = !checkoutLogin.value;
}
function handleSubmit() {
  formValue.name_or_email = "";
  formValue.password = "";
  formValue.isChecked = false;
}

// 쿠폰(요청사항: "주문할인쿠폰 상품할인쿠폰 배송비할인쿠폰 선택하여 적용할 수 있게
// 모달연결해주고") — 종류별로 하나씩 적용, CouponModal에서 선택.
const couponModalRef = ref<InstanceType<typeof CouponModal> | null>(null);
const appliedCoupons = reactive<AppliedCoupons>({ order: null, product: null, shipping: null });
const appliedCouponList = computed(() => Object.values(appliedCoupons).filter((c): c is NonNullable<typeof c> => c !== null));
function handleApplyCoupons(coupons: AppliedCoupons) {
  appliedCoupons.order = coupons.order;
  appliedCoupons.product = coupons.product;
  appliedCoupons.shipping = coupons.shipping;
}
function removeCoupon(category: CouponCategory) {
  appliedCoupons[category] = null;
}

// 청구 정보(옛 BillingDetails)
const createAccount = ref(false);
function handleCreateAccount() {
  createAccount.value = !createAccount.value;
}

// 다른 배송지(옛 DifferentAddress)
const shipBox = ref(false);
function handleShipBox() {
  shipBox.value = !shipBox.value;
}

// 주문 내역/합계(옛 OrderArea) — provide/inject 대신 이 페이지 안에서 바로 공유
const ship_cost = ref<number | "free">(0);
const orderTotalRef = ref(0);
// 쿠폰 할인 총액(표시용) — orderTotalRef 계산과 같은 로직으로 별도 유지.
const couponDiscountTotal = ref(0);
watch(
  [() => state.getStTotalPriceQuantity.total, ship_cost, () => appliedCoupons.order, () => appliedCoupons.product, () => appliedCoupons.shipping],
  () => {
    const subtotal = state.getStTotalPriceQuantity.total;
    const baseShip = ship_cost.value === "free" || (typeof ship_cost.value === "number" && ship_cost.value === 0) ? 0 : 7000;

    // 상품할인 → 그 결과에 주문할인 순서로 적용(상품가 기준 쿠폰이 먼저 적용되는 게 자연스러움).
    const productCoupon = appliedCoupons.product;
    const productDiscount =
      productCoupon?.discountType === "amount"
        ? Math.min(productCoupon.discountValue, subtotal)
        : productCoupon?.discountType === "percent"
          ? Math.round((subtotal * productCoupon.discountValue) / 100)
          : 0;
    const afterProduct = subtotal - productDiscount;

    const orderCoupon = appliedCoupons.order;
    const orderDiscount =
      orderCoupon?.discountType === "amount"
        ? Math.min(orderCoupon.discountValue, afterProduct)
        : orderCoupon?.discountType === "percent"
          ? Math.round((afterProduct * orderCoupon.discountValue) / 100)
          : 0;

    const shippingCoupon = appliedCoupons.shipping;
    const ship =
      shippingCoupon?.discountType === "free-shipping"
        ? 0
        : shippingCoupon?.discountType === "amount"
          ? Math.max(0, baseShip - shippingCoupon.discountValue)
          : baseShip;
    const shipDiscount = baseShip - ship;

    couponDiscountTotal.value = productDiscount + orderDiscount + shipDiscount;
    orderTotalRef.value = Math.max(0, subtotal - productDiscount - orderDiscount + ship);
  },
  { immediate: true }
);

// ── 토스페이먼츠 결제창 SDK v2 (클라이언트 전용) — 2026-09-20: 이 화면에서만 쓰는 useTossPayments 컴포저블을 이 파일로 병합 ──
// @see https://docs.tosspayments.com/sdk/v2/js
const TOSSPAYMENTS_SCRIPT = "https://js.tosspayments.com/v2/standard";
type TossPaymentsFactory = (clientKey: string) => {
  payment: (params: { customerKey: string }) => {
    requestPayment: (options: {
      method: string;
      amount: { currency: string; value: number };
      orderId: string;
      orderName: string;
      successUrl: string;
      failUrl: string;
      customerName?: string;
    }) => Promise<void>;
  };
};
const tossClientKey = (useRuntimeConfig().public as { tossPaymentClientKey?: string }).tossPaymentClientKey;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// 카드 결제창 호출 — 결제 성공/실패는 successUrl/failUrl(/checkout/success, /checkout/fail)로 돌아온다
async function requestCardPayment(params: { amount: number; orderId: string; orderName: string; successUrl: string; failUrl: string; customerName?: string }) {
  if (!tossClientKey) throw new Error("토스페이먼츠 클라이언트 키가 설정되지 않았습니다.");
  await loadScript(TOSSPAYMENTS_SCRIPT);
  const TossPayments = (window as unknown as { TossPayments?: TossPaymentsFactory }).TossPayments;
  if (!TossPayments) throw new Error("토스페이먼츠 스크립트를 불러오지 못했습니다.");
  const customerKey = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  await TossPayments(tossClientKey).payment({ customerKey }).requestPayment({
    method: "CARD",
    amount: { currency: "KRW", value: params.amount },
    orderId: params.orderId,
    orderName: params.orderName,
    successUrl: params.successUrl,
    failUrl: params.failUrl,
    ...(params.customerName && { customerName: params.customerName }),
  });
}

// 결제 제출(옛 CheckoutArea)
async function handleFormSubmit() {
  if (import.meta.server) return;
  if (!tossClientKey) {
    await useAlert().openAlert("결제 설정이 없습니다. .env에 NUXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY를 설정해 주세요.");
    return;
  }
  const total = orderTotalRef.value;
  if (total <= 0) {
    await useAlert().openAlert("주문 금액을 확인해 주세요.");
    return;
  }
  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const origin = window.location.origin;
  try {
    await requestCardPayment({
      amount: total,
      orderId,
      orderName: "shopjoy 주문",
      successUrl: `${origin}/checkout/success`,
      failUrl: `${origin}/checkout/fail`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "결제 요청 중 오류가 발생했습니다.";
    await useAlert().openAlert(msg);
  }
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ checkout.vue : handleBtnAction -> ", cmd, param);
  // 기존 회원 로그인 영역 열기/닫기
  if (cmd === "login-toggle") {
    return handleCheckoutLogin();
  // 로그인 폼 제출
  } else if (cmd === "login-submit") {
    return handleSubmit();
  // 쿠폰 선택 모달 열기
  } else if (cmd === "coupon-modalOpen") {
    couponModalRef.value?.show();
  // 적용 쿠폰 제거 (param: 쿠폰 종류)
  } else if (cmd === "coupon-remove") {
    return removeCoupon(param as CouponCategory);
  // 결제 정보 자동입력
  } else if (cmd === "billing-autoFill") {
    return handleAutoFillBilling();
  // 주소 검색 모달 열기
  } else if (cmd === "addr-search") {
    addrSearchModalRef.value?.show();
  // 계정 만들기 입력 열기/닫기
  } else if (cmd === "account-toggle") {
    return handleCreateAccount();
  // 다른 배송지 입력 열기/닫기
  } else if (cmd === "shipBox-toggle") {
    return handleShipBox();
  // 주문하기(결제 요청)
  } else if (cmd === "order-submit") {
    return handleFormSubmit();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
