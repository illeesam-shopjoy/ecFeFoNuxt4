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
                  <social />
                </ul>
              </div>
            </div>
          </div>
          <div class="col-xl-6 col-lg-6">
            <div class="contact__form">
              <h3>문의하기</h3>
              <!-- 폼 시작 -->
              <Form :validation-schema="schema" @submit="onSubmit" id="contact-form">
                <div class="row">
                  <div class="col-xl-6 col-lg-6">
                    <div class="contact__input mb-20">
                      <label>이름 <span class="required">*</span></label>
                      <Field name="name" type="text" />
                      <ErrorMessage name="name" class="text-danger" />
                    </div>
                  </div>
                  <div class="col-xl-6 col-lg-6">
                    <div class="contact__input mb-20">
                      <label>이메일 <span class="required">*</span></label>
                      <Field name="email" type="email" />
                      <ErrorMessage name="email" class="text-danger" />
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-xl-12">
                    <div class="contact__input mb-20">
                      <label>제목 <span class="required">*</span></label>
                      <Field name="subject" type="text" />
                      <ErrorMessage name="subject" class="text-danger" />
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-xl-12">
                    <div class="contact__input mb-45">
                      <label>메시지</label>
                      <Field name="msg" v-slot="{ field }">
                        <textarea v-bind="field" name="msg" cols="30" rows="10"></textarea>
                      </Field>
                      <ErrorMessage name="msg" class="text-danger" />
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-xl-12">
                    <div class="contact__submit">
                      <button type="submit" class="os-btn os-btn-black">메시지 보내기</button>
                    </div>
                  </div>
                </div>
              </Form>
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
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import type { CoInquiryType } from "~/types/coInquiryType";
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";

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
const { data: fetchedContactInfo } = await useAsyncData<CoContactInfoItemType[] | null>(
  "dp-contact-info-main",
  () => dpAreaSvc.getFirstWidgetConfig<CoContactInfoItemType[]>("CONTACT_INFO_MAIN")
);
const contactInfo: CoContactInfoItemType[] = fetchedContactInfo.value?.length ? fetchedContactInfo.value : DEFAULT_CONTACT_INFO;

const schema = yup.object({
  name: yup.string().required("이름을 입력해 주세요").label("이름"),
  email: yup.string().required("이메일을 입력해 주세요").email("올바른 이메일 주소를 입력해 주세요").label("이메일"),
  subject: yup.string().required("제목을 입력해 주세요").min(10, "제목은 10자 이상이어야 합니다").label("제목"),
  msg: yup.string().required("메시지를 입력해 주세요").min(20, "메시지는 20자 이상이어야 합니다").label("메시지"),
});

async function onSubmit(values: CoInquiryType, { resetForm }: { resetForm: () => void }) {
  await useAlert().openAlert(JSON.stringify(values, null, 2));
  resetForm();
}
</script>
