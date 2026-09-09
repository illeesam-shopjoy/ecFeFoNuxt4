/**
 * CDN 베이스 URL (서버 전용)
 * 환경변수 NUXT_PUBLIC_CDN_BASE 로 오버라이드 가능
 */
export const CDN: string = process.env.NUXT_PUBLIC_CDN_BASE ?? "/cdn/img";
export const MODE: string = process.env.NUXT_PUBLIC_MODE ?? "default";

/**
 * 실 상품/리뷰 이미지 CDN(ecBeCdn) base. CDN 위 CDN(위 CDN은 템플릿 로컬 데모 이미지용)과는 별개.
 * ecBeBo가 이미 절대 URL(cdnImgUrl 등)로 내려주면 그대로 쓰고, 상대경로만 있을 때 이 base로 조립한다.
 */
export const PROD_CDN: string = process.env.NUXT_PUBLIC_PROD_CDN_BASE ?? "https://22400.illeesam.synology.me/api/cdn";

/**
 * path가 이미 절대 URL(http/https)이면 그대로, "/cdn/..."로 시작하면(2026-09 확인된 시드데이터
 * 버그 패턴 — "/api" 세그먼트 누락) PROD_CDN 오리진 + "/api/cdn/..."로 보정, 그 외 상대경로면
 * PROD_CDN을 그대로 붙인다. path가 없으면 undefined.
 */
export function resolveProdCdnUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/cdn/")) {
    const origin = PROD_CDN.replace(/\/api\/cdn\/?$/, "");
    return `${origin}/api${path}`;
  }
  return `${PROD_CDN}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * blogContent 등 ecBeBo가 내려주는 HTML 본문 안의 `<img src="/cdn/...">` 상대경로를 절대 URL로 고쳐준다.
 * 2026-09 확인: 시뮬레이션 데이터의 본문 img가 "/cdn/..."(← "/api/cdn/..."이어야 정상)으로
 * "/api" 세그먼트가 빠진 채 들어있어 그대로 두면 404난다 — ecBeBo/시드데이터 쪽 버그로 보이며
 * BFF에서 방어적으로 보정한다.
 */
export function fixRelativeCdnImgSrc(html: string | null | undefined): string {
  if (!html) return "";
  const origin = PROD_CDN.replace(/\/api\/cdn\/?$/, "");
  return html.replace(/(src=["'])\/cdn\//g, `$1${origin}/api/cdn/`);
}
