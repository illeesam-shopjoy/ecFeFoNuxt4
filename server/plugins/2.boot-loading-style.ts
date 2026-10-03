/**
 * 2026-09-23(요청사항: "핸드폰에서 netlify FO 열때 흰백색이 1~2.5초 보이고 오픈되 — 은은한 배경효과나
 * 이미지 보여주면 좋겠는데" / "백지화면대신 움직이는 별효과 이런거가 보였으면 좋겠어") — 앱 CSS/JS가
 * 실제로 로드되기 전까지 브라우저 기본 흰 배경만 보이는 문제를 완화한다. 브랜드 톤 그라디언트 +
 * 은은하게 반짝이는 금색 별(순수 CSS, 이미지/스크립트 요청 없음)을 문서 <head>에 직접 심는다.
 *
 * nuxt.config의 app.head.style 로는 안 된다 — Nuxt가 app.head를 unhead에 mode:"server"로
 * 등록해서, 클라이언트 JS가 부팅되자마자(=이 CSS보다 훨씬 먼저, 헤드리스 브라우저로 재현해보면
 * 로컬에서도 400ms 안에) unhead 클라이언트 쪽이 그 <style> 태그를 지워버린다 — 정작 느린 진짜
 * CSS(entry.css, 수백 KB) 다운로드가 끝나기 한참 전에 사라져서 아무 효과가 없었다. 이 render:html
 * Nitro 훅은 unhead를 거치지 않는 순수 정적 마크업이라, 실제 앱 CSS가 로드되어 자연스럽게
 * 덮어쓸(쇼핑몰 모듈은 app/assets/<모듈>/scss/_common.scss, homepg1·datavisual1 은 app/assets/<모듈>/style.css 의 body/body::before 규칙) 때까지 그대로 남는다.
 */
/**
 * 모듈별 부팅 화면 색(바탕 그라디언트, 별 가운데·바깥 색) — 앱 CSS 가 오기 전 잠깐 보이는 색이 그 모듈 화면과 맞도록(2026-10-03).
 * 홈페이지(homepg1)는 밝은 하늘색, 대시보드(datavisual1, 기본 다크)는 어두운 남색. 없는 모듈은 ShopJoy 베이지·금색.
 */
const BOOT_TONES: Record<string, { bg: string; core: string; glow: string }> = {
  homepg1: { bg: "#f0f4ff 0%,#e2ebff 50%,#f0f4ff 100%", core: "#e6f7ff", glow: "#0099cc" },
  datavisual1: { bg: "#0d1117 0%,#141c2c 50%,#0d1117 100%", core: "#e0f7ff", glow: "#00aaff" },
  // 2026-10-03: danmoo1 기본 테마가 다크(사용자 "기본스킨 검정") — 로딩 화면도 검정 바탕 + 당근색 빛
  danmoo1: { bg: "#121314 0%,#1b1d1f 50%,#121314 100%", core: "#ffe6d5", glow: "#ff6f0f" },
};
const DEFAULT_TONE = { bg: "#fdf8f0 0%,#f8ecd9 50%,#fdf8f0 100%", core: "#fff4d6", glow: "#f0b429" };

function bootLoadingStyle(tone: { bg: string; core: string; glow: string }): string {
  const star = (size: string, at: string) => `radial-gradient(${size} ${size} at ${at}, ${tone.core} 0%, ${tone.glow} 45%, transparent 75%)`;
  return `<style>html,body{background:linear-gradient(135deg,${tone.bg});}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483647;
background-image:
  ${star("3px", "10% 20%")},
  ${star("2.5px", "70% 12%")},
  ${star("3px", "40% 55%")},
  ${star("2px", "88% 62%")},
  ${star("3px", "18% 85%")},
  ${star("2.5px", "58% 92%")};
background-size:140px 140px;
animation:shopjoyBootSparkleDrift 40s linear infinite,shopjoyBootSparkleTwinkle 2.4s ease-in-out infinite alternate;}
@keyframes shopjoyBootSparkleDrift{from{background-position:0 0}to{background-position:-140px 140px}}
@keyframes shopjoyBootSparkleTwinkle{from{opacity:.4}to{opacity:1}}
</style>`;
}

export default defineNitroPlugin((nitroApp) => {
  // 한 빌드 = 한 모듈이라 처음 한 번만 만든다
  let bootStyle = "";
  nitroApp.hooks.hook("render:html", (html) => {
    if (!bootStyle) bootStyle = bootLoadingStyle(BOOT_TONES[String(useRuntimeConfig().public.tenantModule ?? "")] ?? DEFAULT_TONE);
    // unshift(맨 앞) — push로 넣으면 이 <style>이 entry.css(<link rel=stylesheet>)보다 뒤에 위치하게 되고,
    // 동일 우선순위(specificity)에서는 "문서상 더 나중에 나온 규칙"이 이긴다 — entry.css가 다운로드를
    // 끝내고 적용돼도(즉 _common.scss의 body::before{content:none}이 살아나도) 그보다 더 뒤에 있는 이
    // 별 효과가 계속 이겨서 홈페이지 진입 후에도 별이 안 사라지는 버그였다. 맨 앞에 둬야 entry.css가
    // 로드된 뒤 정상적으로 이 효과를 덮어쓴다.
    html.head.unshift(bootStyle);
  });
});
