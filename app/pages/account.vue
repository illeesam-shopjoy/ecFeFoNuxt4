<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="마이페이지" subtitle="마이페이지" />
    <section class="profile__area pt-120 pb-50 bg-gray-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="profile__basic-inner pb-20 bg-white">
          <div class="row items-center">
            <div class="col-xxl-6 col-md-6">
              <div class="profile__basic d-md-flex items-center">
                <div class="profile__basic-thumb mr-30">
                  <app-image
                    :src="profileImg"
                    alt=""
                    :wrap-style="{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: '0' }"
                    :img-style="{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', display: 'block' }"
                    :skeleton-style="{ width: '80px', height: '80px', borderRadius: '50%' }"
                  />
                </div>
                <div class="profile__basic-content">
                  <h3 class="profile__basic-title">다시 오신 것을 환영합니다 <span>{{ authStore.user?.userNm ?? '사용자' }}</span></h3>
                  <p>{{ cartState.cartProducts.length }}개 상품 담김 <nuxt-link href="/cart">장바구니 보기</nuxt-link></p>
                </div>
              </div>
            </div>
            <div class="col-xxl-6 col-md-6">
              <div class="profile__basic-cart flex items-center justify-content-md-end">
                <div class="cart-info mr-10">
                  <nuxt-link href="/cart">장바구니 보기</nuxt-link>
                </div>
                <div class="cart-item">
                  <nuxt-link href="/cart">
                    <i class="fa-regular fa-basket-shopping"></i>
                    <span class="cart-quantity">{{ cartState.cartProducts.length }}</span>
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="profile__menu pb-70 bg-gray-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="md:col-span-3">
            <div class="profile__menu-left bg-white mb-50 md:mb-0">
              <h3 class="profile__menu-title"><i class="fa fa-list-alt"></i> 메뉴</h3>
              <div class="profile__menu-tab">
                <div class="flex flex-col items-start text-left border-b border-gray-200" id="nav-tab" role="tablist">
                  <button :class="['nav-link py-2 px-3 border-b-2 -mb-px', activeTab === 'account' ? 'border-theme text-theme' : 'border-transparent']" type="button" @click="activeTab = 'account'"><i class="fa fa-user"></i> 마이페이지</button>
                  <button :class="['nav-link py-2 px-3 border-b-2 -mb-px', activeTab === 'order' ? 'border-theme text-theme' : 'border-transparent']" type="button" @click="activeTab = 'order'"><i class="fa fa-file"></i> 주문 내역</button>
                  <button :class="['nav-link py-2 px-3 border-b-2 -mb-px', activeTab === 'password' ? 'border-theme text-theme' : 'border-transparent']" type="button" @click="activeTab = 'password'"><i class="fa fa-lock"></i> 비밀번호 변경</button>
                  <button class="nav-link" @click="logout"><i class="fa fa-sign-out"></i> 로그아웃</button>
                </div>
              </div>
            </div>
          </div>
          <div class="md:col-span-9">
            <div class="profile__menu-right min-w-0">
              <div id="nav-tabContent">
                <div v-show="activeTab === 'account'" id="nav-account" role="tabpanel">
                  <div class="profile__info">
                    <div class="profile__info-top flex justify-between items-center">
                      <h3 class="profile__info-title">프로필 정보</h3>
                      <button class="profile__info-btn" type="button" @click="openProfileEdit"><i class="fa-regular fa-pen-to-square"></i> 프로필 수정</button>
                    </div>
                    <div class="profile__info-wrapper white-bg">
                      <div class="profile__info-item">
                        <p>이름</p>
                        <h4>{{ authStore.user?.userNm ?? '-' }}</h4>
                      </div>
                      <div class="profile__info-item">
                        <p>이메일</p>
                        <h4>
                          <a v-if="authStore.user?.userEmail" :href="`mailto:${authStore.user.userEmail}`">{{ authStore.user.userEmail }}</a>
                          <span v-else>-</span>
                        </h4>
                      </div>
                      <div class="profile__info-item">
                        <p>연락처</p>
                        <h4>{{ authStore.user?.userPhone ?? '-' }}</h4>
                      </div>
                      <div class="profile__info-item">
                        <!-- ecBeBo 로그인 응답에 주소가 없음(mb_member.member_addr는 별도 회원상세 조회가 있어야 채워짐,
                             이번 전환 범위 밖) — 항상 '-' 표시. 회원 상세 프로필 조회 API가 생기면 그때 채울 것. -->
                        <p>주소</p>
                        <h4>-</h4>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-show="activeTab === 'order'" id="nav-order" role="tabpanel">
                  <div class="order__info">
                    <div class="order__info-top flex justify-between items-center">
                      <h3 class="order__info-title">주문 내역</h3>
                      <button type="button" class="order__info-btn"><i class="fa-regular fa-trash-can"></i> 비우기</button>
                    </div>
                    <div class="order__list order__list--wide white-bg table-responsive">
                      <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — 표를 <fo-grid> 로 교체 -->
                      <fo-grid bare :columns="orderCols" :rows="orders" row-key="orderNo">
                        <template #cell-orderNo="{ row }"><td class="order__id text-left">{{ row.orderNo }}</td></template>
                        <template #cell-title="{ row }">
                          <td class="text-left"><nuxt-link href="/prod-dtl" class="order__title">{{ row.title }}</nuxt-link></td>
                        </template>
                        <template #cell-amount="{ row }"><td class="text-right">{{ formatPrice(row.amount) }}</td></template>
                        <template #cell-detail><td class="text-center"><nuxt-link href="/prod-dtl" class="order__view-btn">보기</nuxt-link></td></template>
                      </fo-grid>
                    </div>
                  </div>
                </div>
                <div v-show="activeTab === 'password'" id="nav-password" role="tabpanel">
                  <div class="password__change">
                    <div class="password__change-top">
                      <h3 class="password__change-title">비밀번호 변경</h3>
                    </div>
                    <div class="password__form white-bg">
                      <fo-form :columns="pwCols" :form="pwForm" :cols="1" :gap="16" show-actions submit-label="비밀번호 변경" />
                      <!-- 폼 끝 -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <profile-edit-modal ref="profileEditModalRef" />
  </layout>
</template>

<script setup lang="ts">
import { CDN_URL } from "~/conts/baseConst";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { ref } from "vue";
import { useCartStore } from "~/store/useCartStore";
import { useAuthStore } from "~/store/useAuthStore";
import AppImage from "~/components/ui/AppImage.vue";
import ProfileEditModal from "~/components/modals/ProfileEditModal.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import FoForm from "~/components/fo/FoForm.vue";
import type { FoFormColumn, FoGridColumn } from "~/types/foCompType";
import { useRouter } from "vue-router";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "마이페이지",
});
usePageTitle("마이페이지");

const cartState = useCartStore();
const authStore = useAuthStore();
const profileImg = `${CDN_URL}/cdn/prod/img/testimonial/person-1.jpg`;

const { formatPrice } = usePrice();
const activeTab = ref("account");

// 주문 내역(데모 데이터) — <fo-grid> 컬럼/행
const orderCols: FoGridColumn[] = [
  { key: "orderNo", label: "주문 번호", width: "130px", align: "left" },
  { key: "title", label: "상품명", align: "left" },
  { key: "amount", label: "금액", width: "140px", align: "right" },
  { key: "detail", label: "상세", width: "90px", align: "center" },
];
const orders = [
  { orderNo: "#3520", title: "대학 세미나 시리즈 글로벌.", amount: 144000 },
  { orderNo: "#2441", title: "웹 코딩과 아파치 기초", amount: 59540 },
];
// 비밀번호 변경 폼(데모) — 실제 변경은 헤더 사용자 메뉴의 "비밀번호 변경"(PasswordChangeModal)
const pwForm = reactive({ current: "", next: "", next2: "" });
const pwCols: FoFormColumn[] = [
  { key: "current", label: "현재 비밀번호", type: "password", placeholder: "현재 비밀번호" },
  { key: "next", label: "새 비밀번호", type: "password", placeholder: "새 비밀번호" },
  { key: "next2", label: "비밀번호 확인", type: "password", placeholder: "비밀번호 확인" },
];
const profileEditModalRef = ref<InstanceType<typeof ProfileEditModal> & { show(): void } | null>(null);
const router = useRouter();

function openProfileEdit() {
  profileEditModalRef.value?.show();
}

function logout() {
  authStore.setStLogout();
  router.push("/");
}
</script>
