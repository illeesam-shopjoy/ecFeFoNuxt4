/**
 * ec1 모듈 설정 — useTenant() 가 읽는다(nuxt.config.ts 의 #tenant 별칭이 빌드할 때 이 파일을 고른다).
 * menus 를 생략하면 공통 기본 메뉴(app/conts/foMenus.ts)를 쓴다(ec1 은 현재 쇼핑몰 그대로라 생략).
 */
import type { TenantConfigType } from "~/types/tenantConfig";

const tenant: TenantConfigType = {
  id: "ec1",
  name: "ShopJoy",
  tagline: "패션·라이프스타일 쇼핑몰",
  appTitle: "shopjoy",
  themeColor: "#bc8246",
  features: { seller: true, blog: true, event: true, aiProdDraft: false }, // aiProdDraft: 판매 상품 관리의 "사진으로 자동 작성"(Claude 연계) — 호출마다 비용이 들어 꺼 둠(2026-10-02). 켜려면 true + 백엔드 sy_prop app.ai.claude.api-key
};

export default tenant;
