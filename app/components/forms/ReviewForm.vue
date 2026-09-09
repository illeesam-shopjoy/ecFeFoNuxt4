<template>
  <form id="contacts-form" class="conatct-post-form" @submit.prevent="handleSubmit">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="row">
      <div class="col-xl-12">
        <div class="contact-icon relative contacts-message">
          <textarea v-model="content" name="comments" id="comments" cols="30" rows="10" placeholder="내용"></textarea>
        </div>
      </div>
      <!-- 2026-09 BFF 전환: 파일 첨부는 아직 미지원 — ecBeBo 리뷰 첨부(pd_review_attach)는
           공지 첨부와 마찬가지로 ecBeCdn 업로드 후 별도 등록이 필요한데(server/api/base/sy/notice/[id]/attachments.post.ts
           참조), 리뷰용 첨부 등록 API 계약은 아직 확인 전이라 이번 전환분에서는 제외했다. -->
      <div class="col-xl-12">
        <button class="os-btn os-btn-black" type="submit" :disabled="loading">
          {{ loading ? "등록 중..." : (isReply ? "답글 등록" : "리뷰 등록") }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle("리뷰 폼");
import { useNuxtApp } from "#app/nuxt";

const props = defineProps<{
  prodId: string;
  rating: number;
  /** 답글 모드: 지정 시 내용만(별점 없음) — ecBeBo PdReviewCommentController 대상 */
  parentReviewId?: string;
}>();

const emit = defineEmits<{ (e: "submitted"): void }>();

// 작성자 이름은 더 이상 자유 입력을 받지 않는다 — ecBeBo는 로그인 회원(memberId)을 리뷰
// 작성자로 기록하고 화면엔 회원 표시명(regUserNm/writerNm)을 내려준다(server/utils/mapProduct.ts 참조).
const isReply = computed(() => Boolean(props.parentReviewId));

const content = ref("");
const loading = ref(false);

async function handleSubmit() {
  const contentTrim = content.value.trim();
  if (!contentTrim) {
    useNuxtApp().$toast?.error?.("내용을 입력해 주세요.");
    return;
  }
  if (!isReply.value && (props.rating < 0.5 || !props.prodId)) {
    useNuxtApp().$toast?.error?.("별점을 선택해 주세요.");
    return;
  }
  loading.value = true;
  try {
    if (isReply.value && props.parentReviewId) {
      const res = await $fetch<{ success?: boolean; message?: string }>("/api/base/ec/pd/review-comment", {
        method: "POST",
        body: { reviewId: props.parentReviewId, content: contentTrim },
      });
      if (res?.success) {
        useNuxtApp().$toast?.success?.(res.message ?? "답글이 등록되었습니다.");
        content.value = "";
        emit("submitted");
      }
    } else {
      const res = await $fetch<{ success?: boolean; message?: string }>("/api/base/ec/pd/review", {
        method: "POST",
        body: { prodId: props.prodId, content: contentTrim, rating: props.rating },
      });
      if (res?.success) {
        useNuxtApp().$toast?.success?.(res.message ?? "리뷰가 등록되었습니다.");
        content.value = "";
        emit("submitted");
      }
    }
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? (isReply.value ? "답글 등록에 실패했습니다." : "리뷰 등록에 실패했습니다.");
    useNuxtApp().$toast?.error?.(msg);
  } finally {
    loading.value = false;
  }
}
</script>
