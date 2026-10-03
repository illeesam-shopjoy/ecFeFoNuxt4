<template>
  <!-- 위치안내 — 구글 지도(키 없는 embed)·주소/연락처·교통 안내. 원본 pages/Location.js -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 28px">
        <div class="hp-pill hp-pill--blue">오시는 길</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 10px; line-height: 1.2"><span class="gradient-text">{{ HP_SITE.name }}</span> 위치</h1>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.65; max-width: 640px">{{ HP_SITE.address }}</p>
      </div>

      <div class="location-grid">
        <div class="card card--static" style="padding: 0; overflow: hidden; position: relative">
          <a :href="mapOpenUrl" target="_blank" rel="noopener noreferrer" class="location-open">지도에서 열기</a>
          <iframe
            title="Google Map"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            style="display: block; width: 100%; height: min(420px, 55vw); min-height: 260px; border: 0"
            :src="mapEmbedUrl"
          ></iframe>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px">
          <div class="card card--static" style="padding: 26px 24px">
            <h2 class="location-h2"><span class="info-icon" style="margin-top: 0">📍</span> 주소 및 연락처</h2>
            <div style="margin-top: 8px">
              <div class="info-row"><span class="info-icon">🏢</span><div><div class="info-label">주소</div><div class="info-val" style="line-height: 1.55">{{ HP_SITE.address }}</div></div></div>
              <div class="info-row"><span class="info-icon">📞</span><div><div class="info-label">전화</div><div class="info-val"><a :href="`tel:${telDigits}`" style="color: var(--blue)">{{ HP_SITE.tel }}</a></div></div></div>
              <div class="info-row"><span class="info-icon">✉️</span><div><div class="info-label">이메일</div><div class="info-val"><a :href="`mailto:${HP_SITE.email}`" style="color: var(--blue)">{{ HP_SITE.email }}</a></div></div></div>
              <div class="info-row">
                <span class="info-icon">🕐</span>
                <div>
                  <div class="info-label">업무시간</div>
                  <div class="info-val">평일 <span style="color: var(--blue); font-weight: 600; font-variant-numeric: tabular-nums">09:00 – 18:00</span></div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px">주말·공휴일 휴무</div>
                </div>
              </div>
            </div>
          </div>
          <div class="card card--static" style="padding: 26px 24px">
            <h2 class="location-h2"><span class="info-icon" style="margin-top: 0">🚌</span> 교통 안내</h2>
            <div style="margin-top: 8px">
              <div class="info-row"><span class="info-icon">🚇</span><div><div class="info-label">지하철</div><div class="info-val" style="line-height: 1.55">수인·분당선 야탑역 인근(약 600m) · 성남시청(전면) 정류장 하차 도보 5분 (240m)</div></div></div>
              <div class="info-row"><span class="info-icon">🚌</span><div><div class="info-label">버스</div><div class="info-val">성남시청(전면) 정류장 하차(약 240m)</div></div></div>
              <div class="info-row"><span class="info-icon">🅿️</span><div><div class="info-label">주차</div><div class="info-val">인근 공영·유료 주차장 이용</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_SITE } from "~/conts/tenant/homepg1";

useHead({ title: "위치안내" });

const q = encodeURIComponent(HP_SITE.address);
const mapEmbedUrl = `https://www.google.com/maps?q=${q}&output=embed`;
const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
const telDigits = HP_SITE.tel.replace(/[^\d+]/g, "");
</script>

<style scoped>
.location-open {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--blue);
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.location-h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
