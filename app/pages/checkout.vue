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
                  <!-- 아코디언 시작 -->
                  <h3>
                    쿠폰이 있으신가요?
                    <span @click="handleCheckoutCoupon" id="showcoupon">쿠폰 코드 입력하기</span>
                  </h3>
                  <div v-if="checkoutCoupon" id="checkout_coupon" class="coupon-checkout-content">
                    <div class="coupon-info">
                      <form @submit.prevent="handleCouponSubmit">
                        <p class="checkout-coupon">
                          <input v-model="couponVal" type="text" placeholder="쿠폰 코드" />
                          <button class="os-btn os-btn-black" type="submit">쿠폰 적용</button>
                        </p>
                      </form>
                    </div>
                  </div>
                  <!-- 아코디언 끝 -->
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
                          <tr class="order-total">
                            <th>주문 합계</th>
                            <td>
                              <strong>
                                <span class="amount"> {{ formatPrice(typeof ship_cost === "number" && ship_cost > 0 ? state.getStTotalPriceQuantity.total + Number(ship_cost) : state.getStTotalPriceQuantity.total) }} </span>
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
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import CountrySelect from "~/components/checkout/CountrySelect.vue";
import { ref, reactive, watch } from "vue";
import { useCartStore } from "~/store/useCartStore";
import type { SyCheckoutLoginFormType } from "~/types/syCheckoutLoginFormType";

const state = useCartStore();
import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "주문/결제",
});
usePageTitle("주문/결제");

const { formatPrice } = usePrice();

// 쿠폰/로그인 아코디언 (옛 CouponArea)
const checkoutLogin = ref(false);
const checkoutCoupon = ref(false);
const formValue = reactive<SyCheckoutLoginFormType>({
  name_or_email: "",
  password: "",
  isChecked: false,
});
const couponVal = ref("");

function handleCheckoutLogin() {
  checkoutLogin.value = !checkoutLogin.value;
}
function handleCheckoutCoupon() {
  checkoutCoupon.value = !checkoutCoupon.value;
}
function handleSubmit() {
  formValue.name_or_email = "";
  formValue.password = "";
  formValue.isChecked = false;
}
function handleCouponSubmit() {
  console.log(couponVal.value);
  couponVal.value = "";
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
watch(
  [() => state.getStTotalPriceQuantity.total, ship_cost],
  () => {
    const ship = ship_cost.value === "free" || (typeof ship_cost.value === "number" && ship_cost.value === 0)
      ? 0
      : 7000;
    orderTotalRef.value = state.getStTotalPriceQuantity.total + ship;
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
