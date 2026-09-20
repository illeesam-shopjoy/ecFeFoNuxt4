<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="위치안내" subtitle="위치안내" />

    <!-- 2026-09-19(요청사항: "회사위치 … ecFeFoNuxt4 페이지에 만들어줘") — ecFeBo(pages/fo/Location.js) 이식.
         지도(구글 embed) + 외부 지도앱 링크 + 주소/영업시간/연락처 + 교통편. 카카오/네이버 SDK 지도는 키·도메인 등록이 필요해
         이번 이식에서는 구글 embed 를 기본으로 하고 카카오/네이버는 새 창 링크로 연결한다(ecFeBo 도 SDK 실패 시 구글로 폴백). -->
    <section class="pt-16 pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 지도 — 카카오맵/네이버지도/구글지도 버튼으로 지도 교체(MapSwitch) -->
        <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden mb-6">
          <map-switch :addr="ADDR" :lat="LAT" :lng="LNG" bar-class="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-[#e5e7eb]">
            <span class="flex-1 min-w-[200px] text-[0.83rem] text-gray-600"><i class="fas fa-map-marker-alt text-red-500 mr-1.5"></i>{{ ADDR }} 201호</span>
          </map-switch>
        </div>

        <!-- 주소 / 영업시간 / 연락처 -->
        <div class="grid gap-4 mb-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <div class="bg-white border border-[#e5e7eb] rounded-lg p-5">
            <div class="flex items-center gap-2.5 mb-3.5">
              <div class="w-10 h-10 rounded-[10px] bg-blue-50 flex items-center justify-center text-blue-500"><i class="fas fa-map-marker-alt"></i></div>
              <div class="text-base font-extrabold text-gray-900">주소</div>
            </div>
            <div class="text-[0.88rem] text-gray-600 leading-[1.8]">
              <div class="font-semibold text-gray-900 mb-1">경기도 성남시 중원구</div>
              <div>성남대로 997번길 49-14, 201호</div>
              <div class="mt-2 text-[0.8rem] text-gray-400">우편번호: 13401</div>
            </div>
          </div>

          <div class="bg-white border border-[#e5e7eb] rounded-lg p-5">
            <div class="flex items-center gap-2.5 mb-3.5">
              <div class="w-10 h-10 rounded-[10px] bg-green-50 flex items-center justify-center text-green-600"><i class="fas fa-clock"></i></div>
              <div class="text-base font-extrabold text-gray-900">영업시간</div>
            </div>
            <div class="text-[0.87rem] text-gray-600 leading-[2]">
              <div v-for="h in hours" :key="h.day" class="flex justify-between">
                <span>{{ h.day }}</span>
                <span class="font-bold" :class="h.closed ? 'text-red-500 font-semibold' : 'text-gray-900'">{{ h.time }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white border border-[#e5e7eb] rounded-lg p-5">
            <div class="flex items-center gap-2.5 mb-3.5">
              <div class="w-10 h-10 rounded-[10px] bg-blue-50 flex items-center justify-center text-blue-500"><i class="fas fa-phone"></i></div>
              <div class="text-base font-extrabold text-gray-900">연락처</div>
            </div>
            <div class="text-[0.87rem] text-gray-600 leading-[2]">
              <div class="flex justify-between items-center"><span>전화</span><a :href="`tel:${TEL}`" class="font-bold text-blue-600 no-underline">{{ TEL }}</a></div>
              <div class="flex justify-between items-center"><span>이메일</span><a :href="`mailto:${EMAIL}`" class="font-bold text-blue-600 no-underline text-[0.82rem]">{{ EMAIL }}</a></div>
              <div class="flex justify-between items-center"><span>카카오채널</span><span class="font-bold text-gray-900">@shopjoy</span></div>
            </div>
          </div>
        </div>

        <!-- 교통편 -->
        <div class="bg-white border border-[#e5e7eb] rounded-lg p-5 sm:p-6">
          <div class="text-base font-extrabold text-gray-900 mb-4"><i class="fas fa-bus text-theme mr-2"></i>교통편 안내</div>
          <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <div v-for="t in transports" :key="t.title" class="p-3.5 bg-[#f9fafb] rounded-[10px]">
              <div class="text-[0.85rem] font-bold text-gray-900 mb-1.5">{{ t.icon }} {{ t.title }}</div>
              <div class="text-[0.82rem] text-gray-600 leading-relaxed">{{ t.line1 }}</div>
              <div class="text-[0.78rem] text-gray-400 leading-relaxed">{{ t.line2 }}</div>
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
import MapSwitch from "~/components/common/map/MapSwitch.vue";
import { usePageTitle } from "~/composables/usePageTitle";

useHead({ title: "위치안내" });
usePageTitle("위치안내");

// 본사 좌표/주소/연락처 — ecFeBo Location.js 와 동일 값
// 성남대로 997번길 49-14 실제 좌표(OSM 지오코딩) — 이전 값(37.4407,127.1468)은 신흥역 부근이라 어긋났음
const LAT = 37.41746;
const LNG = 127.12611;
const ADDR = "경기도 성남시 중원구 성남대로 997번길 49-14";
const TEL = "010-3805-0206";
const EMAIL = "illeesam@gmail.com";


const hours = [
  { day: "월요일 ~ 금요일", time: "09:00 – 18:00", closed: false },
  { day: "토요일", time: "10:00 – 15:00", closed: false },
  { day: "일요일 / 공휴일", time: "휴무", closed: true },
];
const transports = [
  { icon: "🚇", title: "지하철", line1: "8호선 성남역 2번 출구", line2: "도보 약 10분" },
  { icon: "🚌", title: "버스", line1: "성남대로 정류장 하차", line2: "220, 500번 이용" },
  { icon: "🚗", title: "자가용", line1: "성남IC에서 약 5분", line2: "건물 내 주차 가능 (무료 2시간)" },
];
</script>

