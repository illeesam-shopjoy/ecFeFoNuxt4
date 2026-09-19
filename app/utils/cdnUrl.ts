/**
 * cdnUrl.ts — ecBeCdn(CDN 서버) 이미지/파일 URL 조립. 브라우저(직접 호출 svc)와 서버(SSR 라우트)가 함께 쓴다.
 * CDN origin 은 실행 환경마다 얻는 곳이 달라(브라우저: runtimeConfig.public.prodCdnBase, 서버: server/utils/cdn.ts PROD_CDN)
 * 호출부가 base 를 넘긴다. base 는 "/cdn" 없는 API origin(예: https://22400.illeesam.synology.me/api).
 */

/** 상대경로면 `${base}/cdn/...` 로 조립, 이미 http(s) 절대 URL 이면 그대로. */
export function resolveCdnUrl(path: string | null | undefined, base: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/cdn/")) return `${base}${path}`;
  return `${base}/cdn${path.startsWith("/") ? path : `/${path}`}`;
}

/** HTML 본문 안 `src="/cdn/..."` 상대 이미지 경로를 CDN 절대 URL 로 보정. */
export function fixRelativeCdnImgSrc(html: string | null | undefined, base: string): string {
  if (!html) return "";
  return html.replace(/(src=["'])\/cdn\//g, `$1${base}/cdn/`);
}
