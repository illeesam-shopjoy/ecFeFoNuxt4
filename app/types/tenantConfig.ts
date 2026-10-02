/**
 * tenantConfig.ts — 멀티테넌트 모듈 설정 타입 (2026-10-02).
 * 모듈마다 app/conts/tenant/<모듈>.ts 가 이 모양으로 값을 채우고, 화면은 useTenant() 로만 읽는다.
 */
import type { SyMenuTreeType } from "~/types/sy/syMenuTreeType";

export interface TenantConfigType {
  /** 모듈 ID (ec1, ec2 …) — app/pages/<모듈>, app/conts/tenant/<모듈>.ts 와 같다 */
  id: string;
  /** 화면 표시용 이름(헤더/푸터/타이틀) */
  name: string;
  /** 한 줄 소개(선택) */
  tagline?: string;
  /** 상단·모바일 메뉴. 없으면 공통 기본 메뉴(conts/foMenus.ts)를 쓴다 */
  menus?: SyMenuTreeType[];
  /** 모듈별 기능 스위치 (예: { seller: true }) — 화면이 필요할 때 useTenant().features 로 읽는다 */
  features?: Record<string, boolean>;
}
