/**
 * cache.ts — Nitro(Netlify Functions) 프로세스 내 메모리 TTL 캐시.
 *
 * 2026-09-13: 홈 화면 SSR 시 히어로슬라이더/카테고리/브랜드로고/공지사항/공통코드 등
 * 6~8개 ecBeBo 호출이 한 요청에서 동시에 나가는데, 백엔드가 자택 Synology NAS라
 * 동시접속 처리 한계에 걸려 일부가 타임아웃(502)나는 현상 확인(직접 호출은 0.2초,
 * BFF 경유는 1~6초). 공개·비개인화 조회(위젯/공통코드/게시글 목록/카테고리 등)는
 * 실시간성이 크게 중요하지 않으므로 짧은 TTL로 캐싱해 NAS 동시 부하 자체를 줄인다.
 *
 * ⚠️ 서버리스(Netlify Functions) 특성상 이 캐시는 "같은 웜 컨테이너"에서만 유효하고
 * 콜드스타트/다른 인스턴스에는 적용되지 않는다 — 완전한 캐시가 아니라 트래픽이 몰릴 때
 * 중복 호출을 줄여주는 완화책. 정확도가 중요한 개인화/쓰기 API에는 사용하지 말 것.
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
// 동시에 같은 key를 요청하면 같은 in-flight Promise를 공유해 중복 호출 자체를 막는다.
const inflight = new Map<string, Promise<unknown>>();

export async function cachedCall<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const p = (async () => {
    try {
      const value = await fn();
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}
