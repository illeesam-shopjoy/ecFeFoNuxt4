/**
 * devSite.ts — 개발 전용 "사이트 바꿔 보기" 공용 값 (2026-10-03). 쓰는 곳: plugins/0.devSite.ts(쿠키 → 상태), app.vue(상단 개발 표시줄).
 */

/** 개발 사이트 쿠키 이름 앞부분 — 뒤에 모듈 ID (쿠키는 포트를 가리지 않아 같은 호스트의 다른 모듈 앱과 섞이지 않게) */
export const DEV_SITE_COOKIE_PREFIX = "modu-dev-site-";

/** 사이트 ID 모양(SI260001 등) — 엉뚱한 값은 버린다 */
export const DEV_SITE_ID_RE = /^[A-Za-z0-9_-]{1,21}$/;

/** 운영 빌드인가 — Netlify 는 환경파일 없이 "prod", 운영 프로파일 빌드는 "production"(.env.production), 값이 없으면 운영으로 본다(HeaderLogo 의 표시와 같은 규칙) */
export function isProdRunMode(mode: unknown): boolean {
  const m = String(mode ?? "");
  return m === "" || m === "prod" || m === "production";
}

/**
 * 모듈별 NAS 개발 배포 포트 — z0scripts/shopjoy-apps-dev/ecFeFoNuxt4-<모듈> (2026-10-03).
 * 모듈은 빌드마다 고정이라 개발 표시줄에서 모듈을 바꾸면 그 모듈의 개발 주소로 이동한다(같은 호스트, 이 포트).
 */
export const DEV_MODULE_PORTS: Record<string, number> = {
  ec1: 22001,
  ec2: 22002,
  danmoo1: 22003,
  homepg1: 22004,
  datavisual1: 22005,
  bbm1: 22006,
};
