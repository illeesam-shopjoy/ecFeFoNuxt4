<template>
  <!-- 주문하기 — 상품 선택(?pid=)·주문자 정보·계좌이체 안내. 접수하면 ecBeBo 고객문의(sy_contact, 유형 "솔루션 주문")로 저장되고
       접수번호를 보여 준다(입금 메모용). 담당자는 BO 문의관리(사이트 SI260004)에서 확인·답변한다. 원본 pages/Order.js 는 접수가 저장되지 않았다. -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 28px">
        <div class="hp-pill hp-pill--purple">주문하기</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px">결제 안내</h1>
        <p class="section-subtitle">결제 방식은 <span class="gradient-text" style="font-weight: 800">계좌이체</span>로 진행됩니다.</p>
      </div>

      <!-- 접수 완료 -->
      <div v-if="receipt" class="card card--static order-done" style="margin-bottom: 20px">
        <div class="order-done-icon">✅</div>
        <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary)">주문이 접수되었습니다</h2>
        <p class="section-subtitle">{{ receipt.productName }} · {{ receipt.price }}</p>
        <div class="order-receipt">
          <span style="font-size: 0.75rem; color: var(--text-muted)">접수번호</span>
          <b>{{ receipt.contactId }}</b>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.7; margin-top: 10px">
          입금하실 때 <b>입금자명(주문자명)</b>과 <b>메모에 접수번호</b>를 함께 적어 주세요.<br />
          {{ HP_SITE.bank.account ? `입금 계좌: ${HP_SITE.bank.name} ${HP_SITE.bank.account} (${HP_SITE.bank.holder})` : "입금 계좌는 담당자가 확인 후 이메일·전화로 안내드립니다." }}
        </p>
        <ol class="order-steps">
          <li><b>1️⃣</b>주문 접수</li>
          <li><b>2️⃣</b>담당자 확인·계좌 안내</li>
          <li><b>3️⃣</b>계좌이체</li>
          <li><b>4️⃣</b>입금 확인 후 진행</li>
        </ol>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 18px">
          <nuxt-link to="/products" class="btn-blue">상품 목록으로</nuxt-link>
          <nuxt-link :to="`/contact?pid=${receipt.productId}`" class="btn-outline">추가 문의하기</nuxt-link>
          <button type="button" class="btn-outline" @click="handleBtnAction('order-new')">다른 상품 주문</button>
        </div>
      </div>

      <template v-else>
        <div class="card card--static" style="padding: 28px; margin-bottom: 20px">
          <div style="display: flex; gap: 18px; align-items: flex-start; flex-wrap: wrap">
            <div style="font-size: 2.6rem; line-height: 1">{{ product?.emoji ?? "🧾" }}</div>
            <div style="flex: 1; min-width: 220px">
              <label class="form-label" for="hp-order-product">주문 상품<span class="form-required">*</span></label>
              <select id="hp-order-product" v-model.number="form.productId" class="form-input" style="max-width: 420px; margin-bottom: 12px" :class="{ 'is-invalid': errors.productId }" @change="clear('productId')">
                <option :value="0" disabled>상품을 선택하세요</option>
                <option v-for="p in HP_ORDERABLE" :key="p.productId" :value="p.productId">{{ p.productName }} — {{ p.price }}</option>
              </select>
              <div v-if="errors.productId" class="form-error" style="margin-top: -8px; margin-bottom: 8px">{{ errors.productId }}</div>
              <template v-if="product">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px">
                  <div style="font-size: 1.25rem; font-weight: 900; color: var(--text-primary)">{{ product.productName }}</div>
                  <span class="badge badge-cat">{{ hpCategoryLabel(product) }}</span>
                </div>
                <div style="font-size: 1.1rem; font-weight: 900; color: var(--blue); margin-bottom: 10px">{{ product.price }}</div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7">{{ product.desc }}</p>
              </template>
            </div>
          </div>
        </div>

        <div class="grid-2" style="gap: 20px; align-items: start">
          <form class="card card--static" style="padding: 28px" novalidate @submit.prevent="handleBtnAction('order-submit')">
            <h2 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px; color: var(--text-primary)">주문자 정보 입력</h2>
            <div class="form-grid">
              <div>
                <label class="form-label" for="hp-order-name">담당자명<span class="form-required">*</span></label>
                <input id="hp-order-name" v-model="form.name" class="form-input" :class="{ 'is-invalid': errors.name }" placeholder="홍길동" autocomplete="name" @input="clear('name')" />
                <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
              </div>
              <div>
                <label class="form-label" for="hp-order-email">이메일<span class="form-required">*</span></label>
                <input id="hp-order-email" v-model="form.email" class="form-input" :class="{ 'is-invalid': errors.email }" type="email" placeholder="hello@company.kr" autocomplete="email" @input="clear('email')" />
                <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
              </div>
              <div>
                <label class="form-label" for="hp-order-company">회사명<span class="form-required">*</span></label>
                <input id="hp-order-company" v-model="form.company" class="form-input" :class="{ 'is-invalid': errors.company }" placeholder="(주)회사명" autocomplete="organization" @input="clear('company')" />
                <div v-if="errors.company" class="form-error">{{ errors.company }}</div>
              </div>
              <div>
                <label class="form-label" for="hp-order-tel">연락처</label>
                <input id="hp-order-tel" v-model="form.tel" class="form-input" placeholder="010-0000-0000" autocomplete="tel" />
              </div>
            </div>
            <div style="margin-bottom: 18px">
              <label class="form-label" for="hp-order-desc">주문 요청사항<span class="form-required">*</span></label>
              <textarea id="hp-order-desc" v-model="form.desc" class="form-input" :class="{ 'is-invalid': errors.desc }" rows="5" placeholder="구성/수량/도입 일정 등 요청사항을 자유롭게 입력해주세요. (최소 10자)" @input="clear('desc')"></textarea>
              <div v-if="errors.desc" class="form-error">{{ errors.desc }}</div>
            </div>
            <button type="submit" class="btn-blue" style="width: 100%; padding: 13px" :disabled="submitting">{{ submitting ? "접수 중…" : "주문 완료" }}</button>
          </form>

          <div class="card card--static" style="padding: 28px">
            <h2 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px; color: var(--text-primary)">결제 안내(계좌이체)</h2>
            <div class="info-row">
              <span class="info-icon">1️⃣</span>
              <div><div class="info-label">계좌이체</div><div class="info-val" style="margin-top: 4px">계좌이체 방식으로 진행됩니다.</div></div>
            </div>
            <div class="info-row">
              <span class="info-icon">2️⃣</span>
              <div>
                <div class="info-label">입금 계좌</div>
                <div class="info-val" style="margin-top: 4px">
                  <span v-if="HP_SITE.bank.account">{{ HP_SITE.bank.name }} {{ HP_SITE.bank.account }}<br />{{ HP_SITE.bank.holder }}</span>
                  <span v-else style="color: var(--text-muted); font-size: 0.85rem">주문 확정 후 계좌번호를 안내드립니다.</span>
                </div>
              </div>
            </div>
            <div class="info-row">
              <span class="info-icon">3️⃣</span>
              <div><div class="info-label">입금 확인</div><div class="info-val" style="margin-top: 4px">입금 확인 후 일정에 맞춰 진행됩니다.</div></div>
            </div>
            <div class="info-row">
              <span class="info-icon">🧾</span>
              <div><div class="info-label">입금자/메모</div><div class="info-val" style="margin-top: 4px">주문자명 + 메모(접수번호)를 함께 부탁드립니다. 접수번호는 주문 완료 후 화면에 표시됩니다.</div></div>
            </div>
            <div class="info-row">
              <span class="info-icon">📞</span>
              <div><div class="info-label">문의 연락처</div><div class="info-val" style="margin-top: 4px">{{ HP_SITE.tel }} / {{ HP_SITE.email }}</div></div>
            </div>
            <nuxt-link :to="product ? `/contact?pid=${product.productId}` : '/contact'" class="btn-outline" style="width: 100%; padding: 12px; margin-top: 18px">문의·상담하기</nuxt-link>
          </div>
        </div>
      </template>
    </div>
  </layout>
</template>

<script setup lang="ts">
import * as yup from "yup";
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_INQUIRY_ORDER, HP_ORDERABLE, HP_SITE, hpCategoryLabel, hpProductById, hpRememberProduct } from "~/conts/tenant/homepg1";
import { hpToast } from "~/layout/homepg1/hpUi";
import { coContactSvc } from "~/svc/fo/ec/cm/coContactSvc";

useHead({ title: "주문하기" });
const route = useRoute();
const { openAlert } = useAlert();

/** 주문 상품 — ?pid= (판매중 상품만). 없으면 고르게 한다 */
const pidOf = (v: unknown) => (HP_ORDERABLE.some((p) => p.productId === Number(v)) ? Number(v) : 0);
const form = reactive({ productId: pidOf(route.query.pid), name: "", email: "", company: "", tel: "", desc: "" });
const product = computed(() => hpProductById(form.productId));
watch(() => form.productId, (id) => {
  if (!id) return;
  hpRememberProduct(id);
  navigateTo({ query: { ...route.query, pid: String(id) } }, { replace: true });
});

const schema = yup.object({
  productId: yup.number().min(1, "주문할 상품을 선택해주세요"),
  name: yup.string().trim().required("담당자명을 입력해주세요").min(2, "담당자명은 최소 2자 이상 입력해주세요"),
  email: yup.string().trim().required("이메일을 입력해주세요").email("유효한 이메일 형식이 아닙니다"),
  company: yup.string().trim().required("회사명을 입력해주세요"),
  desc: yup.string().trim().required("주문 요청사항을 입력해주세요").min(10, "주문 요청사항은 최소 10자 이상 입력해주세요"),
});
const { errors, validate, clear: clearAll } = useFoValidate(schema, form);
const clear = (k: string) => delete errors[k];

const submitting = ref(false);
const receipt = ref<{ contactId: string; productId: number; productName: string; price: string } | null>(null);

/** 담당자가 BO 문의관리에서 바로 읽을 수 있게 주문 내용을 한 덩어리로 */
function orderMessage(): string {
  const p = product.value!;
  return [
    `■ 주문 상품: ${p.productName} (상품번호 ${p.productId})`,
    `■ 카테고리: ${hpCategoryLabel(p)}`,
    `■ 가격: ${p.price}`,
    `■ 회사명: ${form.company.trim()}`,
    `■ 결제: 계좌이체`,
    "",
    "[주문 요청사항]",
    form.desc.trim(),
  ].join("\n");
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "order-submit") {
    if (submitting.value || !(await validate())) return;
    submitting.value = true;
    try {
      const saved = await coContactSvc.submitReceipt({
        inquiryType: HP_INQUIRY_ORDER,
        name: form.name.trim(),
        email: form.email.trim(),
        tel: form.tel.trim() || undefined,
        message: orderMessage(),
      });
      const p = product.value!;
      receipt.value = { contactId: saved?.contactId ?? "-", productId: p.productId, productName: p.productName, price: p.price };
      Object.assign(form, { name: "", email: "", company: "", tel: "", desc: "" });
      clearAll();
      hpToast("주문이 접수되었습니다. 계좌이체로 진행해주세요.", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const msg = (e as { statusMessage?: string })?.statusMessage || "잠시 후 다시 시도해 주세요.";
      console.error("[주문 접수] 실패:", e);
      openAlert({ title: "주문 접수 실패", message: `${msg}\n급하시면 ${HP_SITE.tel} 로 연락 주세요.`, variant: "error" });
    } finally {
      submitting.value = false;
    }
    return;
  }
  if (cmd === "order-new") {
    receipt.value = null;
    form.productId = 0;
    return navigateTo({ query: {} }, { replace: true });
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
