/**
 * siteModuleCheck.client.ts — 앱 시작 때(홈 접근 포함) 사이트·모듈 짝을 백엔드와 대조하고, "사이트 정상여부 체크" 토글 값을 읽는다 (2026-10-03).
 * 결과는 useSiteModuleCheck().state — 각 모듈 상단 로고 옆 (X) 표시가 읽는다.
 */
export default defineNuxtPlugin(() => {
  useSiteCheckToggle().load();
  const { run } = useSiteModuleCheck();
  // 첫 화면 그리기를 막지 않도록 마운트 뒤에 조회한다
  onNuxtReady(() => {
    run();
  });
});
