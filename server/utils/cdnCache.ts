import type { H3Event } from "h3";

/**
 * 성공한 공개 GET 응답에 CDN 캐시 헤더를 붙인다 (2026-09-19).
 *
 * 배경: 운영(Netlify) 함수 → 자택 NAS(ecBeBo) 사이가 WAN 이라 호출 1번이 0.5~1초+(TLS 핸드셰이크 포함)이고 함수 콜드스타트까지
 * 겹쳐 상품 상세가 6~8초, 상품목록이 14초씩 걸렸다. 로그인과 무관한 공개 데이터는 Netlify CDN 에서 잠깐 캐시하면 대부분의 요청이
 * 함수/백엔드를 아예 거치지 않는다.
 *
 * - `Netlify-CDN-Cache-Control` 은 Netlify CDN 전용 헤더(브라우저·다른 호스팅에선 무시됨 — synol Docker 에서도 무해).
 *   ⚠ 이 대상지정 헤더에서는 s-maxage 가 아니라 max-age 를 써야 신선도로 인정된다(s-maxage 로 보냈더니 저장만 되고 매번 원본 재조회 — 2026-09-19 실측).
 *   durable = 엣지 노드마다가 아니라 Netlify 중앙(내구성) 캐시를 함께 써서 트래픽이 적어도 hit 가 나오게 한다.
 * - max-age 동안은 신선, 그 뒤 swr 동안은 낡은 응답을 즉시 주면서 뒤에서 갱신(stale-while-revalidate).
 * - 새 배포 시 Netlify 가 캐시를 자동 무효화한다.
 * - 성공(2xx) 응답에서만 호출할 것 — 오류 응답(502 등)이 캐시되면 안 된다. 로그인이 필요한/사용자별 응답에는 절대 쓰지 말 것.
 */
export function cdnCache(event: H3Event, seconds: number, swrSeconds = seconds * 5): void {
  setHeader(event, "netlify-cdn-cache-control", `public, max-age=${seconds}, stale-while-revalidate=${swrSeconds}, durable`);
}
