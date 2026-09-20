<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="문의하기" subtitle="문의하기" />
    <section class="contact__area pb-100 pt-95">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-6 col-lg-6">
            <div class="contact__info">
              <h3>찾아오시는 길</h3>
              <ul class="mb-55">
                <li v-for="(item, i) in contactInfo" :key="i" class="d-flex mb-35">
                  <div class="contact__info-icon mr-20">
                    <i :class="item.icon"></i>
                  </div>
                  <div class="contact__info-content">
                    <h6>{{ item.title }}:</h6>
                    <span>{{ item.subtitle }}</span>
                  </div>
                </li>
              </ul>
              <p>shopjoy은 고급 관리 기능을 갖춘 프리미엄 템플릿 테마입니다. It’s 맞춤 설정이 쉽고, 반응형이며 레티나 디스플레이를 지원합니다.</p>

              <div class="contact__social">
                <ul>
                  <social colored />
                </ul>
              </div>
            </div>
          </div>
          <div class="col-xl-6 col-lg-6">
            <div class="contact__form">
              <h3>문의하기</h3>
              <!-- 2026-09-20(요청사항: "문의내용에 html editor 및 파일첨부, 연락처·문의유형·주문번호") — ecFeBo Contact 대응.
                   이름/이메일/연락처/주문번호(내 주문 선택)/문의 유형/문의 내용(HTML 에디터)/첨부파일 -->
              <fo-form :columns="formCols" :form="form" :errors="errors" :cols="2" :gap="20" min-col-width="240px" @submit="handleBtnAction('form-submit')">
                <template #orderNoPick>
                  <label class="block text-[0.78rem] text-gray-500 mb-1" for="contact-orderNo">주문번호</label>
                  <div class="flex gap-2">
                    <input id="contact-orderNo" v-model="form.orderNo" class="flex-1 min-w-0 px-[13px] py-[10px] border-[1.5px] border-[#e5e7eb] rounded-lg bg-white text-[#111827] text-[0.88rem] outline-none focus:border-[#bc8246]" type="text" placeholder="직접 입력 또는 주문 선택" maxlength="50" />
                    <button type="button" class="shrink-0 w-11 rounded-lg border border-[#e5e7eb] bg-white cursor-pointer hover:border-theme" :title="isLoggedIn ? '내 주문에서 선택' : '로그인 후 내 주문에서 선택할 수 있습니다'" :disabled="!isLoggedIn" @click="handleBtnAction('orderNo-pick')">📋</button>
                  </div>
                </template>
                <template #descEditor>
                  <label class="block text-[0.78rem] text-gray-500 mb-1">문의 내용<span class="text-theme ml-0.5">*</span></label>
                  <ClientOnly>
                    <html-editor v-model="form.desc" height="220px" placeholder="문의 내용을 입력하세요 (최소 10자)" :invalid="!!errors.desc" />
                    <template #fallback><div class="h-[260px] rounded-lg border border-[#e5e7eb] bg-[#fafafa]"></div></template>
                  </ClientOnly>
                  <div v-if="errors.desc" class="text-[0.78rem] text-red-500 mt-1">{{ errors.desc }}</div>
                </template>
                <template #attach>
                  <label class="block text-[0.78rem] text-gray-500 mb-1">첨부파일</label>
                  <attach-uploader v-model="attachFiles" />
                </template>
                <template #actions>
                  <div class="flex justify-end mt-2">
                    <button type="submit" class="px-6 py-3 bg-gray-900 text-white border-0 rounded-lg text-[0.88rem] font-bold cursor-pointer disabled:opacity-60" :disabled="submitting">{{ submitting ? "접수 중…" : "문의 접수하기" }}</button>
                  </div>
                </template>
              </fo-form>
              <order-pick-modal ref="orderPickRef" @select="(id) => (form.orderNo = id)" />
              <!-- 폼 끝 -->
            </div>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import Social from "~/components/social/Social.vue";
import type { CoContactInfoItemType } from "~/types/coContactInfoItemType";
import FoForm from "~/components/fo/FoForm.vue";
import { useFoValidate } from "~/composables/useFoValidate";
import type { FoFormColumn } from "~/types/foCompType";
import * as yup from "yup";
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";
import { coContactSvc } from "~/svc/fo/ec/cm/coContactSvc";
import { useAuthStore } from "~/store/useAuthStore";
import HtmlEditor from "~/components/ui/HtmlEditor.vue";
import AttachUploader from "~/components/ui/AttachUploader.vue";
import OrderPickModal from "~/components/modals/OrderPickModal.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "문의하기",
});
usePageTitle("문의하기");

// 전시 위젯(area_cd=CONTACT_INFO_MAIN)에서 연락처 정보 로드 — 미등록/조회실패 시 기본값 폴백
// (2026-09-13, [[ecfefonuxt4-dp-widget-migration]]).
const DEFAULT_CONTACT_INFO: CoContactInfoItemType[] = [
  {
    icon: "fal fa-map-marker-alt",
    title: "주소",
    subtitle: "성남시 중원구 성남대로 997 (여수동)",
  },
  {
    icon: "fal fa-envelope-open-text",
    title: "이메일",
    subtitle: "illeesam@gmail.com",
  },
  {
    icon: "fal fa-phone-alt",
    title: "연락처",
    subtitle: "(010) 3805 0206",
  },
];
// 2026-09-13(성능 개선): lazy:true + computed — 화면 마운트를 블로킹하지 않으면서도
// 늦게 도착한 데이터가 contactInfo에 반영되게 한다.
const { data: fetchedContactInfo } = useAsyncData<CoContactInfoItemType[] | null>(
  "dp-contact-info-main",
  () => dpAreaSvc.getFirstWidgetConfig<CoContactInfoItemType[]>("CONTACT_INFO_MAIN"),
  { lazy: true }
);
const contactInfo = computed<CoContactInfoItemType[]>(() => fetchedContactInfo.value?.length ? fetchedContactInfo.value : DEFAULT_CONTACT_INFO);

// 문의 유형 — ecFeBo 사이트 설정(shopjoy_contact_inquiry)과 동일한 고정 목록
const INQUIRY_TYPES = ["주문·결제 문의", "배송 문의", "교환·반품 문의", "상품 문의", "기타 문의"].map((v) => ({ value: v, label: v }));
const MESSAGE_MAX = 4000; // ecBeBo CmContactSubmitDto.message @Size(max=4000) — HTML 태그 포함 길이

/** HTML 에디터 값에서 태그를 걷어낸 순수 텍스트(글자수 검증용) */
const descText = (html: string) => String(html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const schema = yup.object({
  name: yup.string().trim().min(2, "이름을 2자 이상 입력해 주세요").required("이름을 입력해 주세요").label("이름"),
  email: yup.string().required("이메일을 입력해 주세요").email("올바른 이메일 주소를 입력해 주세요").label("이메일"),
  tel: yup.string().test("tel", "올바른 연락처 형식이 아닙니다. (예: 010-1234-5678)", (v) => !v || /^[0-9+\-\s()]{9,20}$/.test(v)),
  desc: yup
    .string()
    .test("min", "문의 내용을 최소 10자 이상 입력해 주세요", (v) => descText(v ?? "").length >= 10)
    .test("max", `문의 내용이 너무 깁니다(이미지·서식 포함 ${MESSAGE_MAX}자 이내)`, (v) => (v ?? "").length <= MESSAGE_MAX),
});

const form = reactive({ name: "", email: "", tel: "", orderNo: "", inquiryType: "", desc: "" });
const attachFiles = ref<{ attachId: string; rowStatus: "I" | "D" }[]>([]);
const submitting = ref(false);
const orderPickRef = ref<InstanceType<typeof OrderPickModal> | null>(null);

const formCols: FoFormColumn[] = [
  { key: "name", label: "이름", type: "text", required: true, placeholder: "홍길동" },
  { key: "email", label: "이메일", type: "email", required: true, placeholder: "hello@example.com" },
  { key: "tel", label: "연락처", type: "tel", placeholder: "010-1234-5678" },
  { key: "orderNo", label: "주문번호", type: "slot", name: "orderNoPick" },
  { key: "inquiryType", label: "문의 유형", type: "select", colSpan: 2, options: INQUIRY_TYPES, nullLabel: "선택해주세요 (선택사항)" },
  { key: "desc", label: "문의 내용", type: "slot", name: "descEditor", colSpan: 2 },
  { key: "attach", label: "첨부파일", type: "slot", name: "attach", colSpan: 2 },
];
const { errors, validate } = useFoValidate(schema, form);
// 값을 고치면 해당 필드의 오류 표시를 바로 지운다(에디터는 slot 이라 FoForm 이 자동으로 못 지운다)
for (const k of ["name", "email", "tel", "desc"] as const) watch(() => form[k], () => { delete errors[k]; });

// 로그인 회원이면 이름/이메일/연락처를 미리 채운다(비어 있을 때만)
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isStLoggedIn);
onMounted(() => {
  const u = authStore.user;
  if (!u) return;
  if (!form.name) form.name = u.userNm || "";
  if (!form.email) form.email = u.userEmail || "";
  if (!form.tel) form.tel = u.userPhone || "";
});

async function onSubmit() {
  if (submitting.value || !(await validate())) return;
  submitting.value = true;
  try {
    await coContactSvc.submit({
      inquiryType: form.inquiryType,
      name: form.name.trim(),
      email: form.email.trim(),
      tel: form.tel,
      orderNo: form.orderNo,
      message: form.desc,
      blogAuthor: form.name.trim(),
      attachFiles: attachFiles.value,
    });
    Object.assign(form, { name: form.name, email: form.email, tel: form.tel, orderNo: "", inquiryType: "", desc: "" });
    attachFiles.value = [];
    await useAlert().openAlert("문의가 접수되었습니다. 빠르게 답변드리겠습니다!");
  } catch (e) {
    const err = e as { data?: { message?: string }; statusMessage?: string };
    await useAlert().openAlert(err?.data?.message || err?.statusMessage || "문의 접수 중 오류가 발생했습니다.");
  } finally {
    submitting.value = false;
  }
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ contact.vue : handleBtnAction -> ", cmd, param);
  // 문의 등록(검증 후 전송)
  if (cmd === "form-submit") {
    return onSubmit();
  } else if (cmd === "orderNo-pick") {
    // 내 주문에서 주문번호 선택
    return orderPickRef.value?.show();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
