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
                    <span v-if="myCoupons.length" class="ml-2 text-[12px] font-normal text-[#999]">보유 {{ myCoupons.length }}장</span>
                  </h3>
                  <div v-if="appliedCouponList.length" class="coupon-checkout-content">
                    <ul class="mt-10">
                      <li v-for="c in appliedCouponList" :key="c.couponId" class="text-[14px] text-[#606060] mb-5">
                        <span class="mr-1 text-[12px] text-[#999]">[{{ COUPON_CATEGORY_LABEL[c.category] }}]</span>{{ c.name }}
                        <b class="ml-1 text-[#c0392b]">-{{ formatPrice(discountOfCategory(c.category)) }}</b>
                        <span class="ml-1 text-[11px] text-[#999]">({{ touched[c.category] ? "직접 선택" : "자동 적용" }})</span>
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
                                    배송비: <span class="amount">{{ formatPrice(7000) }}</span>
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
                          <tr v-if="cashUse > 0" class="order-total">
                            <th>캐시 사용</th>
                            <td>
                              <span class="amount text-danger">-{{ formatPrice(cashUse) }}</span>
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

                    <!-- 비회원 결제: PASS 본인인증 (로그인 회원은 생략) -->
                    <div v-if="!loggedIn" class="mb-4 rounded-lg border px-4 py-3 text-[0.88rem]" :class="idv ? 'border-[#bbf7d0] bg-[#f0fdf4]' : 'border-[#fde68a] bg-[#fffbeb]'">
                      <div class="flex items-center gap-2">
                        <i class="fas" :class="idv ? 'fa-check-circle text-[#16a34a]' : 'fa-mobile-alt text-[#d97706]'"></i>
                        <span class="font-semibold text-gray-800">비회원 결제 본인인증 (PASS)</span>
                        <button
                          v-if="!idv"
                          type="button"
                          class="ml-auto cursor-pointer rounded-md border-0 bg-[#111] px-3 py-1.5 text-[0.8rem] font-bold text-white disabled:opacity-60"
                          :disabled="idvBusy"
                          @click="startIdentity"
                        >
                          {{ idvBusy ? "인증 중..." : "PASS 본인인증" }}
                        </button>
                        <button v-else type="button" class="ml-auto cursor-pointer border-0 bg-transparent p-0 text-[0.78rem] text-gray-500 underline" @click="resetIdentity">다시 인증</button>
                      </div>
                      <p v-if="!idv" class="m-0 mt-1 text-[0.78rem] text-gray-500">비회원은 주문 전에 PASS 로 본인 확인을 해야 합니다. 인증한 이름·휴대폰이 주문 정보에 채워집니다.</p>
                      <p v-else class="m-0 mt-1 text-[0.8rem] text-gray-700">
                        인증 완료 · {{ maskName(idv.name) }} · {{ maskPhone(idv.phoneNumber) }}
                      </p>
                      <p v-if="idvError" class="m-0 mt-1 whitespace-pre-line text-[0.78rem] text-red-500">{{ idvError }}</p>
                    </div>

                    <!-- 캐시(적립금): 보유 캐시를 최대로 쓸지 선택 -->
                    <div v-if="loggedIn" class="mb-4 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-[0.88rem]">
                      <label class="m-0 flex cursor-pointer items-center gap-2" :class="cashBalance <= 0 ? 'cursor-not-allowed opacity-60' : ''">
                        <input v-model="useMaxCash" type="checkbox" :disabled="cashBalance <= 0" />
                        <span class="font-semibold text-gray-800">보유 캐시 최대 사용</span>
                        <span class="ml-auto text-gray-500">보유 <b class="text-gray-800">{{ formatPrice(cashBalance) }}</b></span>
                      </label>
                      <div v-if="useMaxCash && cashUse > 0" class="mt-1 text-[0.8rem] text-[#c0392b]">이번 주문에 {{ formatPrice(cashUse) }} 사용 · 결제 금액 {{ formatPrice(orderTotalRef) }}</div>
                      <div v-else-if="cashBalance <= 0" class="mt-1 text-[0.78rem] text-gray-400">사용할 수 있는 캐시가 없습니다.</div>
                    </div>

                    <div class="payment-method">
                      <!-- 2026-09-20(요청사항: "주문하기 토스페이먼트 연동") — 토스 결제위젯(v2). 결제수단/약관 UI 는 토스가 이 컨테이너 안에 그린다 -->
                      <div id="toss-payment-method"></div>
                      <div id="toss-agreement"></div>
                      <div v-if="tossStatus === 'idle'" class="rounded-lg border border-dashed border-[#d1d5db] bg-[#fafafa] px-4 py-5 text-center text-[0.85rem] text-gray-500">결제 금액이 100원 이상이면 결제수단이 표시됩니다.</div>
                      <div v-else-if="tossStatus === 'loading'" class="rounded-lg bg-[#fafafa] px-4 py-5 text-center text-[0.85rem] text-gray-500"><i class="fas fa-spinner fa-spin mr-1.5"></i>결제수단을 불러오는 중…</div>
                      <!-- 연동 실패: 오류 + 설정된 키 정보(가운데 마스킹) -->
                      <div v-else-if="tossStatus === 'error'" class="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-left">
                        <div class="mb-2 text-[0.9rem] font-bold text-red-600"><i class="fas fa-exclamation-triangle mr-1.5"></i>토스페이먼츠 연동에 실패했습니다</div>
                        <div class="mb-3 whitespace-pre-line text-[0.82rem] leading-relaxed text-gray-700">{{ tossError }}</div>
                        <dl class="m-0 rounded-lg border border-red-100 bg-white px-3 py-2">
                          <div v-for="d in tossKeyInfo()" :key="d.label" class="flex items-baseline justify-between gap-3 py-0.5 text-[0.78rem]">
                            <dt class="shrink-0 text-gray-500">{{ d.label }}</dt>
                            <dd class="m-0 min-w-0 break-all text-right font-mono font-semibold text-gray-800">{{ d.value }}</dd>
                          </div>
                        </dl>
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
    <coupon-modal ref="couponModalRef" :coupons="myCoupons" :applied-coupons="appliedCoupons" :subtotal="subtotalRef" :bases="couponBaseAmts" @apply="handleApplyCoupons" />
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
import AddrSearchModal from "~/components/modals/AddrSearchModal.vue";
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useCartStore } from "~/store/useCartStore";
import { useAuthStore } from "~/store/useAuthStore";
import { myAddrSvc } from "~/svc/fo/ec/my/myAddrSvc";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import type { SyCheckoutLoginFormType } from "~/types/sy/syCheckoutLoginFormType";
import type { AppliedCoupons, CouponCategory, PmCouponApplyType } from "~/types/pm/pmCouponApplyType";
import { COUPON_CATEGORIES, COUPON_CATEGORY_LABEL, calcCheckout, couponBases, couponBlockReason, pickBestCoupon, toApplyCoupon, todayYmd } from "~/utils/mapCoupon";
import { myCouponSvc } from "~/svc/fo/my/myCouponSvc";
import { identitySvc } from "~/svc/co/identity/identitySvc";
import type { MbIdentityVerifyType } from "~/types/mb/mbIdentityVerifyType";
import { maskName, maskPhone, usePassIdentity } from "~/composables/usePassIdentity";
import type { OdTossPaymentsFactoryType, OdTossWidgetsType } from "~/types/od/odTossType";

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
/** "경기 성남시 중원구 …" → 시/도, 시/군/구 (주소 검색 모달이 채우는 값과 같은 모양) */
function splitAddr(addr: string): { sido: string; sigungu: string } {
  const [sido = "", ...rest] = addr.trim().split(/\s+/);
  const sigungu = rest[0] && rest[1] && /시$/.test(rest[0]) && /[구군]$/.test(rest[1]) ? `${rest[0]} ${rest[1]}` : (rest[0] ?? "");
  return { sido, sigungu };
}

/** 자동입력 — 로그인 회원이면 내 정보(프로필) + 기본 배송지로 결제 정보를 채운다(값이 있는 항목만). 비로그인은 테스트용 기본값 */
async function handleAutoFillBilling() {
  const authStore = useAuthStore();
  if (!authStore.isStLoggedIn) {
    billingForm.name = "홍길동";
    billingForm.lastName = billingForm.lastName || "-";
    billingForm.email = billingForm.email || "illeesam@gmail.com";
    billingForm.phone = billingForm.phone || "01038050206";
    return;
  }
  try {
    const [profile, addrs] = await Promise.all([myInfoSvc.getProfile(), myAddrSvc.getMyAddrs()]);
    const addr = addrs.find((a) => a.defaultYn === "Y") ?? addrs[0];
    const fullNm = (profile.memberNm || addr?.recvNm || authStore.user?.userNm || "").trim();
    if (fullNm) {
      // 한글 3~4글자 이름은 첫 글자가 성, 나머지가 이름. 그 밖의 이름은 그대로 이름에 넣는다(성은 "-")
      const koreanFull = /^[가-힣]{3,4}$/.test(fullNm);
      billingForm.lastName = koreanFull ? fullNm.slice(0, 1) : billingForm.lastName || "-";
      billingForm.name = koreanFull ? fullNm.slice(1) : fullNm;
    }
    billingForm.email = profile.memberEmail || profile.loginId || authStore.user?.userEmail || billingForm.email;
    billingForm.phone = addr?.recvPhone || profile.memberPhone || billingForm.phone;
    const address = addr?.addr || profile.memberAddr;
    if (address) {
      billingForm.address = address;
      billingForm.addressDetail = addr?.addrDetail || profile.memberAddrDetail || billingForm.addressDetail;
      billingForm.zipCode = addr?.zipCode || profile.memberZipCode || billingForm.zipCode;
      Object.assign(billingForm, splitAddr(address));
    }
  } catch (err) {
    console.warn("[checkout] 자동입력 실패:", err);
    useNuxtApp().$toast.error("내 정보를 불러오지 못했습니다.");
  }
}

const addrSearchModalRef = ref<InstanceType<typeof AddrSearchModal> | null>(null);
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
const appliedCoupons = reactive<AppliedCoupons>({ order: null, product: null, shipping: null });
const appliedCouponList = computed(() => COUPON_CATEGORIES.map((cat) => appliedCoupons[cat]).filter((c): c is NonNullable<typeof c> => c !== null));
const myCoupons = ref<PmCouponApplyType[]>([]); // 내 쿠폰(로그인 시)
const cashBalance = ref(0); // 보유 캐시
const useMaxCash = ref(false); // 보유 캐시 최대 사용
const touched = reactive<Record<CouponCategory, boolean>>({ order: false, product: false, shipping: false }); // 직접 고른 종류는 자동 적용이 덮어쓰지 않는다
const loggedIn = computed(() => useAuthStore().isStLoggedIn);
function handleApplyCoupons(coupons: AppliedCoupons) {
  COUPON_CATEGORIES.forEach((cat) => {
    // 모달에서 자동 적용과 다른 선택을 하면 "직접 선택"으로 본다
    touched[cat] = coupons[cat]?.couponId !== autoPick(cat)?.couponId;
    appliedCoupons[cat] = coupons[cat];
  });
}
function removeCoupon(category: CouponCategory) {
  touched[category] = true;
  appliedCoupons[category] = null;
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
  if (v) applyIdentity(v);
}
onMounted(() => {
  // 새로고침해도 인증 결과 유지(같은 탭 동안)
  try {
    const raw = sessionStorage.getItem("checkout_idv");
    if (raw && !useAuthStore().isStLoggedIn) applyIdentity(JSON.parse(raw));
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

/** 이 종류의 "기본 적용" 쿠폰(혜택 최대, 같으면 종료 빠른 순) — 상품할인 적용 후 금액이 주문할인 기준 */
function autoPick(cat: CouponCategory): PmCouponApplyType | null {
  const today = todayYmd();
  const sub = subtotalRef.value;
  const pool = myCoupons.value.filter((c) => c.category === cat);
  const productBest = pickBestCoupon(myCoupons.value.filter((c) => c.category === "product"), sub, sub, today);
  const productApplied = touched.product ? appliedCoupons.product : productBest;
  const bases = couponBases(sub, baseShip.value, { order: null, product: productApplied, shipping: null });
  return pickBestCoupon(pool, bases[cat], sub, today);
}
// 금액/쿠폰이 바뀌면 직접 고르지 않은 종류는 자동(최대 혜택)으로, 직접 고른 쿠폰이 쓸 수 없게 되면 해제
watch(
  [subtotalRef, baseShip, myCoupons],
  () => {
    COUPON_CATEGORIES.forEach((cat) => {
      if (!touched[cat]) appliedCoupons[cat] = autoPick(cat);
      else if (appliedCoupons[cat] && couponBlockReason(appliedCoupons[cat]!, subtotalRef.value, todayYmd())) appliedCoupons[cat] = null;
    });
  },
  { immediate: true }
);

const calc = computed(() => calcCheckout(subtotalRef.value, baseShip.value, appliedCoupons, cashBalance.value, useMaxCash.value));
const orderTotalRef = computed(() => calc.value.total); // 최종 결제 금액(토스 결제 금액)
const couponDiscountTotal = computed(() => calc.value.couponTotal);
const cashUse = computed(() => calc.value.cashUse);
const couponBaseAmts = computed(() => couponBases(subtotalRef.value, baseShip.value, appliedCoupons)); // 쿠폰 모달 미리보기용
const discountOfCategory = (cat: CouponCategory) => ({ product: calc.value.productDiscount, order: calc.value.orderDiscount, shipping: calc.value.shipDiscount })[cat];


// ── 토스페이먼츠 결제위젯 SDK v2 (클라이언트 전용) — 2026-09-20: 이 화면에서만 쓰는 useTossPayments 컴포저블을 이 파일로 병합 ──
// 설정된 키(test_gck_…)는 "결제위젯 연동 키"라 결제창(payment()) 방식이 아니라 widgets() 로 연동한다.
// @see https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
const TOSSPAYMENTS_SCRIPT = "https://js.tosspayments.com/v2/standard";
const TOSS_MIN_AMOUNT = 100; // 토스 최소 결제금액(원)
const publicCfg = useRuntimeConfig().public as { tossPaymentClientKey?: string; mode?: string };
const tossClientKey = publicCfg.tossPaymentClientKey;
const tossStatus = ref<"idle" | "loading" | "ready" | "error">("idle");
const tossError = ref("");
let tossWidgets: OdTossWidgetsType | null = null;

/** 키의 가운데를 *** 로 가린다(앞 8자·뒤 4자만 노출) */
const maskKey = (k?: string) => (!k ? "(미설정)" : k.length <= 12 ? "***" : `${k.slice(0, 8)}***${k.slice(-4)}`);
/** 연동 실패 시 보여줄 설정 정보 — 실행 모드 + 마스킹한 클라이언트 키 */
function tossKeyInfo(): { label: string; value: string }[] {
  const k = tossClientKey ?? "";
  const kind = k.includes("_gck_") ? "결제위젯 연동 키" : k.includes("_ck_") ? "API 개별 연동 키" : k ? "알 수 없음" : "-";
  return [
    { label: "실행 모드(RUN_MODE)", value: publicCfg.mode ?? "-" },
    { label: "클라이언트 키", value: maskKey(k) },
    { label: "키 종류", value: kind },
  ];
}
function showTossFail(message: string) {
  return useAlert().openAlert({ title: "결제 연동 실패", variant: "error", message, details: tossKeyInfo() });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("토스페이먼츠 SDK 스크립트를 불러오지 못했습니다. 네트워크를 확인해 주세요."));
    document.head.appendChild(script);
  });
}
const tossErrMsg = (e: unknown) => {
  const err = e as { code?: string; message?: string };
  return `${err?.message ?? "알 수 없는 오류"}${err?.code ? `\n(오류 코드: ${err.code})` : ""}`;
};

// 결제 금액이 정해지면 결제위젯(결제수단/약관)을 그린다. 금액이 바뀌면 setAmount 만 다시 호출한다.
async function initTossWidgets() {
  if (import.meta.server || tossStatus.value === "loading") return;
  const total = orderTotalRef.value;
  if (total < TOSS_MIN_AMOUNT) {
    if (tossStatus.value !== "error") tossStatus.value = "idle";
    return;
  }
  if (!tossClientKey) {
    tossStatus.value = "error";
    tossError.value = "토스페이먼츠 클라이언트 키가 설정되지 않았습니다.\n(.env 의 NUXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY)";
    return;
  }
  tossStatus.value = "loading";
  try {
    if (!tossWidgets) {
      await loadScript(TOSSPAYMENTS_SCRIPT);
      const TossPayments = (window as unknown as { TossPayments?: OdTossPaymentsFactoryType }).TossPayments;
      if (!TossPayments) throw new Error("토스페이먼츠 SDK 를 초기화하지 못했습니다.");
      const customerKey = useAuthStore().user?.memberId || "@@ANONYMOUS"; // 비회원은 토스 ANONYMOUS 키
      const w = TossPayments(tossClientKey).widgets({ customerKey });
      await w.setAmount({ currency: "KRW", value: total });
      await Promise.all([w.renderPaymentMethods({ selector: "#toss-payment-method", variantKey: "DEFAULT" }), w.renderAgreement({ selector: "#toss-agreement", variantKey: "AGREEMENT" })]);
      tossWidgets = w;
    } else {
      await tossWidgets.setAmount({ currency: "KRW", value: total });
    }
    tossStatus.value = "ready";
  } catch (e) {
    tossWidgets = null;
    tossStatus.value = "error";
    tossError.value = tossErrMsg(e);
  }
}
onMounted(initTossWidgets);
watch(orderTotalRef, initTossWidgets);

// 결제 제출(옛 CheckoutArea) — 위젯에서 고른 결제수단으로 결제창을 연다. 성공/실패는 successUrl/failUrl(/checkout/success, /checkout/fail)로 돌아온다
async function handleFormSubmit() {
  if (import.meta.server) return;
  // 비회원은 PASS 본인인증을 마쳐야 주문할 수 있다
  if (!loggedIn.value && !idv.value) {
    await useAlert().openAlert({ title: "본인인증 필요", variant: "warning", message: "비회원 결제는 PASS 본인인증 후 진행할 수 있습니다.\n'PASS 본인인증' 버튼을 눌러 인증해 주세요." });
    document.querySelector(".your-order")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const total = orderTotalRef.value;
  if (total < TOSS_MIN_AMOUNT) {
    await useAlert().openAlert({ title: "주문 금액 확인", variant: "warning", message: `결제 금액이 ${TOSS_MIN_AMOUNT}원 이상이어야 주문할 수 있습니다.
장바구니와 쿠폰 적용 금액을 확인해 주세요.` });
    return;
  }
  if (tossStatus.value !== "ready") await initTossWidgets(); // 아직 준비 안 됐으면(또는 이전에 실패했으면) 한 번 더 시도
  if (tossStatus.value !== "ready" || !tossWidgets) {
    await showTossFail(tossError.value || "결제수단을 불러오지 못했습니다.");
    return;
  }
  // 결제 성공 페이지가 주문 생성에 쓸 값(적용 쿠폰/상품합계/캐시) — 주문은 쿠폰 1개만 받으므로 주문 → 상품 → 배송비 순으로 첫 번째를 보낸다
  try {
    sessionStorage.setItem("checkout_ctx", JSON.stringify({ couponId: (appliedCoupons.order ?? appliedCoupons.product ?? appliedCoupons.shipping)?.couponId, totalAmt: subtotalRef.value, cashUseAmt: cashUse.value, idvId: idv.value?.identityVerificationId }));
  } catch {
    /* 저장소를 못 써도 결제는 진행 */
  }
  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const origin = window.location.origin;
  try {
    await tossWidgets.requestPayment({
      orderId,
      orderName: "shopjoy 주문",
      successUrl: `${origin}/checkout/success`,
      failUrl: `${origin}/checkout/fail`,
      customerEmail: billingForm.email || undefined,
      customerName: billingForm.name || undefined,
    });
  } catch (e) {
    if ((e as { code?: string })?.code === "USER_CANCEL") return; // 사용자가 결제창을 닫음
    await showTossFail(tossErrMsg(e));
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
