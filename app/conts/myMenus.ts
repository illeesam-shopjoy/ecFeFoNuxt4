/** 마이페이지 좌측 메뉴 (그룹별) — MyMenu.vue 가 그린다. key 는 현재 화면 표시(active)와 맞춘다 */
export interface MyMenuItem {
  key: string;
  label: string;
  to: string;
  icon: string;
}
export interface MyMenuGroup {
  title: string;
  items: MyMenuItem[];
}

export const MY_MENU_GROUPS: MyMenuGroup[] = [
  {
    title: "내 정보",
    items: [
      { key: "profile", label: "개인정보 수정", to: "/my/profile", icon: "👤" },
      { key: "card", label: "결제카드 등록", to: "/my/card", icon: "💳" },
      { key: "addr", label: "주소정보 관리", to: "/my/addr", icon: "📍" },
    ],
  },
  {
    title: "쇼핑",
    items: [
      { key: "order", label: "주문", to: "/my/order", icon: "📦" },
      { key: "claim", label: "취소/반품/교환", to: "/my/claim", icon: "↩️" },
      { key: "coupon", label: "쿠폰", to: "/my/coupon", icon: "🎟️" },
      { key: "cache", label: "캐쉬 · 충전", to: "/my/cache", icon: "💰" },
    ],
  },
  {
    title: "활동",
    items: [
      { key: "review", label: "리뷰 관리", to: "/my/review", icon: "⭐" },
      { key: "qna", label: "상품문의 관리", to: "/my/qna", icon: "❓" },
      { key: "contact", label: "1:1 문의", to: "/my/contact", icon: "📩" },
      { key: "chatt", label: "채팅", to: "/my/chatt", icon: "💬" },
    ],
  },
];
