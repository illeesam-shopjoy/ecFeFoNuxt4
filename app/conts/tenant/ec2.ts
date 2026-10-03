/**
 * ec2 모듈 설정 — ec1 과 다른 이름·메뉴·기능 스위치를 둔다(확장성 시험). 메뉴는 공통 기본 메뉴 대신 이 모듈이 직접 정한다.
 * 화면은 app/pages/ec2 에 독립으로 있다(블로그·이벤트 화면은 두지 않았다).
 */
import type { TenantConfigType } from "~/types/tenantConfig";

const tenant: TenantConfigType = {
  id: "ec2",
  name: "ShopJoy EC2",
  tagline: "두 번째 사이트 모듈(멀티테넌트 시험)",
  appTitle: "shopjoy ec2",
  themeColor: "#2f6fd6",
  // 이 모듈의 전역 스타일 — app/assets/ec2/ (2026-10-03: 모듈마다 스타일을 따로 둔다. 쇼핑몰 테마 scss·다크테마를 모듈별 사본으로)
  css: ["vue3-carousel/dist/carousel.css", "~/assets/ec2/scss/main.scss", "~/assets/ec2/theme-dark.css"],
  features: { seller: true, blog: false, event: false, aiProdDraft: false }, // aiProdDraft: 사진으로 상품정보 자동 작성(Claude 연계) — 꺼 둠
  menus: [
    { menuTreeId: 1, link: "/", title: "홈" },
    { menuTreeId: 2, link: "/shop", title: "상품" },
    { menuTreeId: 3, link: "/ec2-intro", title: "EC2 소개" },
    { menuTreeId: 4, link: "/contact", title: "고객센터" },
  ],
};

export default tenant;
