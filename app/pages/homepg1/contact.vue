<template>
  <!-- 고객센터(문의하기) — 상담 신청 양식 + 연락처·자주 묻는 질문. 접수하면 ecBeBo 고객문의(sy_contact, 유형 "솔루션 상담")로 저장되고
       접수번호를 알려 준다. 담당자는 BO 문의관리(사이트 SI260004)에서 확인·답변한다. ?service=관심서비스, ?pid=상품번호 로 미리 골라 둘 수 있다.
       원본 pages/Contact.js 는 "준비중" 토스트만 띄우고 저장하지 않았다. -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 28px">
        <div class="hp-pill hp-pill--blue">고객센터</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px">무엇이든 <span class="gradient-text">물어보세요</span></h1>
        <p class="section-subtitle">1~2 영업일 내 전문 담당자가 답변드립니다.</p>
      </div>
      <div class="contact-grid">
        <form class="card card--static" style="padding: 32px" novalidate @submit.prevent="handleBtnAction('contact-submit')">
          <h2 style="font-size: 1rem; font-weight: 700; margin-bottom: 22px; color: var(--text-primary)">✉️ 문의 양식</h2>
          <div v-if="product" class="contact-product">
            <span style="font-size: 1.4rem">{{ product.emoji }}</span>
            <div style="flex: 1; min-width: 0">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600">문의 상품</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary)">{{ product.productName }} <span style="color: var(--blue); font-weight: 600">· {{ product.price }}</span></div>
            </div>
            <button type="button" class="contact-product-x" aria-label="문의 상품 빼기" @click="handleBtnAction('product-clear')">✕</button>
          </div>
          <div class="form-grid">
            <div>
              <label class="form-label" for="hp-contact-name">담당자명<span class="form-required">*</span></label>
              <input id="hp-contact-name" v-model="form.name" class="form-input" :class="{ 'is-invalid': errors.name }" placeholder="홍길동" autocomplete="name" @input="clear('name')" />
              <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
            </div>
            <div>
              <label class="form-label" for="hp-contact-email">이메일<span class="form-required">*</span></label>
              <input id="hp-contact-email" v-model="form.email" class="form-input" :class="{ 'is-invalid': errors.email }" type="email" placeholder="hello@company.kr" autocomplete="email" @input="clear('email')" />
              <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
            </div>
            <div>
              <label class="form-label" for="hp-contact-company">회사명<span class="form-required">*</span></label>
              <input id="hp-contact-company" v-model="form.company" class="form-input" :class="{ 'is-invalid': errors.company }" placeholder="(주)회사명" autocomplete="organization" @input="clear('company')" />
              <div v-if="errors.company" class="form-error">{{ errors.company }}</div>
            </div>
            <div>
              <label class="form-label" for="hp-contact-tel">연락처</label>
              <input id="hp-contact-tel" v-model="form.tel" class="form-input" placeholder="010-0000-0000" autocomplete="tel" />
            </div>
          </div>
          <div style="margin-bottom: 16px">
            <label class="form-label" for="hp-contact-service">관심 서비스</label>
            <select id="hp-contact-service" v-model="form.service" class="form-input">
              <option value="">선택 (선택사항)</option>
              <option v-for="c in HP_CONTACT_SERVICES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div style="margin-bottom: 22px">
            <label class="form-label" for="hp-contact-desc">문의 내용<span class="form-required">*</span></label>
            <textarea id="hp-contact-desc" v-model="form.desc" class="form-input" :class="{ 'is-invalid': errors.desc }" rows="5" placeholder="문의하실 내용을 자유롭게 입력해주세요. (최소 10자)" @input="clear('desc')"></textarea>
            <div v-if="errors.desc" class="form-error">{{ errors.desc }}</div>
          </div>
          <button type="submit" class="btn-blue" style="width: 100%; padding: 13px" :disabled="submitting">{{ submitting ? "접수 중…" : "문의 접수하기" }}</button>
        </form>

        <div style="display: flex; flex-direction: column; gap: 18px">
          <div class="card card--static" style="padding: 24px">
            <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 16px; color: var(--text-primary)">📋 연락처</h3>
            <div class="info-row"><span class="info-icon">📞</span><div><div class="info-label">전화</div><div class="info-val"><a :href="`tel:${HP_SITE.tel}`">{{ HP_SITE.tel }}</a></div></div></div>
            <div class="info-row"><span class="info-icon">📧</span><div><div class="info-label">이메일</div><div class="info-val"><a :href="`mailto:${HP_SITE.email}`">{{ HP_SITE.email }}</a></div></div></div>
            <div class="info-row"><span class="info-icon">🕘</span><div><div class="info-label">운영 시간</div><div class="info-val">{{ HP_SITE.hours }}</div></div></div>
          </div>
          <div class="card card--static" style="padding: 24px">
            <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 4px; color: var(--text-primary)">❓ 자주 묻는 질문</h3>
            <div v-for="(faq, idx) in HP_FAQS.slice(0, 3)" :key="idx" class="faq-item">
              <button type="button" class="faq-question" :aria-expanded="openFaq === idx" @click="openFaq = openFaq === idx ? null : idx">
                <span>{{ faq.q }}</span>
                <span class="chevron" :class="{ open: openFaq === idx }">▼</span>
              </button>
              <div v-show="openFaq === idx" class="faq-answer">{{ faq.a }}</div>
            </div>
            <nuxt-link to="/faq" class="btn-outline btn-sm" style="margin-top: 12px; width: 100%">전체 FAQ 보기</nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import * as yup from "yup";
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_CONTACT_SERVICES, HP_FAQS, HP_INQUIRY_CONSULT, HP_SITE, hpCategoryLabel, hpProductById } from "~/conts/tenant/homepg1";
import { hpToast } from "~/layout/homepg1/hpUi";
import { coContactSvc } from "~/svc/fo/ec/cm/coContactSvc";

useHead({ title: "고객센터" });
const route = useRoute();
const { openAlert } = useAlert();

/** 상품 상세·목록에서 "도입 문의"로 들어오면 그 상품, 솔루션 안내에서 들어오면 관심 서비스를 미리 골라 둔다 */
const productId = ref(Number(route.query.pid) || 0);
const product = computed(() => hpProductById(productId.value));
const serviceQ = typeof route.query.service === "string" && HP_CONTACT_SERVICES.includes(route.query.service) ? route.query.service : "";

const form = reactive({ name: "", email: "", company: "", tel: "", service: serviceQ, desc: "" });
const schema = yup.object({
  name: yup.string().trim().required("담당자명을 입력해주세요").min(2, "담당자명은 최소 2자 이상 입력해주세요"),
  email: yup.string().trim().required("이메일을 입력해주세요").email("유효한 이메일 형식이 아닙니다"),
  company: yup.string().trim().required("회사명을 입력해주세요"),
  desc: yup.string().trim().required("문의 내용을 입력해주세요").min(10, "문의 내용은 최소 10자 이상 입력해주세요"),
});
const { errors, validate } = useFoValidate(schema, form);
const clear = (k: string) => delete errors[k];
const openFaq = ref<number | null>(null);
const submitting = ref(false);

/** 담당자가 BO 문의관리에서 바로 읽을 수 있게 */
function contactMessage(): string {
  const p = product.value;
  return [
    `■ 회사명: ${form.company.trim()}`,
    `■ 관심 서비스: ${form.service || "(선택 안 함)"}`,
    ...(p ? [`■ 문의 상품: ${p.productName} (상품번호 ${p.productId}, ${hpCategoryLabel(p)}, ${p.price})`] : []),
    "",
    "[문의 내용]",
    form.desc.trim(),
  ].join("\n");
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "contact-submit") {
    if (submitting.value || !(await validate())) return;
    submitting.value = true;
    try {
      const email = form.email.trim();
      const saved = await coContactSvc.submitReceipt({
        inquiryType: HP_INQUIRY_CONSULT,
        name: form.name.trim(),
        email,
        tel: form.tel.trim() || undefined,
        message: contactMessage(),
      });
      Object.assign(form, { name: "", email: "", company: "", tel: "", service: "", desc: "" });
      productId.value = 0;
      hpToast("문의가 접수되었습니다.", "success");
      await openAlert({
        title: "문의 접수 완료",
        message: "1~2 영업일 내 전문 담당자가 답변드립니다.",
        variant: "success",
        details: [
          { label: "접수번호", value: saved?.contactId ?? "-" },
          { label: "답변 받을 이메일", value: email },
        ],
      });
    } catch (e) {
      const msg = (e as { statusMessage?: string })?.statusMessage || "잠시 후 다시 시도해 주세요.";
      console.error("[문의 접수] 실패:", e);
      openAlert({ title: "문의 접수 실패", message: `${msg}\n급하시면 ${HP_SITE.tel} 로 연락 주세요.`, variant: "error" });
    } finally {
      submitting.value = false;
    }
    return;
  }
  if (cmd === "product-clear") {
    productId.value = 0;
    return navigateTo({ query: { ...route.query, pid: undefined } }, { replace: true });
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>

<style scoped>
.contact-product {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 18px;
  border-radius: 12px;
  background: var(--blue-dim);
  border: 1px solid var(--border);
}
.contact-product-x {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 1rem;
  padding: 4px;
}
.contact-product-x:hover {
  color: var(--text-primary);
}
</style>
