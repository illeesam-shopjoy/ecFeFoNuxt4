<template>
  <section :class="`footer__area footer-bg ${box_style ? 'box-m-15' : ''}`">
    <div class="footer__top pt-100 pb-60">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 푸터 3열 레이아웃: Outstock(50%) | 안내(25%) | 고객센터(25%) -->
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2rem;">
          <!-- 1열: Outstock 로고 + 연락처 -->
          <div>
            <div class="footer__widget mb-30">
              <div class="footer__widget-title mb-25">
                <nuxt-link href="/">
                  <img src="/cdn/img/logo/logo-2.png" alt="logo" />
                </nuxt-link>
              </div>
              <div class="footer__widget-content">
                <p>{{ footerData.introText }}</p>
                <div class="footer__contact">
                  <ul>
                    <li v-for="(item, i) in footerData.contactInfo" :key="i">
                      <div class="icon">
                        <i :class="item.icon"></i>
                      </div>
                      <div class="text">
                        <span>{{ item.label }}: {{ item.value }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <!-- 2열~3열: 안내/고객센터 -->
          <div v-for="(section, i) in footerData.sections" :key="i">
            <div class="footer__widget mb-30">
              <div :class="i === 0 ? 'footer__widget-title' : 'footer__widget-title mb-25'">
                <h5>{{ section.title }}</h5>
              </div>
              <div class="footer__widget-content">
                <div class="footer__links">
                  <ul>
                    <li v-for="(link, j) in section.links" :key="j"><a :href="link.href">{{ link.label }}</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-wrap items-center justify-center">
          <div class="w-full lg:w-7/12">
            <div class="footer__copyright">
              <p>저작권권 {{ new Date().getFullYear() }} © <nuxt-link href="/">shopjoy</nuxt-link> 모든 권리 보유. <nuxt-link href="/">shopjoy</nuxt-link> 제작</p>
            </div>
          </div>
          <div class="w-full lg:w-5/12">
            <div class="footer__social ml-auto">
              <ul>
                <li><a href="https://facebook.com" target="_blank" title="Facebook"><i class="fab fa-facebook-f"></i></a></li>
                <li><a href="#" title="Twitter에 공유" @click.prevent="shareTwitter"><i class="fab fa-twitter"></i></a></li>
                <li><a href="https://www.behance.net/" target="_blank" title="Behance"><i class="fab fa-behance"></i></a></li>
                <li><a href="https://dribbble.com/" target="_blank" title="Dribbble"><i class="fab fa-dribbble"></i></a></li>
                <li><a href="#" title="카카오톡으로 공유" @click.prevent="shareKakao" style="color: #FAE100;"><i class="fas fa-comment-dots"></i></a></li>
                <li><a href="#" title="이메일로 공유" @click.prevent="shareMail"><i class="fas fa-envelope"></i></a></li>
                <li><a href="#" title="문자(MMS)로 공유" @click.prevent="shareMMS"><i class="fas fa-mobile-alt"></i></a></li>
                <li><a href="#" title="링크 복사 / 공유하기" @click.prevent="shareLink"><i class="fas fa-share-alt"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";

defineProps({
  box_style: { type: Boolean, default: false },
});

interface FooterLinkSection {
  title: string;
  links: { href: string; label: string }[];
}
interface FooterContactItem {
  icon: string;
  label: string;
  value: string;
}
interface FooterData {
  introText: string;
  contactInfo: FooterContactItem[];
  sections: FooterLinkSection[];
}

// 전시 위젯(area_cd=FOOTER_LINKS_MAIN)에서 로드 — 미등록/조회실패 시 기본값 폴백
// (2026-09-13, [[ecfefonuxt4-dp-widget-migration]]).
const DEFAULT_FOOTER_DATA: FooterData = {
  introText: "shopjoy은 고급 관리 기능을 갖춘 프리미엄 템플릿 테마입니다. 맞춤 설정이 쉽고, 반응형이며 레티나 디스플레이를 지원합니다.",
  contactInfo: [
    { icon: "fal fa-map-marker-alt", label: "주소", value: "성남시 중원구 성남대로 997 (여수동)" },
    { icon: "fal fa-envelope-open-text", label: "이메일", value: "illeesam@gmail.com" },
    { icon: "fal fa-phone-alt", label: "연락처", value: "(010) 3805 0206" },
  ],
  sections: [
    {
      title: "안내",
      links: [
        { href: "#", label: "회사 소개" },
        { href: "#", label: "채용" },
        { href: "#", label: "배송 안내" },
        { href: "#", label: "개인정보처리방침" },
        { href: "#", label: "이용약관" },
      ],
    },
    {
      title: "고객센터",
      links: [
        { href: "#", label: "배송 정책" },
        { href: "#", label: "도움말 및 문의" },
        { href: "#", label: "반품 및 환불" },
        { href: "#", label: "온라인 스토어" },
        { href: "#", label: "이용약관" },
      ],
    },
  ],
};
const { data: fetchedFooterData } = await useAsyncData<FooterData | null>(
  "dp-footer-links-main",
  () => dpAreaSvc.getFirstWidgetConfig<FooterData>("FOOTER_LINKS_MAIN")
);
const footerData: FooterData = fetchedFooterData.value ?? DEFAULT_FOOTER_DATA;

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
