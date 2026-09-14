/**
 * CDN 베이스 URL
 *
 * 환경변수 NUXT_PUBLIC_PROD_CDN_BASE 로 오버라이드 가능(server/utils/cdn.ts의 PROD_CDN과 동일 출처).
 * CDN_URL(템플릿 데모 이미지용, `${CDN_URL}/cdn/prod/img/...` 형태로 조립)은
 * 2026-09-14부터 app/conts/baseConst.ts로 이동 — 이 PROD_CDN을 그대로 가져다 쓴다.
 */
export const PROD_CDN: string = process.env.NUXT_PUBLIC_PROD_CDN_BASE ?? "https://22400.illeesam.synology.me/api/cdn";
export const MODE: string = process.env.NUXT_PUBLIC_MODE ?? "default";
