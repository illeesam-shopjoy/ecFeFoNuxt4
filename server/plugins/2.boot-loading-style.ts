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
 * 덮어쓸(app/assets/prod/scss/_common.scss 의 body/body::before 규칙) 때까지 그대로 남는다.
 */
const BOOT_LOADING_STYLE = `<style>html,body{background:linear-gradient(135deg,#fdf8f0 0%,#f8ecd9 50%,#fdf8f0 100%);}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483647;
background-image:
  radial-gradient(3px 3px at 10% 20%, #fff4d6 0%, #f0b429 45%, transparent 75%),
  radial-gradient(2.5px 2.5px at 70% 12%, #fff4d6 0%, #f0b429 45%, transparent 75%),
  radial-gradient(3px 3px at 40% 55%, #fff4d6 0%, #f0b429 45%, transparent 75%),
  radial-gradient(2px 2px at 88% 62%, #fff4d6 0%, #f0b429 45%, transparent 75%),
  radial-gradient(3px 3px at 18% 85%, #fff4d6 0%, #f0b429 45%, transparent 75%),
  radial-gradient(2.5px 2.5px at 58% 92%, #fff4d6 0%, #f0b429 45%, transparent 75%);
background-size:140px 140px;
animation:shopjoyBootSparkleDrift 40s linear infinite,shopjoyBootSparkleTwinkle 2.4s ease-in-out infinite alternate;}
@keyframes shopjoyBootSparkleDrift{from{background-position:0 0}to{background-position:-140px 140px}}
@keyframes shopjoyBootSparkleTwinkle{from{opacity:.4}to{opacity:1}}
</style>`;

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    // unshift(맨 앞) — push로 넣으면 이 <style>이 entry.css(<link rel=stylesheet>)보다 뒤에 위치하게 되고,
    // 동일 우선순위(specificity)에서는 "문서상 더 나중에 나온 규칙"이 이긴다 — entry.css가 다운로드를
    // 끝내고 적용돼도(즉 _common.scss의 body::before{content:none}이 살아나도) 그보다 더 뒤에 있는 이
    // 별 효과가 계속 이겨서 홈페이지 진입 후에도 별이 안 사라지는 버그였다. 맨 앞에 둬야 entry.css가
    // 로드된 뒤 정상적으로 이 효과를 덮어쓴다.
    html.head.unshift(BOOT_LOADING_STYLE);
  });
});
