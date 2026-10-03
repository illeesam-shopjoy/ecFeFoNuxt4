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
  /** 브라우저 탭 제목(useHead titleTemplate) — 없으면 name. 2026-10-03: 환경파일 NUXT_PUBLIC_APP_TITLE 에서 이리로 이동 */
  appTitle?: string;
  /** 테넌트 대표색(tailwind `theme` 색) — 없으면 #bc8246. 2026-10-03: 환경파일 NUXT_PUBLIC_THEME_COLOR 에서 이리로 이동 */
  themeColor?: string;
  /** 상단·모바일 메뉴. 없으면 공통 기본 메뉴(conts/foMenus.ts)를 쓴다 */
  menus?: SyMenuTreeType[];
  /** 모듈별 기능 스위치 (예: { seller: true }) — 화면이 필요할 때 useTenant().features 로 읽는다 */
  features?: Record<string, boolean>;
  /**
   * 이 모듈 빌드의 전역 스타일(nuxt.config `css`) — 필수. 모듈 스타일은 app/assets/<모듈>/ 에 따로 둔다(2026-10-03).
   * 쇼핑몰 모듈(ec1·ec2·danmoo1)은 테마 scss·다크테마 사본, 홈페이지(homepg1)·대시보드(datavisual1)는 자기 스타일시트 하나.
   * 경로는 nuxt 별칭(~ = app) 기준, node_modules 패키지 css 도 넣을 수 있다(예: vue3-carousel/dist/carousel.css).
   */
  css: string[];
}
