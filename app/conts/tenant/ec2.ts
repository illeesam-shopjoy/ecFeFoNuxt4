/**
 * ec2 모듈 설정 — ec1 과 다른 이름·메뉴·기능 스위치를 둔다(확장성 시험). 메뉴는 공통 기본 메뉴 대신 이 모듈이 직접 정한다.
 * 블로그·이벤트 화면은 app/pages/ec1 에만 있어 이 모듈 빌드에는 그 주소가 없다.
 */
import type { TenantConfigType } from "~/types/tenantConfig";

const tenant: TenantConfigType = {
  id: "ec2",
  name: "ShopJoy EC2",
  tagline: "두 번째 사이트 모듈(멀티테넌트 시험)",
  features: { seller: true, blog: false, event: false },
  menus: [
    { menuTreeId: 1, link: "/", title: "홈" },
    { menuTreeId: 2, link: "/shop", title: "상품" },
    { menuTreeId: 3, link: "/ec2-intro", title: "EC2 소개" },
    { menuTreeId: 4, link: "/contact", title: "고객센터" },
  ],
};

export default tenant;
