/**
 * tenantConfig.ts — 멀티테넌트 모듈 설정 타입 (2026-10-02).
 * 각 모듈 레이어(tenants/<모듈>/app/app.config.ts)가 `tenant` 를 채운다. core(app/)는 이 값을 useTenant() 로만 읽는다.
 * 프로젝트(app/)가 레이어보다 우선이라 core 가 같은 키의 기본값을 app.config 에 두면 레이어가 덮을 수 없다 — 기본값은 useTenant() 의 폴백으로만 둔다.
 */
import type { SyMenuTreeType } from "~/types/sy/syMenuTreeType";

export interface TenantConfigType {
  /** 모듈 ID (ec1, ec2 …) — tenants/<모듈> 과 같다 */
  id: string;
  /** 화면 표시용 이름(헤더/푸터/타이틀) */
  name: string;
  /** 한 줄 소개(선택) */
  tagline?: string;
  /** 상단·모바일 메뉴. 없으면 core 의 기본 메뉴(conts/foMenus.ts)를 쓴다 */
  menus?: SyMenuTreeType[];
  /** 모듈별 기능 스위치 (예: { seller: true }) — 화면이 필요할 때 useTenant().features 로 읽는다 */
  features?: Record<string, boolean>;
}

declare module "nuxt/schema" {
  interface AppConfigInput {
    tenant?: TenantConfigType;
  }
  interface AppConfig {
    tenant?: TenantConfigType;
  }
}

export {};
