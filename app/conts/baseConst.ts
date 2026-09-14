/**
 * baseConst.ts — 여러 컴포넌트/페이지가 공유하는 기본 상수 모음.
 *
 * 2026-09-14 요청사항 반영:
 * - "import { CDN_URL } from '~/utils/cdn' 를 import { CDN_URL } from '~/conts/baseConst' 로
 *   변경하는건 어때?" — CDN_URL을 이 파일로 이동.
 * - "API_URL 로 정의해주고 사용하면 좋겠어" — ecBeBo API origin(nuxt.config.ts의
 *   apiBaseUrlDisplay 기본값과 동일 출처: NUXT_API_BASE_URL).
 * - "RUN_MODE local, dev, prod 이것도 추가해줘" — 현재 실행 모드(nuxt.config.ts의
 *   public.mode 기본값과 동일 출처: NUXT_PUBLIC_MODE).
 * - "ecFeFoNuxt4/app/utils/cdn.ts 파일 없어도 될거 같아" — PROD_CDN을 이 파일로 그대로
 *   흡수(server/utils/cdn.ts의 동명 상수와 같은 env, NUXT_PUBLIC_PROD_CDN_BASE)하고
 *   app/utils/cdn.ts는 삭제.
 * - "NUXT_PUBLIC_PROD_CDN_BASE=.../api/cdn 를 .../api 로 해줘" — 값 자체에서 "/cdn"을 뗐다.
 *   CDN_URL은 이제 그 값을 그대로 쓰면 되고(더 이상 벗겨낼 접미사가 없음), "/cdn"은 각
 *   사용처가 `${CDN_URL}/cdn/prod/img/...`처럼 필요할 때 직접 붙인다.
 *
 * EnvModeBadge.vue가 이 세 상수를 가져다 쓴다(예전엔 useRuntimeConfig().public.* 직접 참조).
 */

/** ecBeCdn API origin("https://22400.illeesam.synology.me/api", server/utils/cdn.ts의 PROD_CDN과 동일 출처). 사용처는 `${CDN_URL}/cdn/prod/img/...` 형태로 조립. */
export const CDN_URL: string = process.env.NUXT_PUBLIC_PROD_CDN_BASE ?? "https://22400.illeesam.synology.me/api";

/** ecBeBo API origin. server/utils/beApi.ts(runtimeConfig.apiBaseUrl, server-only)와 동일 출처 — 여긴 화면 표시/클라이언트 조립용. */
export const API_URL: string = process.env.NUXT_API_BASE_URL ?? "https://22300.illeesam.synology.me";

/** 현재 실행 모드: "local" | "dev" | "prod". */
export const RUN_MODE: string = process.env.NUXT_PUBLIC_MODE ?? "prod";
