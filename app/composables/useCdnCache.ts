/**
 * SSR 페이지 응답을 Netlify CDN 에 잠깐 캐시시킨다 (2026-09-19). 서버 렌더 중 데이터가 실제로 있을 때만 호출할 것 —
 * 오류/빈 결과 페이지가 캐시되면 안 된다. 로그인 사용자별로 달라지는 내용이 서버 렌더 HTML 에 없는 공개 페이지에서만 사용.
 * Netlify-CDN-Cache-Control 은 브라우저/다른 호스팅에선 무시되고, 클라이언트에선 아무 일도 하지 않는다. (server/utils/cdnCache.ts 참고)
 */
export function useCdnCache(seconds: number, swrSeconds = seconds * 5): void {
  if (!import.meta.server) return;
  const header = useResponseHeader("netlify-cdn-cache-control");
  header.value = `public, max-age=${seconds}, stale-while-revalidate=${swrSeconds}, stale-if-error=86400, durable`;
}
