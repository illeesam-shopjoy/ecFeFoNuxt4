/**
 * useTenant — 이 배포(사이트·모듈)의 정보를 한 곳에서 읽는 컴포저블 (멀티테넌트, 2026-10-02).
 * 사이트는 환경파일(runtimeConfig.public), 이름·메뉴·기능은 모듈 설정(app/conts/tenant/<모듈>.ts)에서 온다.
 * #tenant 는 nuxt.config.ts 가 빌드할 때 이 배포의 모듈 설정 파일로 연결한다 — 다른 모듈의 설정은 번들에 들어가지 않는다.
 */
import tenantConfig from "#tenant";
import { STATIC_MENUS } from "~/conts/foMenus";

export function useTenant() {
  const pub = useRuntimeConfig().public;
  return {
    /** 백엔드 sy_site.site_id (X-Site-Id 헤더 값) */
    siteId: String(pub.siteId),
    /** 모듈(ec1, ec2 …) */
    moduleId: tenantConfig.id,
    name: tenantConfig.name,
    tagline: tenantConfig.tagline ?? "",
    /** 상단·모바일 메뉴 — 모듈이 정하지 않으면 공통 기본 메뉴 */
    menus: tenantConfig.menus ?? STATIC_MENUS,
    features: tenantConfig.features ?? ({} as Record<string, boolean>),
  };
}
