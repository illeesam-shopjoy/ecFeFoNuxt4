/**
 * ec2 모듈 설정 — ec1 과 다른 이름·메뉴·기능 스위치를 둔다(확장성 시험). 메뉴는 core 의 기본 메뉴 대신 이 모듈이 직접 정한다.
 */
export default defineAppConfig({
  tenant: {
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
  },
});
