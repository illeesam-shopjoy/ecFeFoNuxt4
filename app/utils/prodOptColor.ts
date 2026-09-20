/** prodOptColor.ts — 색상 옵션코드(prodOptStdCd) → 스와치 색상. 상품상세 옵션선택과 상품 목록 카드가 같이 쓴다. */
const COLOR_MAP: Record<string, string> = {
  color01: "#E74C3C", // 빨강
  color02: "#3498DB", // 파랑
  color03: "#2ECC71", // 초록
  color04: "#F1C40F", // 노랑
  color05: "#9B59B6", // 보라
  color06: "#1A1A1A", // 검정
  color07: "#95A5A6", // 회색
  color08: "#F8F9FA", // 흰색
  color09: "#8B6347", // 갈색
  color10: "#000000", // 블랙
  // 2026-09-19: 실제 옵션코드는 VAL_COLOR_* (pd_prod_opt_val) — 위 color01..10 매핑만으로는 전부 회색(#ccc)으로 나왔다
  VAL_COLOR_BLACK: "#1A1A1A", // 블랙
  VAL_COLOR_WHITE: "#FFFFFF", // 화이트
  VAL_COLOR_IVORY: "#F5EFDC", // 아이보리
  VAL_COLOR_GRAY: "#9E9E9E", // 그레이
  VAL_COLOR_CHARCOAL: "#36454F", // 차콜
  VAL_COLOR_NAVY: "#1F2A44", // 네이비
  VAL_COLOR_BLUE: "#2F6FDE", // 블루
  VAL_COLOR_KHAKI: "#8B8A55", // 카키
  VAL_COLOR_BEIGE: "#D9C3A0", // 베이지
  VAL_COLOR_BROWN: "#7B4B2A", // 브라운
  VAL_COLOR_RED: "#D32F2F", // 레드
  VAL_COLOR_BURGUNDY: "#7B1E3A", // 버건디
  VAL_COLOR_PINK: "#F4A6C0", // 핑크
  VAL_COLOR_PURPLE: "#7E57C2", // 퍼플
  VAL_COLOR_MUSTARD: "#D4A017", // 머스타드
  VAL_COLOR_ORANGE: "#F57C00", // 오렌지
};

export const prodOptSwatchColor = (stdCd?: string | null): string => COLOR_MAP[stdCd ?? ""] ?? "#ccc";

/** 목록 화면 색상 필터에 항상 보여주는 표준 색상(코드 pd_prod_opt_val VAL_COLOR_*, 이름) — 사이즈 등 다른 필터로 상품이 줄어도 색상 목록은 그대로다 */
export const PROD_COLOR_OPTIONS: { code: string; nm: string }[] = [
  { code: "VAL_COLOR_BLACK", nm: "블랙" },
  { code: "VAL_COLOR_WHITE", nm: "화이트" },
  { code: "VAL_COLOR_IVORY", nm: "아이보리" },
  { code: "VAL_COLOR_GRAY", nm: "그레이" },
  { code: "VAL_COLOR_CHARCOAL", nm: "차콜" },
  { code: "VAL_COLOR_NAVY", nm: "네이비" },
  { code: "VAL_COLOR_BLUE", nm: "블루" },
  { code: "VAL_COLOR_KHAKI", nm: "카키" },
  { code: "VAL_COLOR_BEIGE", nm: "베이지" },
  { code: "VAL_COLOR_BROWN", nm: "브라운" },
  { code: "VAL_COLOR_RED", nm: "레드" },
  { code: "VAL_COLOR_BURGUNDY", nm: "버건디" },
  { code: "VAL_COLOR_PINK", nm: "핑크" },
  { code: "VAL_COLOR_PURPLE", nm: "퍼플" },
  { code: "VAL_COLOR_MUSTARD", nm: "머스타드" },
  { code: "VAL_COLOR_ORANGE", nm: "오렌지" },
];
