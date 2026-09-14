/**
 * baseConst.ts — 여러 컴포넌트/페이지가 공유하는 기본 상수 모음.
 *
 * 2026-09-14: beConst.ts(백엔드 origin)/feConst.ts(앱 자체 상태)로 분리했다가
 * ("나눌 의미 없는거 같은데 다시 합쳐줄수 있어?") 다시 이 파일 하나로 합쳤다.
 *
 * nuxt.config.ts가 상대경로(./app/conts/baseConst)로 이 파일을 가져다 쓴다 — Nuxt/Vue
 * 전용 import(컴포저블, ~/ 별칭 등)를 섞지 말 것(섞으면 nuxt.config.ts 로딩이 깨짐).
 * 시크릿(결제/소셜로그인 등)은 절대 여기 두지 않는다 — app/ 밑이라 클라이언트 번들에도
 * 들어갈 수 있음.
 */

/** ecBeCdn API origin("https://22400.illeesam.synology.me/api", server/utils/cdn.ts의 PROD_CDN과 동일 출처). 사용처는 `${CDN_URL}/cdn/prod/img/...` 형태로 조립. */
export const CDN_URL: string = process.env.NUXT_PUBLIC_PROD_CDN_BASE ?? "https://22400.illeesam.synology.me/api";

/** ecBeBo API origin. server/utils/beApi.ts(runtimeConfig.apiBaseUrl, server-only)와 동일 출처 — 여긴 화면 표시/클라이언트 조립용. */
export const API_URL: string = process.env.NUXT_API_BASE_URL ?? "https://22300.illeesam.synology.me";

/** 현재 실행 모드: "local" | "dev" | "prod". */
export const RUN_MODE: string = process.env.NUXT_PUBLIC_MODE ?? "prod";
