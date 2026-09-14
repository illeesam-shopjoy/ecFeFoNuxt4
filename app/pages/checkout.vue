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
                    <span @click="handleCheckoutLogin" id="showlogin">로그인하려면 클릭</span>
                  </h3>
                  <div v-if="checkoutLogin" id="checkout-login" class="coupon-content">
                    <div class="coupon-info">
                      <p class="coupon-text">기존 회원은 로그인 후 주문을 이어가실 수 있습니다.</p>
                      <form @submit.prevent="handleSubmit">
                        <p class="form-row-first">
                          <label>아이디 또는 이메일 <span class="required">*</span></label>
                          <input type="text" v-model="formValue.name_or_email" />
                        </p>
                        <p class="form-row-last">
                          <label>비밀번호 <span class="required">*</span></label>
                          <input type="text" v-model="formValue.password" />
                        </p>
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
                      </form>
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
                    <span @click="couponModalRef?.show()" id="showcoupon">쿠폰 선택하기</span>
                  </h3>
                  <div v-if="appliedCouponList.length" class="coupon-checkout-content">
                    <ul class="mt-10">
                      <li v-for="c in appliedCouponList" :key="c.couponId" class="text-[14px] text-[#606060] mb-5">
                        {{ c.name }}
                        <a href="#" class="ml-10 text-[12px] text-[#999] hover:text-danger" @click.prevent="removeCoupon(c.category)">제거</a>
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
            <form @submit.prevent="handleFormSubmit">
              <div class="row">
                <div class="col-lg-6">
                  <div class="checkbox-form">
                    <h3>결제 정보</h3>
                    <!-- 청구 정보 시작 -->
                    <div class="row">
                      <div class="col-md-12">
                        <country-select />
                      </div>
                      <div class="col-md-6">
                        <div class="checkout-form-list">
                          <label>이름 <span class="required">*</span></label>
                          <input type="text" placeholder="이름" v-model="billingForm.name" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="checkout-form-list">
                          <label>성 <span class="required">*</span></label>
                          <input type="text" placeholder="성" v-model="billingForm.lastName" />
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="checkout-form-list">
                          <label>회사명</label>
                          <input type="text" placeholder="회사명 (선택)" v-model="billingForm.company" />
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="checkout-form-list">
                          <label class="flex items-center justify-between">
                            <span>주소 <span class="required">*</span></span>
                            <!-- 2026-09-15(요청사항: "주문하기의 카카오주소검색이야 모달처럼
                                 띄워지는데 http://localhost:3100/checkout 에도 추가해줘") -->
                            <button
                              type="button"
                              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs font-semibold whitespace-nowrap"
                              @click="addrSearchModalRef?.show()"
                            >
                              📮 주소 검색
                            </button>
                          </label>
                          <input type="text" placeholder="도로명 주소" v-model="billingForm.address" readonly />
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="checkout-form-list">
                          <input type="text" placeholder="상세 주소 (동, 호수 등, 선택)" v-model="billingForm.addressDetail" />
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="checkout-form-list">
                          <label>시/군/구 <span class="required">*</span></label>
                          <input type="text" placeholder="시/군/구" v-model="billingForm.sigungu" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="checkout-form-list">
                          <label>시/도 <span class="required">*</span></label>
                          <input type="text" placeholder="시/도" v-model="billingForm.sido" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="checkout-form-list">
                          <label>우편번호 <span class="required">*</span></label>
                          <input type="text" placeholder="우편번호" v-model="billingForm.zipCode" readonly />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="checkout-form-list">
                          <label>이메일 <span class="required">*</span></label>
                          <input type="email" placeholder="이메일" v-model="billingForm.email" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="checkout-form-list">
                          <label>연락처 <span class="required">*</span></label>
                          <input type="text" placeholder="연락처" v-model="billingForm.phone" />
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="checkout-form-list create-acc">
                          <input @click="handleCreateAccount" id="cbox" type="checkbox" />
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
                          <input @click="handleShipBox" id="ship-box" type="checkbox" />
                        </h3>
                      </div>
                      <div v-if="shipBox" id="ship-box-info">
                        <div class="row">
                          <div class="col-md-12">
                            <country-select />
                          </div>
                          <div class="col-md-6">
                            <div class="checkout-form-list">
                              <label>이름 <span class="required">*</span></label>
                              <input type="text" placeholder="이름" />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="checkout-form-list">
                              <label>성 <span class="required">*</span></label>
                              <input type="text" placeholder="성" />
                            </div>
                          </div>
                          <div class="col-md-12">
                            <div class="checkout-form-list">
                              <label>회사명</label>
                              <input type="text" placeholder="회사명 (선택)" />
                            </div>
                          </div>
                          <div class="col-md-12">
                            <div class="checkout-form-list">
                              <label>주소 <span class="required">*</span></label>
                              <input type="text" placeholder="도로명 주소" />
                            </div>
                          </div>
                          <div class="col-md-12">
                            <div class="checkout-form-list">
                              <input type="text" placeholder="상세 주소 (동, 호수 등, 선택)" />
                            </div>
                          </div>
                          <div class="col-md-12">
                            <div class="checkout-form-list">
                              <label>시/군/구 <span class="required">*</span></label>
                              <input type="text" placeholder="시/군/구" />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="checkout-form-list">
                              <label>시/도 <span class="required">*</span></label>
                              <input type="text" placeholder="시/도" />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="checkout-form-list">
                              <label>우편번호 <span class="required">*</span></label>
                              <input type="text" placeholder="우편번호" />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="checkout-form-list">
                              <label>이메일 <span class="required">*</span></label>
                              <input type="email" placeholder="이메일" />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="checkout-form-list">
                              <label>연락처 <span class="required">*</span></label>
                              <input type="text" placeholder="연락처" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="order-notes">
                        <div class="checkout-form-list">
                          <label>배송 메모</label>
                          <textarea id="checkout-mess" cols="30" rows="10" placeholder="주문/배송 시 요청사항을 입력하세요." />
                        </div>
                      </div>
                    </div>
                    <!-- 다른 배송지 끝 -->
                  </div>
                </div>
                <div class="col-lg-6">
                  <!-- 주문 영역 시작 -->
                  <div class="your-order mb-30">
                    <h3>주문 내역</h3>
                    <div class="your-order-table table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th class="product-name">상품</th>
                            <th class="product-total">합계</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, i) in state.cartProducts" :key="i" class="cart_item">
                            <td class="product-name">
                              {{ item.prodNm }} <strong class="product-quantity"> x {{ item.orderQuantity }}</strong>
                            </td>
                            <td class="product-total">
                              <span class="amount">{{ formatPrice(item.salePrice) }}</span>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
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
                        </tfoot>
                      </table>
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
import CouponModal from "~/components/modals/CouponModal.vue";
import AddrSearchModal, { type AddrSearchResult } from "~/components/modals/AddrSearchModal.vue";
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useCartStore } from "~/store/useCartStore";
import { useAuthStore } from "~/store/useAuthStore";
import { myAddrSvc } from "~/svc/fo/ec/my/myAddrSvc";
import type { SyCheckoutLoginFormType } from "~/types/syCheckoutLoginFormType";
import type { AppliedCoupons, CouponCategory } from "~/types/syCouponType";

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

// 결제 제출(옛 CheckoutArea)
async function handleFormSubmit() {
  if (import.meta.server) return;
  const { requestCardPayment, clientKey } = useTossPayments();
  if (!clientKey) {
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
</script>
