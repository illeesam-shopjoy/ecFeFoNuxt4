<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="주문/결제" subtitle="주문/결제" />
    <client-only>
      <div v-if="state.cartProducts.length === 0" class="text-center pt-[16px] md:pt-[100px] pb-100">
        <h3>주문할 장바구니 상품이 없습니다</h3>
        <nuxt-link class="os-btn os-btn-black mt-15" to="/shop"> Shop Now </nuxt-link>
      </div>
      <div v-if="state.cartProducts.length > 0">
        <!-- 주문자 확인 — 로그인 회원은 한 줄 안내, 비로그인은 "로그인" 또는 "비회원(PASS 본인인증)" 중 하나를 고르게 한다 -->
        <section class="pt-[16px] md:pt-[100px] pb-30">
          <div class="max-w-7xl mx-auto px-4">
            <div v-if="loggedIn && !isPassGuest" class="flex flex-wrap items-center gap-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-4 text-[0.92rem] text-gray-800">
              <i class="fas fa-check-circle text-[#16a34a]"></i>
              <span class="inline-flex items-center gap-1.5 font-bold">{{ authStore.user?.userNm }}<sns-provider-icon :provider="authStore.user?.loginSns" :size="16" /></span>
              <span class="text-gray-500">님으로 주문합니다.</span>
              <span class="ml-auto text-[0.8rem] text-gray-500">배송지·쿠폰·캐시가 회원 정보로 적용됩니다.</span>
            </div>
            <div v-else id="checkout-guest" class="grid gap-4 md:grid-cols-2">
              <!-- 회원 로그인 -->
              <div class="rounded-xl border border-[#e5e7eb] bg-white p-5">
                <h4 class="m-0 text-[1rem] font-bold text-gray-900"><i class="fas fa-user mr-2 text-theme"></i>기존 회원이신가요?</h4>
                <p class="m-0 mt-1 text-[0.82rem] text-gray-500">로그인하면 저장된 배송지·보유 쿠폰·캐시가 자동으로 적용됩니다.</p>
                <button type="button" class="mt-3 cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white" @click="handleBtnAction('login-toggle')">{{ checkoutLogin ? "로그인 닫기" : "로그인하려면 클릭" }}</button>
                <div v-if="checkoutLogin" id="checkout-login" class="mt-4 border-t border-dashed border-[#e5e7eb] pt-4">
                  <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — <fo-form> 으로 교체 -->
                  <fo-form :columns="loginCols" :form="formValue" :cols="1" :gap="12" @submit="handleBtnAction('login-submit')">
                    <template #actions>
                      <!-- 2026-09-22(요청사항: "로그인 버튼은 가운데 정렬") -->
                      <p class="form-row flex flex-wrap items-center justify-center gap-3">
                        <button class="os-btn os-btn-black" type="submit">로그인</button>
                        <label>
                          <input type="checkbox" v-model="formValue.isChecked" />
                          로그인 상태 유지
                        </label>
                      </p>
                      <p class="lost-password text-center">
                        <nuxt-link href="/login">비밀번호를 잊으셨나요?</nuxt-link>
                      </p>
                    </template>
                  </fo-form>
                </div>
              </div>
              <!-- 비회원: PASS 본인인증 -->
              <div class="rounded-xl border px-5 py-5" :class="idv ? 'border-[#bbf7d0] bg-[#f0fdf4]' : 'border-[#fde68a] bg-[#fffbeb]'">
                <h4 class="m-0 flex items-center gap-2 text-[1rem] font-bold text-gray-900">
                  <i class="fas" :class="idv ? 'fa-check-circle text-[#16a34a]' : 'fa-mobile-alt text-[#d97706]'"></i>비회원으로 주문
                  <span v-if="idv" class="ml-1 rounded-full bg-[#dcfce7] px-2 py-px text-[0.72rem] font-bold text-[#15803d]">인증 완료</span>
                </h4>
                <template v-if="!idv">
                  <p class="m-0 mt-1 text-[0.82rem] text-gray-600">비회원은 주문 전에 <b>PASS 본인인증</b>이 필요합니다. 인증하면 이름·휴대폰이 주문 정보에 채워집니다.</p>
                  <p class="m-0 mt-1 text-[0.78rem] text-gray-500">인증 후 아래 결제 정보에 <b>이메일</b>(주문 안내 수신)을 입력해 주세요.</p>
                  <button type="button" class="mt-3 cursor-pointer rounded-lg border-0 bg-[#111] px-4 py-2 text-[0.85rem] font-bold text-white disabled:opacity-60" :disabled="idvBusy" @click="startIdentity">{{ idvBusy ? "인증 중..." : "PASS 본인인증" }}</button>
                </template>
                <template v-else>
                  <p class="m-0 mt-1 text-[0.85rem] text-gray-800">{{ maskName(idv.name) }} · {{ maskPhone(idv.phoneNumber) }}</p>
                  <p class="m-0 mt-1 text-[0.78rem] text-gray-500">이름·휴대폰은 인증 정보로 채워졌습니다. 이메일을 입력해 주세요.</p>
                  <button type="button" class="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[0.78rem] text-gray-500 underline" @click="resetIdentity">다시 인증</button>
                </template>
                <p v-if="idvError" class="m-0 mt-2 whitespace-pre-line text-[0.78rem] text-red-500">{{ idvError }}</p>
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
                    <h3 class="co-title">주문자·배송 정보</h3>
                    <!-- 청구 정보 시작 -->
                    <fo-form as="div" :columns="billingCols" :form="billingForm" :cols="2" :gap="16">
                      <template #country><country-select /></template>
                      <template #addr="{ form }">
                        <span class="flex items-center justify-between text-[0.78rem] text-gray-500 mb-1">
                          <span>주소 <span class="text-theme">*</span></span>
                          <!-- 2026-09-15(요청사항: "주문하기의 카카오주소검색이야 모달처럼 띄워지는데 http://localhost:3100/checkout 에도 추가해줘") -->
                          <span v-if="loggedIn" class="flex gap-1.5">
                            <button type="button" class="co-mini co-mini-dark" @click="handleBtnAction('addr-list')">📋 주소 목록</button>
                            <button type="button" class="co-mini co-mini-green" @click="handleBtnAction('addr-search')">📮 주소 검색</button>
                          </span>
                          <button v-else type="button" class="co-mini co-mini-green" @click="handleBtnAction('addr-search')">📮 주소 검색</button>
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
                        <h3 class="co-sub">
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
                  <!-- 주문 영역 시작 — 주문정보 / 할인정보 / 결제정보 -->
                  <div class="your-order mb-30 !p-0 !border-0 !bg-transparent">
                    <!-- ① 주문정보 -->
                    <div class="mb-4 rounded-xl border border-[#e5e7eb] bg-white p-5">
                      <h3 class="co-title"><span class="co-num">1</span>주문 정보</h3>
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
                              <th>{{ AMT.item }}</th>
                              <td><span class="amount">{{ formatPrice(state.getStTotalPriceQuantity.total) }}</span></td>
                            </tr>
                            <tr class="shipping">
                              <th>{{ AMT.ship }}</th>
                              <td>
                                <ul>
                                  <li>
                                    <input v-model="ship_cost" :value="7000" id="flat-rate" name="ship-cost" type="radio" />
                                    <label for="flat-rate">유료 배송: <span class="amount">{{ formatPrice(7000) }}</span></label>
                                  </li>
                                  <li>
                                    <input v-model="ship_cost" id="free" value="free" name="ship-cost" type="radio" />
                                    <label for="free">무료 배송</label>
                                  </li>
                                </ul>
                              </td>
                            </tr>
                            <tr class="order-total">
                              <th>{{ AMT.order }}</th>
                              <td><strong><span class="amount">{{ formatPrice(subtotalRef + baseShip) }}</span></strong></td>
                            </tr>
                          </template>
                        </fo-grid>
                      </div>
                    </div>

                    <!-- ② 할인정보 — 쿠폰 / 캐시 -->
                    <div class="mb-4 rounded-xl border border-[#e5e7eb] bg-white p-5">
                      <h3 class="co-title"><span class="co-num">2</span>할인 정보</h3>
                      <!-- 2026-09-14(요청사항: "주문할인쿠폰 상품할인쿠폰 배송비할인쿠폰 선택하여 적용할 수 있게 모달연결해주고") — CouponModal -->
                      <div class="flex items-center gap-2 text-[0.9rem]">
                        <span class="font-semibold text-gray-800">쿠폰</span>
                        <span v-if="myCoupons.length" class="text-[0.78rem] text-gray-500">보유 {{ myCoupons.length }}장</span>
                        <button type="button" class="ml-auto cursor-pointer rounded-lg border-[1.5px] border-theme bg-[#fdf6ee] px-3 py-1.5 text-[0.8rem] font-bold text-theme" @click="handleBtnAction('coupon-modalOpen')">쿠폰 선택하기</button>
                      </div>
                      <ul v-if="appliedCouponList.length" class="m-0 mt-2 list-none p-0">
                        <li v-for="row in appliedCouponList" :key="row.key" class="mb-1.5 text-[0.85rem] text-[#606060]">
                          <span class="mr-1 text-[0.75rem] text-[#999]">[{{ COUPON_CATEGORY_LABEL[row.coupon.category] }}<template v-if="row.lineName"> · {{ row.lineName }}</template>]</span>{{ row.coupon.name }}
                          <b class="ml-1 text-[#c0392b]">-{{ formatPrice(row.discount) }}</b>
                          <span class="ml-1 text-[0.7rem] text-[#999]">({{ row.touched ? "직접 선택" : "자동 적용" }})</span>
                          <a href="#" class="ml-2 text-[0.75rem] text-[#999] hover:text-danger" @click.prevent="handleBtnAction('coupon-remove', row.remove)">제거</a>
                        </li>
                      </ul>
                      <p v-else class="m-0 mt-2 text-[0.8rem] text-gray-400">적용된 쿠폰이 없습니다.</p>

                      <!-- 캐시(적립금): 보유 캐시를 최대로 쓸지 선택 -->
                      <div v-if="loggedIn" class="mt-4 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-[0.88rem]">
                        <label class="m-0 flex cursor-pointer items-center gap-2" :class="cashBalance <= 0 ? 'cursor-not-allowed opacity-60' : ''">
                          <input v-model="useMaxCash" type="checkbox" :disabled="cashBalance <= 0" />
                          <span class="font-semibold text-gray-800">보유 캐시 최대 사용</span>
                          <span class="ml-auto text-gray-500">보유 <b class="text-gray-800">{{ formatPrice(cashBalance) }}</b></span>
                        </label>
                        <div v-if="useMaxCash && cashUse > 0" class="mt-1 text-[0.8rem] text-[#c0392b]">이번 주문에 {{ formatPrice(cashUse) }} 사용</div>
                        <div v-else-if="cashBalance <= 0" class="mt-1 text-[0.78rem] text-gray-400">사용할 수 있는 캐시가 없습니다.</div>
                      </div>

                      <dl class="m-0 mt-3 border-t border-dashed border-[#e5e7eb] pt-3 text-[0.88rem]">
                        <div class="flex justify-between py-0.5"><dt class="text-gray-500">{{ AMT.coupon }}</dt><dd class="m-0 font-semibold" :class="couponDiscountTotal > 0 ? 'text-danger' : 'text-gray-400'">{{ couponDiscountTotal > 0 ? "-" : "" }}{{ formatPrice(couponDiscountTotal) }}</dd></div>
                        <div class="flex justify-between py-0.5"><dt class="text-gray-500">{{ AMT.cash }}</dt><dd class="m-0 font-semibold" :class="cashUse > 0 ? 'text-danger' : 'text-gray-400'">{{ cashUse > 0 ? "-" : "" }}{{ formatPrice(cashUse) }}</dd></div>
                        <div class="mt-1 flex justify-between border-t border-[#e5e7eb] pt-1.5"><dt class="font-bold text-gray-900">{{ AMT.discount }}</dt><dd class="m-0 font-bold" :class="couponDiscountTotal + cashUse > 0 ? 'text-danger' : 'text-gray-400'">{{ couponDiscountTotal + cashUse > 0 ? "-" : "" }}{{ formatPrice(couponDiscountTotal + cashUse) }}</dd></div>
                      </dl>
                    </div>

                    <!-- ③ 결제정보 — 결제 금액 / 결제 방법 / 약관 / 주문하기 -->
                    <div class="rounded-xl border border-[#e5e7eb] bg-white p-5">
                      <h3 class="co-title"><span class="co-num">3</span>결제 정보</h3>
                      <dl class="m-0 mb-4 rounded-lg bg-[#f9fafb] px-4 py-3 text-[0.88rem]">
                        <div class="flex justify-between py-0.5"><dt class="text-gray-500">{{ AMT.order }}</dt><dd class="m-0">{{ formatPrice(subtotalRef + baseShip) }}</dd></div>
                        <div class="flex justify-between py-0.5"><dt class="text-gray-500">{{ AMT.discount }}</dt><dd class="m-0" :class="couponDiscountTotal + cashUse > 0 ? 'text-danger' : 'text-gray-400'">{{ couponDiscountTotal + cashUse > 0 ? "-" : "" }}{{ formatPrice(couponDiscountTotal + cashUse) }}</dd></div>
                        <div class="mt-1.5 flex items-baseline justify-between border-t border-[#e5e7eb] pt-2"><dt class="font-bold text-gray-900">{{ AMT.pay }}</dt><dd class="m-0 text-[1.25rem] font-extrabold text-[#bc8246]">{{ formatPrice(orderTotalRef) }}</dd></div>
                      </dl>

                    <div class="payment-method">
                      <!-- 결제수단 선택(카드/계좌이체/가상계좌/간편결제) — [주문하기]를 누르면 선택한 수단의 결제창이 열린다. 수단→PG 매핑은 conts/payMethods.ts -->
                      <h4 class="co-sub">결제 방법</h4>
                      <pay-method-select v-model="payMethod" />
                      <div v-if="isTestPay" class="mt-3 rounded-lg bg-[#fff7e6] px-3 py-2 text-[0.8rem] text-[#8a5a25]"><i class="fas fa-info-circle mr-1.5"></i>테스트 결제 환경입니다. 실제로 결제되지 않습니다.</div>
                      <label class="m-0 mt-3 flex cursor-pointer items-center gap-2 text-[0.85rem] text-gray-700">
                        <input v-model="agreeTerms" type="checkbox" class="!my-0 accent-[#bc8246]" />[필수] 결제 서비스 이용 약관, 개인정보 처리에 동의합니다.
                      </label>
                      <div class="order-button-payment mt-20">
                        <button type="submit" class="os-btn os-btn-black">주문하기</button>
                      </div>
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
    <coupon-modal ref="couponModalRef" :coupons="myCoupons" :applied-coupons="appliedCoupons" :subtotal="subtotalRef" :bases="couponBaseAmts" :lines="couponLines" @apply="handleApplyCoupons" />
    <addr-search-modal ref="addrSearchModalRef" @select="handleAddrSelected" />
    <!-- 내 주소 목록에서 배송지 선택 -->
    <addr-manage-modal ref="addrManageRef" pick @pick="handleAddrPicked" />
  </layout>
</template>

<script setup lang="ts">
import PayMethodSelect from "~/components/pay/PayMethodSelect.vue";
import AddrManageModal from "~/components/modals/AddrManageModal.vue";
import { AMT } from "~/conts/amountLabels";
import type { MbMemberAddrType } from "~/types/mb/mbMemberAddrType";
import SnsProviderIcon from "~/components/my/SnsProviderIcon.vue";
import { DEFAULT_PAY_METHOD, loadLastPayMethod, payMethodFromDbCd, saveLastPayMethod, type PayMethodCd } from "~/conts/payMethods";
import { myPaySvc } from "~/svc/fo/ec/my/myPaySvc";
import { getPayProvider } from "~/utils/payProvider";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import CountrySelect from "~/components/checkout/CountrySelect.vue";
import FoForm from "~/components/fo/FoForm.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import type { FoFormColumn, FoGridColumn } from "~/types/fo/foCompType";
import CouponModal from "~/components/modals/CouponModal.vue";
import AddrSearchModal from "~/components/modals/AddrSearchModal.vue";
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useCartStore } from "~/store/useCartStore";
import { useAuthStore } from "~/store/useAuthStore";
import { myAddrSvc } from "~/svc/fo/ec/my/myAddrSvc";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import type { SyCheckoutLoginFormType } from "~/types/sy/syCheckoutLoginFormType";
import type { AppliedCoupons, CouponLine, PmCouponApplyType } from "~/types/pm/pmCouponApplyType";
import { COUPON_CATEGORY_LABEL, autoPickProductCoupons, calcCheckout, couponBases, couponBlockReason, couponDiscount, couponLineKey, lineCouponBlockReason, pickBestCoupon, productDiscountTotal, toApplyCoupon, todayYmd } from "~/utils/mapCoupon";
import { myCouponSvc } from "~/svc/fo/my/myCouponSvc";
import { identitySvc } from "~/svc/co/identity/identitySvc";
import type { MbIdentityVerifyType } from "~/types/mb/mbIdentityVerifyType";
import { maskName, maskPhone, usePassIdentity } from "~/composables/usePassIdentity";

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
  { key: "total", label: "금액", width: "160px", align: "right" },
];

/** "경기 성남시 중원구 …" → 시/도, 시/군/구 (주소 검색 모달이 채우는 값과 같은 모양) */
function splitAddr(addr: string): { sido: string; sigungu: string } {
  const [sido = "", ...rest] = addr.trim().split(/\s+/);
  const sigungu = rest[0] && rest[1] && /시$/.test(rest[0]) && /[구군]$/.test(rest[1]) ? `${rest[0]} ${rest[1]}` : (rest[0] ?? "");
  return { sido, sigungu };
}

/** 이름을 성/이름 칸에 나눠 넣는다 — 한글 3~4글자는 첫 글자가 성, 그 밖은 전부 이름(성은 "-") */
function setBillingName(fullNm: string) {
  const nm = fullNm.trim();
  if (!nm) return;
  const koreanFull = /^[가-힣]{3,4}$/.test(nm);
  billingForm.lastName = koreanFull ? nm.slice(0, 1) : billingForm.lastName || "-";
  billingForm.name = koreanFull ? nm.slice(1) : nm;
}
/** 배송지(주소 목록/기본 배송지)를 주문자·배송 정보에 채운다 */
function applyAddrToBilling(a: { recvNm?: string; recvPhone?: string; zipCode?: string; addr?: string; addrDetail?: string }, overwrite: boolean) {
  if (a.recvNm && (overwrite || !billingForm.name)) setBillingName(a.recvNm);
  if (a.recvPhone && (overwrite || !billingForm.phone)) billingForm.phone = a.recvPhone;
  if (a.addr && (overwrite || !billingForm.address)) {
    billingForm.address = a.addr;
    billingForm.addressDetail = a.addrDetail ?? "";
    billingForm.zipCode = a.zipCode ?? "";
    Object.assign(billingForm, splitAddr(a.addr));
  }
}
/** 로그인 회원의 기본 정보(이름·이메일·휴대폰·기본 배송지)를 주문자·배송 정보에 기본으로 채운다 — 이미 입력한 칸은 건드리지 않는다 */
async function fillBillingFromMember() {
  const authStore = useAuthStore();
  if (!authStore.isStLoggedIn || isPassGuest.value) return;
  try {
    const [profile, addrs] = await Promise.all([myInfoSvc.getProfile(), myAddrSvc.getMyAddrs().catch(() => [])]);
    const addr = addrs.find((a) => a.defaultYn === "Y") ?? addrs[0];
    if (!billingForm.name) setBillingName(profile.memberNm || addr?.recvNm || authStore.user?.userNm || "");
    if (!billingForm.email) billingForm.email = profile.memberEmail || profile.loginId || authStore.user?.userEmail || "";
    if (!billingForm.phone) billingForm.phone = profile.memberPhone || addr?.recvPhone || "";
    if (addr) applyAddrToBilling(addr, false);
    else if (profile.memberAddr) applyAddrToBilling({ zipCode: profile.memberZipCode, addr: profile.memberAddr, addrDetail: profile.memberAddrDetail }, false);
  } catch (err) {
    console.warn("[checkout] 회원 기본정보 채우기 실패:", err);
  }
}
/** 주소 목록에서 고른 배송지 — 이름·연락처·주소를 그 배송지로 바꾼다 */
function handleAddrPicked(a: MbMemberAddrType) {
  applyAddrToBilling(a, true);
}

const addrSearchModalRef = ref<InstanceType<typeof AddrSearchModal> | null>(null);
const addrManageRef = ref<InstanceType<typeof AddrManageModal> | null>(null);
function handleAddrSelected(result: SyAddrSearchResultType) {
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
// 상품할인쿠폰은 상품(주문 줄)별로 1개씩(product: 줄키 → 쿠폰), 주문할인·배송비할인은 주문당 1개
const appliedCoupons = reactive<AppliedCoupons>({ order: null, shipping: null, product: {} });
// 쿠폰을 붙일 주문 줄 — 단가 × 수량
const couponLines = computed<CouponLine[]>(() => state.cartProducts.map((i) => ({ key: couponLineKey(i), name: i.prodNm, amount: i.salePrice * (i.orderQuantity ?? 1) })));
type AppliedRow = { key: string; coupon: PmCouponApplyType; lineName?: string; discount: number; touched: boolean; remove: string };
const appliedCouponList = computed<AppliedRow[]>(() => {
  const rows: AppliedRow[] = [];
  couponLines.value.forEach((l) => {
    const c = appliedCoupons.product[l.key];
    if (c) rows.push({ key: `p-${l.key}`, coupon: c, lineName: l.name, discount: couponDiscount(c, l.amount), touched: productTouched.value, remove: `product:${l.key}` });
  });
  if (appliedCoupons.order) rows.push({ key: "order", coupon: appliedCoupons.order, discount: calc.value.orderDiscount, touched: touched.order, remove: "order" });
  if (appliedCoupons.shipping) rows.push({ key: "shipping", coupon: appliedCoupons.shipping, discount: calc.value.shipDiscount, touched: touched.shipping, remove: "shipping" });
  return rows;
});
const myCoupons = ref<PmCouponApplyType[]>([]); // 내 쿠폰(로그인 시)
const cashBalance = ref(0); // 보유 캐시
const useMaxCash = ref(false); // 보유 캐시 최대 사용
const touched = reactive({ order: false, shipping: false }); // 직접 고른 종류는 자동 적용이 덮어쓰지 않는다
const productTouched = ref(false); // 상품할인쿠폰을 직접 골랐으면 자동 적용이 덮어쓰지 않는다
const authStore = useAuthStore(); // 템플릿에서 회원명/로그인 소셜 아이콘 표시
const loggedIn = computed(() => useAuthStore().isStLoggedIn);
const isPassGuest = computed(() => useAuthStore().isPassGuest);
function handleApplyCoupons(coupons: AppliedCoupons) {
  // 상품할인: 줄마다 자동 적용과 다른 선택이 하나라도 있으면 "직접 선택"으로 본다
  const auto = autoPickProductCoupons(productPool(), couponLines.value, todayYmd());
  productTouched.value = couponLines.value.some((l) => (coupons.product[l.key]?.couponId ?? null) !== (auto[l.key]?.couponId ?? null));
  appliedCoupons.product = { ...coupons.product };
  // 주문할인·배송비할인: 자동 적용과 다른 선택이면 "직접 선택"
  appliedCoupons.order = coupons.order;
  appliedCoupons.shipping = coupons.shipping;
  touched.order = coupons.order?.couponId !== autoPick("order")?.couponId;
  touched.shipping = coupons.shipping?.couponId !== autoPick("shipping")?.couponId;
}
/** "product:줄키" | "order" | "shipping" */
function removeCoupon(target: string) {
  if (target.startsWith("product:")) {
    productTouched.value = true;
    appliedCoupons.product = { ...appliedCoupons.product, [target.slice(8)]: null };
    return;
  }
  const cat = target as "order" | "shipping";
  touched[cat] = true;
  appliedCoupons[cat] = null;
}

// ── 비회원 본인인증(PASS, 포트원 V2) — 공용 composable(usePassIdentity) ───────────
const pass = usePassIdentity();
const idvBusy = pass.busy;
const idvError = pass.error;
const idv = ref<MbIdentityVerifyType | null>(null);

function applyIdentity(v: MbIdentityVerifyType) {
  idv.value = v;
  // 인증된 실명/휴대폰을 주문 정보에 채운다(한글 3~4자는 성/이름 분리)
  const koreanFull = /^[가-힣]{3,4}$/.test(v.name);
  billingForm.lastName = koreanFull ? v.name.slice(0, 1) : billingForm.lastName || "-";
  billingForm.name = koreanFull ? v.name.slice(1) : v.name;
  billingForm.phone = v.phoneNumber;
  try {
    sessionStorage.setItem("checkout_idv", JSON.stringify(v));
  } catch {
    /* 저장소를 못 써도 진행 */
  }
}
function resetIdentity() {
  idv.value = null;
  idvError.value = "";
  try {
    sessionStorage.removeItem("checkout_idv");
  } catch {
    /* 무시 */
  }
}
async function startIdentity() {
  const v = await pass.start();
  if (!v) return;
  // 인증 결과로 "PASS 임시회원" 로그인 — 주문 생성 등 로그인 회원 API 를 쓸 수 있게 한다
  const r = await useAuthStore().passGuestLogin(v.identityVerificationId);
  if (!r.ok) {
    idvError.value = r.message ?? "본인인증 로그인에 실패했습니다.";
    await useAlert().openAlert({ title: "본인인증 실패", variant: "error", message: idvError.value });
    return;
  }
  applyIdentity(v);
}
onMounted(() => {
  // 새로고침해도 인증 결과 유지(같은 탭 동안)
  try {
    const raw = sessionStorage.getItem("checkout_idv");
    if (raw && (!useAuthStore().isStLoggedIn || useAuthStore().isPassGuest)) applyIdentity(JSON.parse(raw));
  } catch {
    /* 무시 */
  }
});

// 로그인 회원이면 내 쿠폰과 보유 캐시를 불러온다
onMounted(async () => {
  const authStore = useAuthStore();
  authStore.loadStToken();
  if (!authStore.isStLoggedIn) return;
  const [coupons, balance] = await Promise.all([myCouponSvc.getList().catch(() => []), myInfoSvc.getCacheBalance().catch(() => 0)]);
  myCoupons.value = coupons.map(toApplyCoupon);
  cashBalance.value = balance;
});

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
const ship_cost = ref<number | "free">(7000); // 기본: 배송비(7,000원) 선택
const baseShip = computed(() => (ship_cost.value === "free" || ship_cost.value === 0 ? 0 : 7000));
const subtotalRef = computed(() => state.getStTotalPriceQuantity.total);

const productPool = () => myCoupons.value.filter((c) => c.category === "product");
/** 주문할인/배송비할인의 "기본 적용" 쿠폰(혜택 최대, 같으면 종료 빠른 순) — 상품할인(줄별) 적용 후 금액이 주문할인 기준 */
function autoPick(cat: "order" | "shipping"): PmCouponApplyType | null {
  const today = todayYmd();
  const sub = subtotalRef.value;
  const pool = myCoupons.value.filter((c) => c.category === cat);
  const productApplied = productTouched.value ? appliedCoupons.product : autoPickProductCoupons(productPool(), couponLines.value, today);
  const bases = couponBases(sub, baseShip.value, { order: null, shipping: null, product: productApplied }, couponLines.value);
  return pickBestCoupon(pool, bases[cat], sub, today);
}
// 금액/쿠폰/장바구니가 바뀌면 직접 고르지 않은 종류는 자동(최대 혜택)으로, 직접 고른 쿠폰이 쓸 수 없게 되면 해제
watch(
  [subtotalRef, baseShip, myCoupons, couponLines],
  () => {
    const today = todayYmd();
    if (!productTouched.value) appliedCoupons.product = autoPickProductCoupons(productPool(), couponLines.value, today);
    else {
      // 직접 고른 줄별 쿠폰 — 없어진 줄/쓸 수 없게 된 쿠폰은 뺀다
      const next: Record<string, PmCouponApplyType | null> = {};
      couponLines.value.forEach((l) => {
        const c = appliedCoupons.product[l.key];
        next[l.key] = c && !lineCouponBlockReason(c, l, today) ? c : null;
      });
      appliedCoupons.product = next;
    }
    (["order", "shipping"] as const).forEach((cat) => {
      if (!touched[cat]) appliedCoupons[cat] = autoPick(cat);
      else if (appliedCoupons[cat] && couponBlockReason(appliedCoupons[cat]!, subtotalRef.value, today)) appliedCoupons[cat] = null;
    });
  },
  { immediate: true, deep: true }
);

const calc = computed(() => calcCheckout(subtotalRef.value, baseShip.value, appliedCoupons, couponLines.value, cashBalance.value, useMaxCash.value));
const orderTotalRef = computed(() => calc.value.total); // 최종 결제금액 = 주문금액 − 총 할인금액 (PG 로 결제하는 금액, conts/amountLabels.ts 참조)
const couponDiscountTotal = computed(() => calc.value.couponTotal);
const cashUse = computed(() => calc.value.cashUse);
const couponBaseAmts = computed(() => couponBases(subtotalRef.value, baseShip.value, appliedCoupons, couponLines.value)); // 쿠폰 모달 미리보기용


// ── 결제수단 선택 + 결제창 호출 ──
// 화면은 결제수단만 고르고, 그 수단을 처리할 PG 는 conts/payMethods.ts 의 PAY_METHOD_PG, 결제창 호출은 utils/payProvider.ts 의 어댑터가 맡는다.
const TOSS_MIN_AMOUNT = 100; // 최소 결제금액(원)
const payMethod = ref<PayMethodCd>(DEFAULT_PAY_METHOD); // 기본 카드, 이전에 쓴 수단이 있으면 그것
const agreeTerms = ref(true);
const publicCfg = useRuntimeConfig().public as { tossPayClientKey?: string; mode?: string };
const isTestPay = computed(() => (publicCfg.tossPayClientKey ?? "").startsWith("test_"));
onMounted(async () => {
  watch(() => loggedIn.value && !isPassGuest.value, (v) => { if (v) fillBillingFromMember(); }, { immediate: true });
  payMethod.value = loadLastPayMethod();
  // 로그인 회원은 서버에 기록된 마지막 결제수단이 있으면 그것을 기본으로(다른 기기에서 결제한 수단까지 반영)
  if (loggedIn.value) {
    const last = payMethodFromDbCd(await myPaySvc.getLastPayMethod().catch(() => null));
    if (last) payMethod.value = last;
  }
});

const payErrMsg = (e: unknown) => {
  const err = e as { code?: string; message?: string };
  return `${err?.message ?? "알 수 없는 오류"}${err?.code ? `\n(오류 코드: ${err.code})` : ""}`;
};
const showPayFail = (message: string) => useAlert().openAlert({ title: "결제 연동 실패", variant: "error", message });

// 결제 제출 — 선택한 결제수단의 결제창을 연다. 성공/실패는 successUrl/failUrl(/checkout/success, /checkout/fail)로 돌아온다
async function handleFormSubmit() {
  if (import.meta.server) return;
  // 비회원은 PASS 본인인증을 마쳐야 주문할 수 있다
  if ((!loggedIn.value || isPassGuest.value) && !idv.value) {
    await useAlert().openAlert({ title: "본인인증 필요", variant: "warning", message: "비회원 결제는 PASS 본인인증 후 진행할 수 있습니다.\n'PASS 본인인증' 버튼을 눌러 인증해 주세요." });
    document.querySelector("#checkout-guest")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const total = orderTotalRef.value;
  if (total < TOSS_MIN_AMOUNT) {
    await useAlert().openAlert({ title: "결제금액 확인", variant: "warning", message: `최종 결제금액이 ${TOSS_MIN_AMOUNT}원 이상이어야 주문할 수 있습니다.
상품금액과 쿠폰·캐시 적용 금액을 확인해 주세요.` });
    return;
  }
  if (!agreeTerms.value) {
    await useAlert().openAlert({ title: "약관 동의 필요", variant: "warning", message: "결제 서비스 이용 약관과 개인정보 처리에 동의해 주세요." });
    return;
  }
  // 결제 성공 페이지가 주문 생성에 쓸 값(적용 쿠폰/상품합계/캐시) — 주문은 쿠폰 1개만 받으므로 주문 → 상품 → 배송비 순으로 첫 번째를 보낸다
  const provider = getPayProvider(payMethod.value);
  try {
    sessionStorage.setItem("checkout_ctx", JSON.stringify({ couponId: (appliedCoupons.order ?? Object.values(appliedCoupons.product).find((c) => c) ?? appliedCoupons.shipping)?.couponId, totalAmt: subtotalRef.value, cashUseAmt: cashUse.value, idvId: idv.value?.identityVerificationId, payMethod: payMethod.value, pgCd: provider.pg }));
  } catch {
    /* 저장소를 못 써도 결제는 진행 */
  }
  saveLastPayMethod(payMethod.value); // 다음 주문의 기본 선택
  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const origin = window.location.origin;
  try {
    await provider.request({
      method: payMethod.value,
      amount: total,
      orderId,
      orderName: "shopjoy 주문",
      successUrl: `${origin}/checkout/success`,
      failUrl: `${origin}/checkout/fail`,
      customerKey: useAuthStore().user?.memberId || "@@ANONYMOUS", // 비회원은 토스 ANONYMOUS 키
      customerEmail: billingForm.email || undefined,
      customerName: billingForm.name || undefined,
    });
  } catch (e) {
    if ((e as { code?: string })?.code === "USER_CANCEL") return; // 사용자가 결제창을 닫음
    await showPayFail(payErrMsg(e));
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
    return removeCoupon(String(param));
  // 내 주소 목록에서 배송지 선택
  } else if (cmd === "addr-list") {
    addrManageRef.value?.show();
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

<style scoped>
/* 주문/결제 화면 글꼴·스타일 통일 — 섹션 제목(co-title)·소제목(co-sub)·표 글자를 한 벌로 */
.co-title { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; padding: 0 0 10px; border-bottom: 1px solid #ececec; font-size: 1.1rem !important; font-weight: 700 !important; line-height: 1.3; color: #111827; letter-spacing: 0; }
.co-num { display: inline-flex; width: 24px; height: 24px; align-items: center; justify-content: center; border-radius: 9999px; background: #111827; color: #fff; font-size: 0.75rem; font-weight: 700; }
.co-sub { margin: 0 0 10px; font-size: 0.95rem !important; font-weight: 700 !important; line-height: 1.3; color: #111827; letter-spacing: 0; }
.co-sub label { margin: 0; font-size: inherit !important; font-weight: inherit !important; color: inherit !important; }
.co-mini { padding: 6px 12px; border: 0; border-radius: 6px; color: #fff; font-size: 0.75rem; font-weight: 600; white-space: nowrap; cursor: pointer; }
.co-mini-green { background: #22c55e; }
.co-mini-green:hover { background: #16a34a; }
.co-mini-dark { background: #1f2937; }
.co-mini-dark:hover { background: #111827; }
.your-order-table :deep(table), .your-order-table :deep(th), .your-order-table :deep(td) { font-size: 0.88rem; }
</style>
