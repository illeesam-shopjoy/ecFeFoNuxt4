<template>
  <!-- danmoo1(당근 스타일) 공통 틀 — 모바일은 화면 전체, PC 는 가운데 최대 640px 앱 틀(반응형). 상단바는 화면마다 다르니 각 화면이 #top 슬롯(DmTopBar/DmTitleBar)으로 그린다. -->
  <div class="dm-app" :class="{ 'dm-app--notabs': !tabs }">
    <div class="dm-frame">
      <header v-if="$slots.top" class="dm-top">
        <slot name="top" />
      </header>
      <main class="dm-main" :class="{ 'pb-[72px]': tabs }">
        <slot />
      </main>
      <dm-bottom-tabs v-if="tabs" />
      <dm-fab v-if="fab" :to="fabTo" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DmBottomTabs from "~/components/danmoo1/dm/DmBottomTabs.vue";
import DmFab from "~/components/danmoo1/dm/DmFab.vue";

// 모바일 브라우저 상단 색·홈 화면 추가 시 앱처럼 보이게(당근색). 모듈 레이아웃이라 danmoo1 빌드에만 적용된다
useHead({
  meta: [
    { name: "theme-color", content: "#ff6f0f" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-title", content: "danmoo1" },
  ],
});

defineProps({
  /** 하단 탭(홈·커뮤니티·동네지도·채팅·나의) 표시 — 상세·채팅방 등 깊은 화면은 false */
  tabs: { type: Boolean, default: true },
  /** 글쓰기 플로팅 버튼 */
  fab: { type: Boolean, default: false },
  fabTo: { type: String, default: "/write" },
});
</script>

<style>
/* danmoo1 색 변수 — body 로 Teleport 되는 시트(DmSheet)도 써야 해서 :root 에 둔다. 이 레이아웃은 danmoo1 빌드에만 들어가므로 다른 모듈에는 영향이 없다. 다크(html.theme-dark)는 변수만 바꾼다. */
:root {
  --dm-bg: #ffffff;
  --dm-bg-soft: #f7f8f9;
  --dm-line: #e9ecef;
  --dm-text: #212529;
  --dm-text-2: #868e96;
  --dm-text-3: #adb5bd;
  --dm-primary: #ff6f0f;
  --dm-primary-soft: #fff1e8;
  --dm-chip: #f1f3f5;
}
html.theme-dark {
  --dm-bg: #1b1d1f;
  --dm-bg-soft: #121314;
  --dm-line: #2c2f33;
  --dm-text: #f1f3f5;
  --dm-text-2: #9aa0a6;
  --dm-text-3: #6b7177;
  --dm-primary-soft: #3a2415;
  --dm-chip: #2a2d31;
}
/* 2026-10-04(사용자 "목록의 바깥 바탕영역 검정색 아주조금만 회색톤으로 — 목록과 구분이 잘 안되서") — PC 에서 640px 틀 바깥 바탕은 --dm-page.
   라이트는 예전 그대로(--dm-bg-soft 와 같은 #f7f8f9), 다크는 목록(--dm-bg #1b1d1f)보다 살짝 밝은 회색이라 틀이 구분된다. */
:root {
  --dm-page: #f7f8f9;
}
html.theme-dark {
  --dm-page: #2a2c30;
}
.dm-app {
  min-height: 100vh;
  background: var(--dm-page);
  color: var(--dm-text);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  font-size: 15px;
  line-height: 1.45;
  -webkit-tap-highlight-color: transparent;
}
.dm-frame {
  position: relative;
  margin: 0 auto;
  min-height: 100vh;
  max-width: 640px;
  background: var(--dm-bg);
}
@media (min-width: 641px) {
  .dm-frame {
    box-shadow: 0 0 0 1px var(--dm-line);
  }
  /* 다크: 회색 바깥 위에 틀이 떠 보이게 테두리를 한 단계 밝게 + 옅은 그림자 */
  html.theme-dark .dm-frame {
    box-shadow: 0 0 0 1px #3a3d42, 0 0 28px rgba(0, 0, 0, 0.45);
  }
}
.dm-top {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--dm-bg);
}
.dm-main {
  min-height: calc(100vh - 56px);
}
/* 공통 소품 — 템플릿 전역 scss(ec1/ec2 용)의 제목·문단 여백을 이 틀 안에서는 되돌린다.
   2026-10-03: .dm-app 을 :where() 로 감싸 우선순위를 요소 선택자(0,0,1)로 낮췄다 — 예전(.dm-app button = 0,1,1)엔 Tailwind 유틸(0,1,0)보다 세서
   bg-[…]·border·mt-…·px-… 같은 클래스가 버튼·문단·목록에서 조용히 무시됐다(판매하기/나눔하기 선택 표시가 안 보이던 원인).
   테마 전역 규칙(p, button … 0,0,1)보다는 이 스타일이 나중에 로드돼 계속 이긴다. */
:where(.dm-app) h1, :where(.dm-app) h2, :where(.dm-app) h3, :where(.dm-app) h4, :where(.dm-app) p, :where(.dm-app) ul { margin: 0; color: inherit; line-height: inherit; }
:where(.dm-app) ul { padding: 0; list-style: none; }
:where(.dm-app) a { color: inherit; text-decoration: none; }
:where(.dm-app) button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
:where(.dm-app) input, :where(.dm-app) textarea, :where(.dm-app) select { font: inherit; color: var(--dm-text); }
:where(.dm-app) ::placeholder { color: var(--dm-text-3); }
:where(.dm-app) img { display: block; }
.dm-app .line { border-top: 1px solid var(--dm-line); }
.dm-app .muted { color: var(--dm-text-2); }
.dm-app .primary { color: var(--dm-primary); }
.dm-app .btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 48px; padding: 0 18px; border-radius: 8px; font-weight: 700; font-size: 15px;
  background: var(--dm-primary); color: #fff;
}
.dm-app .btn-primary:disabled { opacity: 0.5; cursor: default; }
.dm-app .btn-soft {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 40px; padding: 0 14px; border-radius: 8px; font-weight: 600; font-size: 14px;
  background: var(--dm-chip); color: var(--dm-text);
}
.dm-app .input {
  width: 100%; height: 44px; padding: 0 12px; border-radius: 8px; background: var(--dm-chip); border: 1px solid transparent; outline: 0;
}
.dm-app .input:focus { border-color: var(--dm-primary); background: var(--dm-bg); }
.dm-app .icon-btn { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 20px; }
.dm-app .icon-btn:active { background: var(--dm-chip); }
.dm-app .skeleton { background: linear-gradient(90deg, var(--dm-chip) 25%, var(--dm-line) 37%, var(--dm-chip) 63%); background-size: 400% 100%; animation: dm-sk 1.4s ease infinite; }
@keyframes dm-sk { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
.dm-app .no-scrollbar::-webkit-scrollbar { display: none; }
.dm-app .no-scrollbar { scrollbar-width: none; }
.dm-app .clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.dm-app .truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
/* 세그먼트 탭(알림·글쓰기·채팅 목록) */
.dm-app .dm-segs { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; border-bottom: 1px solid var(--dm-line); }
.dm-app .dm-seg { height: 44px; font-size: 15px; font-weight: 700; border-bottom: 2px solid transparent; color: var(--dm-text-2); }
.dm-app .dm-seg.on { border-color: var(--dm-text); color: var(--dm-text); }
/* 메뉴 줄(나의 danmoo·설정) */
.dm-app .dm-menu { width: 100%; display: flex; align-items: center; justify-content: space-between; height: 50px; font-size: 15.5px; text-align: left; }
.dm-app .dm-menu > span:first-child i { width: 28px; color: var(--dm-text-2); }
.dm-app .dm-menu .r { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--dm-text-2); }
</style>
