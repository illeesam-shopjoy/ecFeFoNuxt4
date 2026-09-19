<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="회사소개" subtitle="회사소개" />

    <!-- 2026-09-19(요청사항: "회사소개 … ecFeFoNuxt4 페이지에 만들어줘") — ecFeBo(pages/fo/About.js) 이식.
         브랜드 히어로 + 미션/비전 + 핵심 가치 + 연혁 + 사업자 정보 + 오시는 길(구글 지도). 내용은 정적 데이터. -->
    <section class="pt-16 pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 브랜드 히어로 -->
        <div class="relative overflow-hidden rounded-2xl px-8 py-5 mb-8 text-center text-[#1e3a8a]" style="background: linear-gradient(135deg, #bfdbfe, #c7d2fe)">
          <div class="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-white/30"></div>
          <div class="absolute -bottom-[30px] -left-[30px] w-[120px] h-[120px] rounded-full bg-white/30"></div>
          <div class="relative z-[1] flex items-center justify-center gap-6 flex-wrap">
            <div class="flex items-center gap-2.5">
              <div class="text-[2rem]"><i class="fas fa-shopping-bag"></i></div>
              <div class="text-left">
                <div class="text-[1.3rem] font-black leading-tight">ShopJoy</div>
                <div class="text-[0.8rem] opacity-75">쇼핑의 즐거움</div>
              </div>
            </div>
            <div class="hidden sm:block w-px h-9 bg-[#1e3a8a]/20"></div>
            <div class="flex gap-7 flex-wrap justify-center">
              <div v-for="s in stats" :key="s.label" class="text-center">
                <div class="text-[1.3rem] font-black">{{ s.value }}</div>
                <div class="text-[0.72rem] opacity-70 mt-px">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 미션 & 비전 -->
        <div class="grid gap-4 mb-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          <div v-for="m in missionVision" :key="m.title" class="bg-white border border-[#e5e7eb] rounded-lg p-6">
            <div class="text-[1.8rem] mb-3">{{ m.icon }}</div>
            <div class="text-base font-extrabold text-gray-900 mb-2.5">{{ m.title }}</div>
            <p class="text-[0.88rem] text-gray-600 leading-[1.8]">{{ m.desc }}</p>
          </div>
        </div>

        <!-- 핵심 가치 -->
        <div class="bg-white border border-[#e5e7eb] rounded-lg p-5 sm:p-6 mb-6">
          <div class="text-base font-extrabold text-gray-900 mb-5"><i class="fas fa-gem text-blue-500 mr-2"></i>핵심 가치</div>
          <div class="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <div v-for="v in values" :key="v.title" class="flex gap-3 items-start">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center text-[1.4rem] shrink-0" :style="{ background: v.bg }">{{ v.icon }}</div>
              <div>
                <div class="text-[0.9rem] font-bold text-gray-900 mb-1">{{ v.title }}</div>
                <div class="text-[0.8rem] text-gray-600 leading-relaxed">{{ v.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 연혁 -->
        <div class="bg-white border border-[#e5e7eb] rounded-lg p-6 mb-6">
          <div class="text-base font-extrabold text-gray-900 mb-5"><i class="fas fa-calendar-alt text-blue-500 mr-2"></i>연혁</div>
          <div class="relative pl-6">
            <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-[#e5e7eb]"></div>
            <div v-for="h in history" :key="h.date" class="relative mb-5 pl-3 last:mb-0">
              <div class="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-gray-900"></div>
              <div class="text-[0.78rem] font-bold text-blue-600 mb-0.5">{{ h.date }}</div>
              <div class="text-[0.88rem] font-semibold text-gray-900 mb-0.5">{{ h.title }}</div>
              <div class="text-[0.8rem] text-gray-600">{{ h.desc }}</div>
            </div>
          </div>
        </div>

        <!-- 사업자 정보 -->
        <div class="bg-white border border-[#e5e7eb] rounded-lg p-6 mb-6">
          <div class="text-base font-extrabold text-gray-900 mb-4"><i class="fas fa-clipboard-list text-blue-500 mr-2"></i>사업자 정보</div>
          <div class="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            <div v-for="info in bizInfo" :key="info.label" class="flex gap-2.5">
              <span class="text-[0.8rem] text-gray-400 min-w-[80px] shrink-0">{{ info.label }}</span>
              <span class="text-[0.85rem] font-semibold text-gray-900">{{ info.value }}</span>
            </div>
          </div>
          <div class="mt-4 px-4 py-3 bg-[#f9fafb] rounded-lg text-[0.8rem] text-gray-400 leading-[1.7]">
            통신판매업자는 거래에 관한 약관, 청약철회 가능여부, 배송비, 교환·환불·보증 조건 및 품질보증기준에 따라 상거래를 운영합니다.
          </div>
        </div>

        <!-- 오시는 길 -->
        <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
          <div class="px-5 pt-4 pb-3 text-base font-extrabold text-gray-900 flex flex-wrap items-center gap-2">
            <span><i class="fas fa-map-marked-alt text-blue-500 mr-2"></i>오시는 길</span>
            <span class="ml-auto flex gap-1.5">
              <a :href="kakaoLink" target="_blank" rel="noopener" class="map-link" style="background: #fee500; color: #3c1e1e">카카오맵</a>
              <a :href="naverLink" target="_blank" rel="noopener" class="map-link" style="background: #03c75a; color: #fff">네이버지도</a>
              <a :href="googleLink" target="_blank" rel="noopener" class="map-link" style="background: #4285f4; color: #fff">구글지도</a>
            </span>
          </div>
          <iframe :src="mapSrc" title="ShopJoy 위치 지도" width="100%" class="block border-0 h-[clamp(200px,32vw,280px)]" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
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
import { usePageTitle } from "~/composables/usePageTitle";

useHead({ title: "회사소개" });
usePageTitle("회사소개");

const stats = [
  { value: "2024", label: "설립년도" },
  { value: "50+", label: "상품 종류" },
  { value: "5개", label: "카테고리" },
  { value: "100%", label: "고객 만족 목표" },
];
const missionVision = [
  { icon: "🎯", title: "미션", desc: "합리적인 가격으로 트렌디한 의류를 제공하여, 누구나 자신만의 스타일을 쉽고 즐겁게 표현할 수 있도록 돕습니다." },
  { icon: "✨", title: "비전", desc: "고객이 원하는 상품을 가장 빠르고 편리하게 만나볼 수 있는, 대한민국 최고의 패션 쇼핑 플랫폼이 되겠습니다." },
];
const values = [
  { icon: "😊", bg: "#dbeafe", title: "고객 중심", desc: "모든 의사결정의 기준은 고객 만족입니다." },
  { icon: "💡", bg: "#fef3c7", title: "트렌드 선도", desc: "최신 패션 트렌드를 빠르게 반영합니다." },
  { icon: "🌱", bg: "#dcfce7", title: "지속 가능성", desc: "환경을 생각하는 지속 가능한 패션을 지향합니다." },
  { icon: "🤝", bg: "#f3e8ff", title: "신뢰와 투명성", desc: "정직한 정보와 합리적인 가격으로 신뢰를 쌓습니다." },
];
const history = [
  { date: "2024년 11월", title: "ShopJoy 서비스 론칭", desc: "베타 버전 출시 및 초기 상품 라인업 구축" },
  { date: "2024년 12월", title: "회원 1,000명 달성", desc: "오픈 한 달 만에 1,000명의 회원 유치" },
  { date: "2025년 02월", title: "카테고리 확장", desc: "악세서리 카테고리 신규 추가, 총 5개 카테고리 운영" },
  { date: "2025년 06월", title: "모바일 앱 출시", desc: "iOS/Android 앱 동시 출시 및 앱 전용 할인 이벤트 진행" },
  { date: "2026년 01월", title: "50개 상품 라인업 완성", desc: "다양한 카테고리에 걸쳐 50가지 상품 구비" },
  { date: "2026년 04월", title: "리뉴얼 오픈", desc: "새로운 UI/UX로 전면 리뉴얼. 더 편리한 쇼핑 경험 제공" },
];
const bizInfo = [
  { label: "상호명", value: "ShopJoy (쇼핑조이)" },
  { label: "대표자", value: "송성일" },
  { label: "사업자번호", value: "123-45-67890" },
  { label: "통신판매업", value: "제2024-성남중원-0001호" },
  { label: "주소", value: "경기도 성남시 중원구 성남대로 997번길 49-14 201호" },
  { label: "고객센터", value: "010-3805-0206" },
  { label: "이메일", value: "illeesam@gmail.com" },
];

// 오시는 길 — Location 화면과 동일 좌표/주소
const LAT = 37.4407;
const LNG = 127.1468;
const ADDR_ENC = encodeURIComponent("경기도 성남시 중원구 성남대로 997번길 49-14");
const mapSrc = `https://maps.google.com/maps?q=${ADDR_ENC}&output=embed&hl=ko&z=17`;
const kakaoLink = `https://map.kakao.com/link/map/ShopJoy,${LAT},${LNG}`;
const naverLink = `https://map.naver.com/v5/search/${ADDR_ENC}`;
const googleLink = `https://maps.google.com/maps?q=${ADDR_ENC}`;
</script>

<style scoped>
.map-link {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
</style>
