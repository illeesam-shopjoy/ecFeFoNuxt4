<template>
  <section class="footer__area dark-soft-bg">
    <div class="footer__top pt-100 pb-50">
      <div class="container custom-container-2 mx-auto">
        <div class="row flex justify-center">
          <div class="col-xl-12">
            <div class="footer__social-list mb-60">
              <ul>
                <li>
                  <a target="_blank" href="http://facebook.com">Facebook</a>
                </li>
                <li>
                  <a target="_blank" href="http://twitter.com">Twitter</a>
                </li>
                <li>
                  <a target="_blank" href="https://www.instagram.com/">Instagram</a>
                </li>
                <li>
                  <a target="_blank" href="https://www.pinterest.com/">Pinterest</a>
                </li>
                <li>
                  <a target="_blank" href="https://www.youtube.com/">Youtube</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="row flex justify-center">
          <div class="col-xl-4 col-lg-6 col-md-6 w-full">
            <div class="footer__widget mb-30">
              <div class="footer__widget-title mb-25">
                <nuxt-link href="/">
                  <img src="/cdn/img/logo/log-3.webp" alt="logo" />
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
          <div v-for="(section, i) in footerData.sections" :key="i" class="col-xl-2 col-lg-3 col-md-3 w-full">
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
          <div class="col-xl-4 col-lg-3 col-md-6 w-full">
            <div class="footer__widget mb-30">
              <div class="footer__widget-title mb-25">
                <h5>{{ footerData.newsletter.title }}</h5>
              </div>
              <div class="footer__widget-content">
                <p>{{ footerData.newsletter.desc }}</p>
                <div class="form-group">
                  <input class="border border-gray-300 rounded px-3 py-2 w-full" id="newsletter-input" type="email" name="contact[email]" placeholder="이메일 주소를 입력하세요..." />
                  <button class="ss-btn btnNewsletter" type="submit">구독하기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer__bottom footer__bottom-3">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row flex justify-center items-center">
          <div class="col-xl-6 col-lg-7 col-md-8">
            <div class="footer__copyright footer__copyright-3">
              <p>
                저작권권 © {{ new Date().getFullYear() }} <nuxt-link href="/" class="link">shopjoy</nuxt-link> 모든 권리 보유.
                <nuxt-link href="/" class="link">shopjoy</nuxt-link>
              </p>
            </div>
          </div>
          <div class="col-xl-6 col-lg-5 col-md-4">
            <div class="footer__payment">
              <a href="#"><img src="/cdn/img/payment/paypal_logo.webp" alt="" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { dpAreaSvc } from "~/svc/fo/ec/dp/dpAreaSvc";

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
  newsletter: { title: string; desc: string };
}

// 전시 위젯(area_cd=FOOTER_LINKS_THREE)에서 로드 — 미등록/조회실패 시 기본값 폴백
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
  newsletter: { title: "뉴스레터", desc: "발행 시마다 무료 소식을 받아보세요. 1,000명 이상이 구독 중입니다." },
};
// 2026-09-13(성능 개선): lazy:true + computed — 화면 마운트를 블로킹하지 않으면서도
// 늦게 도착한 데이터가 footerData에 반영되게 한다.
const { data: fetchedFooterData } = useAsyncData<FooterData | null>(
  "dp-footer-links-three",
  () => dpAreaSvc.getFirstWidgetConfig<FooterData>("FOOTER_LINKS_THREE"),
  { lazy: true }
);
const footerData = computed<FooterData>(() => fetchedFooterData.value ?? DEFAULT_FOOTER_DATA);
</script>
