/**
 * beConst.ts — 이 앱이 호출하는 백엔드 서비스(ecBeBo/ecBeCdn) origin 상수.
 *
 * 2026-09-14(요청사항: "baseConst.ts를 beConst.ts / feConst.ts로 분리하는건 어때?") —
 * baseConst.ts에서 분리. "이 앱 자체"에 관한 값(RUN_MODE 등)은 feConst.ts로.
 *
 * nuxt.config.ts가 상대경로(./app/conts/beConst)로 이 파일을 가져다 쓴다 — Nuxt/Vue
 * 전용 import(컴포저블, ~/ 별칭 등)를 섞지 말 것(섞으면 nuxt.config.ts 로딩이 깨짐).
 * 시크릿(결제/소셜로그인 등)은 절대 여기 두지 않는다 — app/ 밑이라 클라이언트 번들에도
 * 들어갈 수 있음.
 */

/** ecBeCdn API origin("https://22400.illeesam.synology.me/api", server/utils/cdn.ts의 PROD_CDN과 동일 출처). 사용처는 `${CDN_URL}/cdn/prod/img/...` 형태로 조립. */
export const CDN_URL: string = process.env.NUXT_PUBLIC_PROD_CDN_BASE ?? "https://22400.illeesam.synology.me/api";

/** ecBeBo API origin. server/utils/beApi.ts(runtimeConfig.apiBaseUrl, server-only)와 동일 출처 — 여긴 화면 표시/클라이언트 조립용. */
export const API_URL: string = process.env.NUXT_API_BASE_URL ?? "https://22300.illeesam.synology.me";
