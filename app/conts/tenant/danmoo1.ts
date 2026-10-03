/**
 * danmoo1 모듈 설정 — 당근(동네 중고거래) 스타일 FO. useTenant() 가 default export 를 읽는다(nuxt.config.ts 의 #tenant 별칭이 빌드할 때 이 파일을 고른다).
 * 화면은 app/pages/danmoo1, 컴포넌트는 app/components/danmoo1, 레이아웃은 app/layout/danmoo1 에 독립으로 있다(2026-10-02, 사용자 요청: "당근 캡처대로 danmoo1 으로").
 * 당근 화면 전용 상수(동네 목록·서비스 메뉴·탭)는 같은 파일의 named export — 이 모듈을 빌드할 때만 번들에 들어간다.
 */
import type { TenantConfigType } from "~/types/tenantConfig";
import type { PdProdType } from "~/types/pd/pdProdType";

const tenant: TenantConfigType = {
  id: "danmoo1",
  name: "danmoo1",
  tagline: "우리 동네 중고거래",
  appTitle: "danmoo1",
  themeColor: "#ff6f0f",
  // 이 모듈의 전역 스타일 — app/assets/danmoo1/ (2026-10-03: 모듈마다 스타일을 따로 둔다. 쇼핑몰 테마 scss·다크테마를 모듈별 사본으로)
  css: ["vue3-carousel/dist/carousel.css", "~/assets/danmoo1/scss/main.scss", "~/assets/danmoo1/theme-dark.css"],
  features: { seller: true, blog: true, event: false, community: true },
  // 당근은 상단 메뉴 대신 하단 탭(DmBottomTabs)을 쓴다 — 메뉴는 전체 서비스 화면(/services)
  menus: [
    { menuTreeId: 1, link: "/", title: "홈" },
    { menuTreeId: 2, link: "/community", title: "커뮤니티" },
    { menuTreeId: 3, link: "/map", title: "동네지도" },
    { menuTreeId: 4, link: "/chat", title: "채팅" },
    { menuTreeId: 5, link: "/my", title: "나의 danmoo" },
  ],
};

export default tenant;

/** 동네(위치) 선택 목록 — 실제 위치 인증은 없고 "내 동네 설정"에서 고른 값을 localStorage 에 둔다 */
export const DM_NEIGHBORHOODS = ["여수동", "금토동", "창곡동", "신흥1동", "백현동", "야탑동", "이매1동", "수내3동", "삼평동", "양재동"];
export const DM_DEFAULT_NEIGHBORHOOD = "여수동";
/** 동네별 대략 좌표(성남 일대) — 동네지도·거래 희망 장소 표시용 */
export const DM_TOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  여수동: { lat: 37.4449, lng: 127.1388 }, 금토동: { lat: 37.4047, lng: 127.0968 }, 창곡동: { lat: 37.4692, lng: 127.1446 }, 신흥1동: { lat: 37.4426, lng: 127.1495 },
  백현동: { lat: 37.3888, lng: 127.1123 }, 야탑동: { lat: 37.4113, lng: 127.1289 }, 이매1동: { lat: 37.3977, lng: 127.1288 }, 수내3동: { lat: 37.3786, lng: 127.1162 },
  삼평동: { lat: 37.4015, lng: 127.1067 }, 양재동: { lat: 37.4701, lng: 127.0383 },
};
export const coordsOf = (town: string) => DM_TOWN_COORDS[town] ?? DM_TOWN_COORDS[DM_DEFAULT_NEIGHBORHOOD]!;
export const DM_NEIGHBORHOOD_KEY = "dm.neighborhood";
export const DM_RECENT_SEARCH_KEY = "dm.recentSearch";
export const DM_RECENT_VIEW_KEY = "dm.recentView";
export const DM_KEYWORD_ALERT_KEY = "dm.keywordAlerts";
export const DM_RANGE_KEY = "dm.range";
export const DM_JOB_LIKE_KEY = "dm.jobLikes";
export const DM_REALTY_LIKE_KEY = "dm.realtyLikes";
/** 동네 범위(당근의 "가까운 동네" 슬라이더) — count 는 함께 보는 근처 동네 수(표시용) */
export const DM_RANGE_OPTIONS = [
  { value: "near", label: "내 동네", count: 0 },
  { value: "close", label: "가까운", count: 3 },
  { value: "mid", label: "조금 먼", count: 6 },
  { value: "far", label: "먼", count: 9 },
];
/** 동네생활 글이 들어가는 블로그 카테고리(cm_blog_cate) — 시드 migration_20261002_seed_danmoo1_site7.sql 에서 만든 값. cm_blog 는 사이트 구분이 없어 이 카테고리로만 가른다 */
export const DM_BLOG_CATE_ID = "BC000000000000020";
/** 검색 화면 추천 검색어 */
export const DM_SEARCH_SUGGEST = ["텀블러", "지갑", "노트북", "가방", "스니커즈", "캔들", "헤드폰", "선글라스"];
/** 목록 정렬 — ecBeBo buildOrder 허용값 */
export const DM_SORTS = [
  { value: "regDate desc", label: "최신순" },
  { value: "salePrice asc", label: "낮은 가격순" },
  { value: "salePrice desc", label: "높은 가격순" },
  { value: "prodNm asc", label: "이름순" },
];
/** 가격대 프리셋 (min/max 없음 = 제한 없음, 둘 다 0 = 나눔) */
export const DM_PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: "전체" }, { label: "나눔", min: 0, max: 0 }, { label: "5만원 이하", max: 50000 }, { label: "5~10만원", min: 50000, max: 100000 },
  { label: "10~30만원", min: 100000, max: 300000 }, { label: "30만원 이상", min: 300000 },
];

/**
 * townOf — 상품의 "동네". 상품 데이터에는 동네가 없어 상품ID 로 고정 배정한다(표시용, 같은 상품은 항상 같은 동네).
 * 셋에 하나는 내 동네로 나오게 해 당근처럼 "내 동네 + 근처" 느낌을 낸다.
 */
export function townOf(prodId: string, myTown: string): string {
  let h = 0;
  for (const ch of prodId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  if (h % 3 === 0) return myTown;
  const others = DM_NEIGHBORHOODS.filter((n) => n !== myTown);
  return others[h % others.length] ?? myTown;
}

/** 거래 상태 뱃지 — 품절/판매종료는 "판매완료", 판매 예정·판매중지는 "예약중" */
export function dmStatusOf(p: Pick<PdProdType, "soldOutYn" | "saleStateCd" | "prodStatusCd">): { label: string; cls: string } | null {
  if (p.soldOutYn === "Y" || p.saleStateCd === "SOLDOUT" || p.prodStatusCd === "ENDED") return { label: "판매완료", cls: "sold" };
  if (p.saleStateCd === "SCHEDULED" || p.prodStatusCd === "INACTIVE") return { label: "예약중", cls: "reserved" };
  return null;
}

/**
 * 거래 방법(개인간 거래, 2026-10-03 사용자 "사람간 직거래, 문고리거래, 택배거래가 주야") — 상품 pd_prod.trade_method_cds 에 콤마로 저장된다.
 * 순서도 서버와 같다(DIRECT → DOOR → PARCEL).
 */
export const DM_TRADE_METHODS = [
  { code: "DIRECT", label: "직거래", short: "직거래", icon: "fas fa-handshake", desc: "만나서 주고받아요" },
  { code: "DOOR", label: "문고리거래", short: "문고리", icon: "fas fa-door-closed", desc: "문 앞에 두고 비대면으로 주고받아요" },
  { code: "PARCEL", label: "택배거래", short: "택배", icon: "fas fa-box", desc: "택배로 보내요" },
] as const;
export type DmTradeMethodCd = (typeof DM_TRADE_METHODS)[number]["code"];
/** "DIRECT,PARCEL" → 그 거래 방법들(정해진 순서). 비었으면 빈 배열 */
export function dmTradeMethods(cds?: string | null) {
  const set = new Set((cds ?? "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean));
  return DM_TRADE_METHODS.filter((m) => set.has(m.code));
}

/** 하단 탭 */
export const DM_TABS = [
  { key: "home", label: "홈", to: "/", icon: "fas fa-home" },
  { key: "community", label: "커뮤니티", to: "/community", icon: "fas fa-users" },
  { key: "map", label: "동네지도", to: "/map", icon: "fas fa-map-marker-alt" },
  { key: "chat", label: "채팅", to: "/chat", icon: "fas fa-comment" },
  { key: "my", label: "나의 danmoo", to: "/my", icon: "fas fa-user" },
] as const;

/** 홈 상단 칩 — 카테고리(API) 앞에 고정으로 붙는 바로가기 */
export const DM_HOME_SHORTCUTS = [
  { label: "알바", to: "/jobs", external: true },
  { label: "부동산", to: "/realty", external: true },
  { label: "가까운 동네", to: "/?near=1", external: false },
];

/** 전체 서비스 메뉴 — to 가 없으면 "준비 중" 안내 */
export const DM_SERVICES: { group: string; items: { label: string; icon: string; color: string; to?: string }[] }[] = [
  {
    group: "동네 거래",
    items: [
      { label: "중고거래", icon: "fas fa-shopping-bag", color: "#ff6f0f", to: "/" },
      { label: "알바", icon: "fas fa-search-dollar", color: "#ff8a3d", to: "/jobs" },
      { label: "부동산", icon: "fas fa-home", color: "#e14fb2", to: "/realty" },
      { label: "중고차", icon: "fas fa-car", color: "#2f80ed" },
      { label: "스토어", icon: "fas fa-shopping-cart", color: "#f2b400" },
      { label: "포장주문", icon: "fas fa-utensils", color: "#f2b400", to: "/map" },
      { label: "레슨/과외", icon: "fas fa-book", color: "#8d6e63" },
    ],
  },
  {
    group: "동네 이야기",
    items: [
      { label: "모임", icon: "fas fa-user-friends", color: "#ff6f0f", to: "/community?tab=모임" },
      { label: "온라인 카페", icon: "fas fa-mug-hot", color: "#f2b400", to: "/community?tab=카페" },
      { label: "내 아파트", icon: "fas fa-building", color: "#2f80ed", to: "/community?tab=아파트" },
      { label: "아파트 공개 게시판", icon: "fas fa-clipboard-list", color: "#8e5cf5" },
      { label: "동네생활", icon: "fas fa-comments", color: "#2f80ed", to: "/community" },
      { label: "스토리", icon: "fas fa-play-circle", color: "#e53935" },
      { label: "한 입 뉴스", icon: "fas fa-newspaper", color: "#ff6f0f" },
    ],
  },
];

/** 커뮤니티 상단 탭/칩 */
export const DM_COMMUNITY_TABS = ["동네생활", "모임", "카페", "아파트", "게임"];
export const DM_COMMUNITY_CHIPS = ["추천", "인기", "코딩/AI", "노래", "집수리", "맛집", "반려동물"];

/** 동네지도 — 업체 카테고리 아이콘 */
export const DM_MAP_CATEGORIES = [
  { label: "포장주문", icon: "fas fa-shopping-basket" }, { label: "할인중", icon: "fas fa-percent" }, { label: "생활서비스", icon: "fas fa-tools" },
  { label: "레슨/과외", icon: "fas fa-book-open" }, { label: "음식점", icon: "fas fa-utensils" }, { label: "청소", icon: "fas fa-broom" },
  { label: "운동", icon: "fas fa-dumbbell" }, { label: "용달", icon: "fas fa-truck" }, { label: "수리", icon: "fas fa-wrench" }, { label: "클래스", icon: "fas fa-palette" },
];

/** 알바 — 샘플(표시용). 알바 데이터는 백엔드에 없다 */
export const DM_JOB_SHORTCUTS = ["이웃알바", "걸어서 10분", "단기알바", "식당/카페", "물류/현장", "레슨/과외"];
export interface DmJobSample { id: string; title: string; pay: string; place: string; badge: string; hours: string; period: string; desc: string }
export const DM_JOBS_SAMPLE: DmJobSample[] = [
  { id: "J1", title: "[스타벅스] 판교도서관점 바리스타", pay: "시급 11,250원", place: "스타벅스 판교도서관점 · 성남시 분당구 판교동", badge: "지점별 채용중", hours: "주 3일 · 07:00~12:00", period: "3개월 이상", desc: "음료 제조와 매장 운영을 함께해요. 경력 없어도 교육해 드려요." },
  { id: "J2", title: "[초봉3400/정규직] 에듀플렉스 위례창곡점 교육매니저", pay: "연봉 3,400만원", place: "에듀플렉스 위례창곡점 · 성남시 수정구 창곡동", badge: "정직원", hours: "주 5일 · 13:00~22:00", period: "정규직", desc: "학생 학습 관리와 학부모 상담. 4년제 졸업, 교육업 경험 우대." },
  { id: "J3", title: "주방 닭튀기면서 같이 일하실 분", pay: "시급 13,000원", place: "김종구 식맛치킨 · 성남시 수정구 신흥동", badge: "후기 4", hours: "주 4일 · 17:00~23:00", period: "6개월 이상", desc: "튀김·포장 보조. 식사 제공, 주차 가능." },
  { id: "J4", title: "스시로꼬 태전고산점 홀 파트너", pay: "월급 310만원", place: "스시로꼬 · 광주시 고산동", badge: "모범구인", hours: "주 5일 · 11:00~21:00(휴게 2h)", period: "1년 이상", desc: "홀 서빙과 매장 정리. 4대보험, 퇴직금, 명절 상여." },
  { id: "J5", title: "주말 카페 오픈 스태프", pay: "시급 12,000원", place: "카페 노을 · 성남시 중원구 여수동", badge: "걸어서 10분", hours: "토·일 · 08:00~14:00", period: "3개월 이상", desc: "오픈 준비와 음료 제조. 바리스타 자격 우대." },
];

/** 부동산 — 샘플(표시용) */
export const DM_REALTY_TYPES = ["아파트", "원룸", "투룸+", "오피스텔", "상가", "관심", "살아본후기", "실거래가", "청약", "전체"];
export interface DmRealtySample { id: string; kind: string; price: string; desc: string; floor: string; area: string; moveIn: string; options: string[]; town: string }
export const DM_REALTY_SAMPLE: DmRealtySample[] = [
  { id: "R1", kind: "아파트", price: "전세 4억 2,000", desc: "여수동·전용 25평 (84m²)·12층", floor: "12층 / 20층", area: "전용 84m² (25평)", moveIn: "즉시 입주", options: ["남향", "주차 2대", "엘리베이터", "반려동물 상의"], town: "여수동" },
  { id: "R2", kind: "원룸", price: "월세 500/55", desc: "신흥1동·전용 7평 (23m²)·3층", floor: "3층 / 5층", area: "전용 23m² (7평)", moveIn: "11월 중순", options: ["풀옵션", "분리형", "관리비 7만"], town: "신흥1동" },
  { id: "R3", kind: "투룸+", price: "전세 2억 1,000", desc: "금토동·전용 15평 (49m²)·2층", floor: "2층 / 4층", area: "전용 49m² (15평)", moveIn: "협의", options: ["신축", "주차 1대", "베란다"], town: "금토동" },
  { id: "R4", kind: "오피스텔", price: "월세 1,000/80", desc: "야탑동·전용 9평 (30m²)·15층", floor: "15층 / 25층", area: "전용 30m² (9평)", moveIn: "즉시 입주", options: ["역세권", "풀옵션", "관리비 10만"], town: "야탑동" },
  { id: "R5", kind: "상가", price: "월세 2,000/120", desc: "창곡동·전용 12평 (40m²)·1층", floor: "1층 / 8층", area: "전용 40m² (12평)", moveIn: "협의", options: ["코너 자리", "권리금 없음", "주차 가능"], town: "창곡동" },
  { id: "R6", kind: "아파트", price: "매매 9억 8,000", desc: "백현동·전용 33평 (109m²)·7층", floor: "7층 / 15층", area: "전용 109m² (33평)", moveIn: "협의", options: ["판상형", "주차 2대", "초품아"], town: "백현동" },
];
