/**
 * ec1 모듈 설정 — useTenant() 가 읽는다. menus 를 생략하면 core 의 기본 메뉴(app/conts/foMenus.ts)를 쓴다(ec1 은 현재 쇼핑몰 그대로라 생략).
 */
export default defineAppConfig({
  tenant: {
    id: "ec1",
    name: "ShopJoy",
    tagline: "패션·라이프스타일 쇼핑몰",
    features: { seller: true, blog: true, event: true },
  },
});
