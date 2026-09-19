/**
 * beConfig.ts — 브라우저 직접 호출(svc)이 쓰는 실행 환경 설정 저장소.
 * app/plugins/beClient.ts 가 앱 시작 시 runtimeConfig 값을 채운다. (svc 의 비동기 구간에서는
 * useRuntimeConfig() 를 못 쓸 수 있어 — 특히 서버 렌더링 — 모듈 전역에 미리 넣어둔다. 값은 상수라 요청 간 공유돼도 무해.)
 */
export const beConfig = {
  /** ecCdn API origin("/cdn" 없음) — 상품/블로그 이미지 URL 조립용 */
  cdnBase: "",
};
