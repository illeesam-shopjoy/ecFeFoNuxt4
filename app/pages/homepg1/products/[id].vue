<template>
  <!-- 상품상세 — 상품 소개·데모·도입 문의·주문하기·공유, 주요 사양, 관련 상품. 원본 pages/Detail.js (주소 /products/:상품번호) -->
  <layout>
    <div class="page-wrap">
      <nuxt-link to="/products" class="hp-back">← 상품 목록으로</nuxt-link>
      <div v-if="product" class="detail-grid">
        <div>
          <div class="card card--static" style="padding: 36px; margin-bottom: 20px">
            <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 8px; flex-wrap: wrap">
              <div style="font-size: 4rem; line-height: 1">{{ product.emoji }}</div>
              <div style="flex: 1; min-width: 200px">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px">
                  <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary)">{{ product.productName }}</h1>
                  <span class="badge badge-cat">{{ hpCategoryLabel(product) }}</span>
                  <span v-if="product.salesYn !== 'Y'" class="badge badge-off">판매안함</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7; margin-bottom: 16px">{{ product.desc }}</p>
                <div style="font-size: 1.2rem; font-weight: 800; color: var(--blue); margin-bottom: 20px">{{ product.price }}</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center">
                  <button type="button" class="btn-blue" @click="handleBtnAction('product-demo')">🚀 30일 무료 데모 시작</button>
                  <nuxt-link :to="`/contact?pid=${product.productId}`" class="btn-outline">도입 문의</nuxt-link>
                  <nuxt-link v-if="product.salesYn === 'Y'" :to="`/order?pid=${product.productId}`" class="btn-outline">주문하기</nuxt-link>
                  <button type="button" class="detail-share-btn" title="공유하기" @click="handleBtnAction('product-share')">📤 공유하기</button>
                </div>
              </div>
            </div>
          </div>
          <div class="card card--static" style="padding: 28px; margin-bottom: 20px">
            <h2 style="font-size: 1rem; font-weight: 700; margin-bottom: 18px; color: var(--text-primary)">📋 주요 사양</h2>
            <div v-for="s in SPECS" :key="s.label" class="info-row">
              <span class="info-icon">{{ s.icon }}</span>
              <div>
                <div class="info-label">{{ s.label }}</div>
                <div class="info-val">{{ s.value }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 관련 상품: 같은 카테고리 먼저 -->
        <div>
          <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 14px; letter-spacing: 0.06em">관련 상품</div>
          <div style="display: flex; flex-direction: column; gap: 10px">
            <nuxt-link v-for="p in related" :key="p.productId" :to="`/products/${p.productId}`" class="card" style="padding: 16px; display: block">
              <div style="display: flex; align-items: center; gap: 10px">
                <span style="font-size: 1.5rem">{{ p.emoji }}</span>
                <div style="flex: 1; min-width: 0">
                  <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ p.productName }}</div>
                  <div style="font-size: 0.75rem; color: var(--blue); font-weight: 600">{{ p.price }}</div>
                </div>
              </div>
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 공유 시트 (브라우저 공유 기능이 없을 때) -->
    <div v-if="shareOpen" class="share-sheet-overlay" @click.self="shareOpen = false">
      <div class="share-sheet">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
          <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary)">공유하기</span>
          <button type="button" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--text-muted); padding: 0; line-height: 1" aria-label="닫기" @click="shareOpen = false">✕</button>
        </div>
        <div style="display: flex; gap: 24px; justify-content: center">
          <button type="button" class="share-sheet-btn" @click="handleBtnAction('share-kakao')">
            <div class="share-sheet-icon" style="background: #fee500">💬</div>
            <span>카카오톡</span>
          </button>
          <button type="button" class="share-sheet-btn" @click="handleBtnAction('share-copy')">
            <div class="share-sheet-icon" style="background: var(--bg-card); border: 1.5px solid var(--border)">🔗</div>
            <span>링크 복사</span>
          </button>
        </div>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import { HP_PRODUCTS, HP_SITE, hpCategoryLabel, hpProductById, hpRememberProduct } from "~/conts/tenant/homepg1";
import { hpToast, useHpDemo } from "~/layout/homepg1/hpUi";

const route = useRoute();
const openDemo = useHpDemo();

const product = computed(() => hpProductById(route.params.id));
// 없는 상품번호 → 이 모듈의 404 화면(throw 대신 showError: 초기화 오류로 콘솔에 찍히지 않게)
if (!product.value) showError({ statusCode: 404, statusMessage: "상품을 찾을 수 없습니다" });
useHead({ title: () => product.value?.productName ?? "상품상세" });
watch(() => product.value?.productId, (id) => { if (id) hpRememberProduct(id); }, { immediate: true });

const SPECS = [
  { icon: "☁️", label: "배포 방식", value: "SaaS (클라우드)" },
  { icon: "🔒", label: "보안", value: "AES-256 암호화, SOC2 인증" },
  { icon: "🔄", label: "업데이트", value: "자동 업데이트 (월 2회 이상)" },
  { icon: "📞", label: "지원", value: "이메일 + 채팅 (기본) / 전담 (엔터프라이즈)" },
  { icon: "🌐", label: "SLA", value: "99.9% 가동률 보장" },
];

/** 관련 상품 4개 — 같은 카테고리, 판매중 먼저 */
const related = computed(() => {
  const cur = product.value;
  if (!cur) return [];
  const score = (p: typeof cur) => (p.categoryId === cur.categoryId ? 2 : 0) + (p.salesYn === "Y" ? 1 : 0);
  return HP_PRODUCTS.filter((p) => p.productId !== cur.productId)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 4);
});

/* 공유 — 휴대폰 등 브라우저 공유 기능이 있으면 그걸, 없으면 시트(카카오톡·링크 복사) */
const shareOpen = ref(false);
const shareText = () => {
  const p = product.value!;
  return `[${HP_SITE.name}] ${p.productName}\n💰 ${p.price}\n${p.desc}\n🔗 ${window.location.href}`;
};

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  const p = product.value;
  if (!p) return;
  if (cmd === "product-demo") return openDemo(p);
  if (cmd === "product-share") {
    if (window.isSecureContext && navigator.share) {
      try {
        await navigator.share({ title: `${HP_SITE.name} - ${p.productName}`, text: shareText(), url: window.location.href });
        return;
      } catch {
        /* 취소·실패하면 시트로 */
      }
    }
    shareOpen.value = true;
    return;
  }
  if (cmd === "share-kakao") {
    window.location.href = `kakaotalk://msg/send?text=${encodeURIComponent(shareText())}`;
    setTimeout(() => (shareOpen.value = false), 300);
    return;
  }
  if (cmd === "share-copy") {
    shareOpen.value = false;
    try {
      await navigator.clipboard.writeText(shareText());
      hpToast("링크가 클립보드에 복사되었습니다.", "success");
    } catch {
      window.prompt("아래 내용을 복사하세요:", shareText());
    }
    return;
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>

<style scoped>
.detail-share-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  transition: all 0.2s;
  font-family: inherit;
}
.detail-share-btn:hover {
  border-color: var(--blue);
}
</style>
