<template>
  <!-- 회사소개 — 창업 스토리·숫자·핵심 가치·구축사이트 이력·사업자등록증명·연락처. 원본 pages/About.js -->
  <layout>
    <div class="page-wrap">
      <div style="margin-bottom: 36px">
        <div class="hp-pill hp-pill--blue">회사소개</div>
        <h1 class="section-title" style="font-size: 2rem; margin-bottom: 12px">모두를 위한 기술,<br /><span class="gradient-text">{{ HP_SITE.name }}</span></h1>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.8; max-width: 600px">
          2021년 설립 이후, 모두누리는 중소기업부터 대기업까지 다양한 규모의 고객사에 맞춤형 소프트웨어 개발을 제공해왔습니다. AI, ERP, 클라우드, 모바일 앱 등 폭넓은 기술 스택으로 고객의 디지털 혁신을 이끌어 왔습니다.
        </p>
      </div>

      <div class="card card--static" style="padding: 28px; margin-bottom: 28px">
        <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 14px; color: var(--text-primary)">🏗️ 창업 스토리</h2>
        <p style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.8">
          모두누리는 "모든 사람이 누릴 수 있는 기술"이라는 비전 아래, 기술 격차 해소와 접근 가능한 디지털 전환을 목표로 설립되었습니다. 초기 5명의 개발팀으로 시작해 현재 50여 명의 전문 인력이 함께하고 있으며, 국내외 30여 개 고객사 업무 구축을 기반으로 기술 솔루션 기업으로 성장했습니다.
        </p>
      </div>

      <div class="grid-4" style="margin-bottom: 28px">
        <div v-for="s in TEAM_STATS" :key="s.label" class="stat-card">
          <div class="stat-number" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <h2 class="section-title" style="font-size: 1.2rem; margin-bottom: 18px">핵심 가치</h2>
      <div class="grid-3" style="margin-bottom: 36px">
        <div v-for="v in VALUES" :key="v.title" class="value-card">
          <div style="font-size: 2.5rem; margin-bottom: 14px">{{ v.emoji }}</div>
          <div style="font-size: 1rem; font-weight: 700; margin-bottom: 8px" :style="{ color: v.color }">{{ v.title }}</div>
          <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.65">{{ v.desc }}</p>
        </div>
      </div>

      <!-- 구축사이트 이력 -->
      <div style="margin-bottom: 36px">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px">
          <h2 class="section-title" style="font-size: 1.2rem">구축사이트</h2>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600">총 {{ totalProjects }}건</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 24px">대표자 개인 경력 포함 주요 프로젝트 이력</p>

        <div v-for="group in HP_PROJECT_GROUPS" :key="group.period" style="margin-bottom: 32px">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">
            <div style="display: flex; align-items: center; justify-content: center; min-width: 110px; height: 32px; border-radius: 16px; font-size: 0.78rem; font-weight: 800; color: #fff" :style="{ background: group.color }">
              {{ group.period }}
            </div>
            <div style="flex: 1; height: 1px; background: var(--border)"></div>
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600">{{ group.items.length }}건</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; padding-left: 8px">
            <div v-for="(p, idx) in group.items" :key="group.period + '-' + idx" class="about-project">
              <div style="position: absolute; top: 0; left: 0; width: 3px; height: 100%; border-radius: 3px 0 0 3px" :style="{ background: group.color }"></div>
              <div style="padding-left: 6px">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px">
                  <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); line-height: 1.4; flex: 1">{{ p.name }}</div>
                  <span style="font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; margin-top: 2px">{{ p.period }}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap">
                  <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary)">{{ p.client }}</span>
                  <span v-if="p.role" style="font-size: 0.68rem; padding: 1px 7px; border-radius: 10px; background: var(--blue-dim); color: var(--blue); font-weight: 600">{{ p.role }}</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.5; display: flex; flex-wrap: wrap; gap: 4px">
                  <span v-for="t in p.tech.split('·')" :key="t" style="padding: 1px 6px; border-radius: 6px; background: var(--bg-base); border: 1px solid var(--border)">{{ t.trim() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 사업자등록증명 -->
      <h2 class="section-title" style="font-size: 1.2rem; margin-bottom: 18px">사업자등록증명</h2>
      <div class="card card--static" style="padding: 28px; margin-bottom: 28px">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
          <img
            v-if="!imgFailed"
            :src="bizRegImg"
            alt="사업자등록증명"
            loading="lazy"
            style="max-width: 680px; width: 100%; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08)"
            @error="imgFailed = true"
          />
          <div v-else style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px; color: var(--text-muted); font-size: 0.875rem">
            <span style="font-size: 2rem">📄</span>
            <span>사업자등록증명 이미지를 불러올 수 없습니다.</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); text-align: center; margin-top: 4px">
            사업자등록번호: {{ HP_SITE.bizNo }} · 대표자: {{ HP_SITE.ceo }} · 등록일: {{ HP_SITE.bizRegDate }}
          </p>
        </div>
      </div>

      <!-- 연락처 -->
      <h2 class="section-title" style="font-size: 1.2rem; margin-bottom: 18px">연락처 정보</h2>
      <div class="card card--static" style="padding: 28px">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px">
          <div class="about-contact">
            <div class="about-contact-ico" style="background: var(--blue-dim)">👤</div>
            <div>
              <div class="about-contact-label">대표자</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary)">{{ HP_SITE.ceo }}</div>
            </div>
          </div>
          <div class="about-contact">
            <div class="about-contact-ico" style="background: var(--green-dim)">📞</div>
            <div>
              <div class="about-contact-label">전화번호</div>
              <a :href="`tel:${HP_SITE.tel}`" style="font-size: 0.95rem; font-weight: 700; color: var(--blue)">{{ HP_SITE.tel }}</a>
            </div>
          </div>
          <div class="about-contact">
            <div class="about-contact-ico" style="background: var(--purple-dim)">✉️</div>
            <div style="min-width: 0">
              <div class="about-contact-label">이메일</div>
              <a :href="`mailto:${HP_SITE.email}`" style="font-size: 0.88rem; font-weight: 700; color: var(--blue); word-break: break-all">{{ HP_SITE.email }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_PROJECT_GROUPS, HP_SITE } from "~/conts/tenant/homepg1";
import bizRegImg from "~/assets/homepg1/img/business-registration.png";

useHead({ title: "회사소개" });

const TEAM_STATS = [
  { value: "5+", label: "설립 연수", color: "var(--blue)" },
  { value: "5+", label: "전문 인력", color: "var(--green)" },
  { value: "10+", label: "고객사", color: "var(--purple)" },
  { value: "5+", label: "제품", color: "var(--blue)" },
];
const VALUES = [
  { emoji: "⚙️", title: "기술력", color: "var(--blue)", desc: "최신 기술 트렌드를 선도하며 견고하고 확장 가능한 시스템을 구축합니다." },
  { emoji: "🤝", title: "신뢰", color: "var(--green)", desc: "투명한 커뮤니케이션과 약속 이행으로 장기적 파트너 관계를 구축합니다." },
  { emoji: "💡", title: "혁신", color: "var(--purple)", desc: "고객 문제를 창의적으로 해결하며 끊임없이 더 나은 방식을 찾습니다." },
];
const totalProjects = HP_PROJECT_GROUPS.reduce((s, g) => s + g.items.length, 0);
const imgFailed = ref(false);
</script>

<style scoped>
.about-project {
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.about-project:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.about-contact {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-base);
  border: 1px solid var(--border);
}
.about-contact-ico {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.about-contact-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 3px;
}
</style>
