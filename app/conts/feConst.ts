/**
 * feConst.ts — 이 앱(프론트) 자체의 상태를 나타내는 상수.
 *
 * 2026-09-14(요청사항: "baseConst.ts를 beConst.ts / feConst.ts로 분리하는건 어때?") —
 * baseConst.ts에서 분리. 백엔드 서비스 origin(CDN_URL/API_URL)은 beConst.ts로.
 *
 * nuxt.config.ts가 상대경로(./app/conts/feConst)로 이 파일을 가져다 쓴다 — beConst.ts와
 * 같은 이유로 Nuxt/Vue 전용 import를 섞지 말 것.
 */

/** 현재 실행 모드: "local" | "dev" | "prod". */
export const RUN_MODE: string = process.env.NUXT_PUBLIC_MODE ?? "prod";
