/**
 * useTenant — 이 배포(사이트·모듈)의 정보를 한 곳에서 읽는 컴포저블 (멀티테넌트, 2026-10-02).
 * 사이트/사이트코드는 환경파일(runtimeConfig.public), 이름·메뉴·기능은 모듈 레이어의 app.config.ts(tenant) 에서 온다.
 */
import type { TenantConfigType } from "~/types/tenantConfig";
import { STATIC_MENUS } from "~/conts/foMenus";

export function useTenant() {
  const pub = useRuntimeConfig().public;
  const cfg: Partial<TenantConfigType> = useAppConfig().tenant ?? {};
  return {
    /** 백엔드 sy_site.site_id (X-Site-Id 헤더 값) */
    siteId: String(pub.siteId),
    /** 모듈(ec1, ec2 …) */
    moduleId: cfg.id ?? String(pub.tenantModule),
    name: cfg.name ?? String(pub.appTitle),
    tagline: cfg.tagline ?? "",
    /** 상단·모바일 메뉴 — 모듈이 정하지 않으면 core 기본 메뉴 */
    menus: cfg.menus ?? STATIC_MENUS,
    features: cfg.features ?? ({} as Record<string, boolean>),
  };
}
