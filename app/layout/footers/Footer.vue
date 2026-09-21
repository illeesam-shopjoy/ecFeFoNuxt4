<template>
  <!-- 2026-09-22(요청사항: "footer 너무 지저분 — 불필요한 것 제거하고 깔끔하게 정렬, 회사명·사업자번호 표시") — 로고+공유 / 안내 / 고객센터 3열 + 사업자 정보 + 저작권.
       예전의 템플릿 샘플 소개문, 아무 데도 연결 안 된 링크(#)·중복 링크, 동작 안 하는 SNS(Facebook/Behance/Dribbble) 링크는 뺐다. -->
  <section v-if="!hideFooter" :class="`footer__area footer-bg ${box_style ? 'box-m-15' : ''}`">
    <div class="max-w-7xl mx-auto px-4 pt-10 pb-6 md:pt-14">
      <div class="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.6fr_1fr_1.2fr]">
        <!-- 로고 + 한 줄 소개 + 공유 -->
        <div class="col-span-2 md:col-span-1">
          <nuxt-link href="/" class="inline-block"><img src="/logo/shopjoy-logo-tan.svg" alt="shopjoy" class="h-8 w-auto" /></nuxt-link>
          <p class="mt-3 mb-4 text-[0.85rem] leading-relaxed text-[#a3a3a3]">쇼핑의 즐거움, ShopJoy</p>
          <div class="flex items-center gap-2" aria-label="공유하기">
            <a href="#" title="Twitter에 공유" class="fs-btn" style="color: #1da1f2" @click.prevent="shareTwitter"><i class="fab fa-twitter"></i></a>
            <a href="#" title="카카오톡으로 공유" class="fs-btn" style="color: #fae100" @click.prevent="shareKakao"><i class="fas fa-comment-dots"></i></a>
            <a href="#" title="이메일로 공유" class="fs-btn" style="color: #ea4335" @click.prevent="shareMail"><i class="fas fa-envelope"></i></a>
            <a href="#" title="문자(MMS)로 공유" class="fs-btn" style="color: #10b981" @click.prevent="shareMMS"><i class="fas fa-mobile-alt"></i></a>
            <a href="#" title="링크 복사 / 공유하기" class="fs-btn" style="color: #bc8246" @click.prevent="shareLink"><i class="fas fa-share-alt"></i></a>
          </div>
        </div>

        <!-- 안내 -->
        <div>
          <h5 class="mb-3 text-[0.95rem] font-bold text-white">안내</h5>
          <ul class="m-0 flex list-none flex-col gap-2 p-0 text-[0.85rem]">
            <li><nuxt-link href="/about" class="ft-link">회사 소개</nuxt-link></li>
            <li><nuxt-link href="/location" class="ft-link">오시는 길</nuxt-link></li>
            <li><nuxt-link href="/faq" class="ft-link">자주 묻는 질문</nuxt-link></li>
          </ul>
        </div>

        <!-- 고객센터 -->
        <div>
          <h5 class="mb-3 text-[0.95rem] font-bold text-white">고객센터</h5>
          <ul class="m-0 flex list-none flex-col gap-2 p-0 text-[0.85rem]">
            <li class="flex items-center gap-2"><span class="text-[1.05rem] font-semibold text-white">{{ bizValue("고객센터") }}</span><a :href="telHref(bizValue('고객센터'))" class="fs-act" aria-label="전화하기" title="전화하기"><i class="fas fa-phone-alt"></i></a></li>
            <li class="flex items-center gap-2"><span class="min-w-0 break-all text-[#b5b5b5]">{{ bizValue("이메일") }}</span><a :href="`mailto:${bizValue('이메일')}`" class="fs-act" aria-label="메일 보내기" title="메일 보내기"><i class="fas fa-envelope"></i></a></li>
            <li><nuxt-link href="/contact" class="ft-link">1:1 문의하기</nuxt-link></li>
          </ul>
        </div>
      </div>

      <!-- 사업자 정보 -->
      <div class="mt-8 border-t border-[#2b2b2b] pt-5 text-[0.78rem] leading-relaxed text-[#8c8c8c]">
        <ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          <li v-for="info in bizLine" :key="info.label"><span class="text-[#6f6f6f]">{{ info.label }}</span> {{ info.value }}</li>
        </ul>
        <p class="mt-3 mb-0 text-[#6f6f6f]">© {{ new Date().getFullYear() }} ShopJoy. All rights reserved.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BIZ_INFO, bizValue, telHref } from "~/conts/bizInfo";

// 2026-09-20(요청사항: "상세화면에서는 footer 가 안 보이면 된다") — 상품/블로그/이벤트 상세에서는 푸터를 렌더링하지 않는다
const route = useRoute();
const hideFooter = computed(() => /^\/(prod|blog|event)-dtl(\/|$)/.test(route.path));

defineProps({
  box_style: { type: Boolean, default: false },
});

// 사업자 정보(상호명·대표자·사업자번호·통신판매업·주소) — 주소/고객센터/이메일은 아래 칸에 따로 있어 줄에서는 뺀다
const bizLine = BIZ_INFO.filter((i) => !["고객센터", "이메일"].includes(i.label));

const currentUrl = computed(() =>
  import.meta.client ? window.location.href : ""
);
const pageTitle = computed(() =>
  import.meta.client ? document.title : "Outstock"
);

function shareTwitter() {
  window.open(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl.value)}&text=${encodeURIComponent(pageTitle.value)}`,
    "_blank", "width=600,height=400"
  );
}

function shareKakao() {
  const text = `${pageTitle.value}\n${currentUrl.value}`;
  // 카카오톡 앱 URL 스킴 (모바일) → 미설치 시 카카오 스토리로 fallback
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    window.location.href = `kakaotalk://msg/send?text=${encodeURIComponent(text)}`;
  } else {
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(currentUrl.value)}`,
      "_blank", "width=600,height=500"
    );
  }
}

function shareMail() {
  window.location.href = `mailto:?subject=${encodeURIComponent(pageTitle.value)}&body=${encodeURIComponent(currentUrl.value)}`;
}

function shareMMS() {
  const text = `${pageTitle.value} ${currentUrl.value}`;
  window.location.href = `sms:?body=${encodeURIComponent(text)}`;
}

async function shareLink() {
  if (!import.meta.client) return;
  if (navigator.share) {
    try {
      await navigator.share({ title: pageTitle.value, url: currentUrl.value });
    } catch { /* 취소 */ }
  } else {
    await navigator.clipboard.writeText(currentUrl.value);
    await useAlert().openAlert("링크가 복사되었습니다!");
  }
}
</script>

<style scoped>
.ft-link {
  color: #b5b5b5;
  text-decoration: none;
  transition: color 0.15s;
}
.ft-link:hover {
  color: #bc8246;
}
.fs-btn {
  display: inline-flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #262626;
  font-size: 14px;
  transition: background 0.15s;
}
.fs-act {
  display: inline-flex;
  height: 26px;
  width: 26px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #262626;
  color: #bc8246;
  font-size: 11px;
  transition: background 0.15s;
}
.fs-act:hover {
  background: #bc8246;
  color: #fff;
}
.fs-btn:hover {
  background: #333;
}
</style>
