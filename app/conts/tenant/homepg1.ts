/**
 * homepg1 모듈 설정 — 모두누리(MODUNURI) 회사 홈페이지. 사이트 SI260004 (2026-10-03, 사용자 요청: "homepg1 추가해줘 … 문의하기, 주문하기 있어 잘 연계해줘").
 * 원본: C:\_pjt_github\p2604_modunuri_illeesam\homepage_v26\modunuri_v260329 (Vue CDN SPA, api/base/site-config.json) 을 Nuxt 화면으로 옮겼다.
 * 화면은 app/pages/homepg1, 컴포넌트는 app/components/homepg1, 레이아웃은 app/layout/homepg1, 스타일은 app/assets/homepg1 에 독립으로 있다.
 * 회사 정보·메뉴·솔루션·상품·FAQ 는 원본 site-config.json 값 그대로(이 모듈 빌드에만 번들에 들어간다).
 * 문의하기·주문하기는 ecBeBo 고객문의(sy_contact, POST /api/fo/ec/cm/contact)로 접수돼 BO 문의관리에서 사이트 SI260004 로 본다.
 */
// ⚠️ nuxt.config.ts 가 빌드 설정을 읽을 때 이 파일을 그대로 import 한다 — 런타임 모듈(#app, vue 등)은 import 하지 말 것(타입·상수·순수 함수만).
import type { TenantConfigType } from "~/types/tenantConfig";

const tenant: TenantConfigType = {
  id: "homepg1",
  name: "모두누리",
  tagline: "소프트웨어 개발 & 솔루션",
  appTitle: "모두누리 MODUNURI",
  themeColor: "#0099cc",
  // 이 모듈의 전역 스타일 — app/assets/homepg1/ (쇼핑몰 테마 scss 는 넣지 않는다: 원본 홈페이지 스타일만)
  css: ["~/assets/homepg1/style.css"],
  features: { contact: true, order: true },
  menus: [
    { menuTreeId: 1, link: "/", title: "홈" },
    { menuTreeId: 2, link: "/about", title: "회사소개" },
    { menuTreeId: 3, link: "/solution", title: "솔루션안내" },
    { menuTreeId: 4, link: "/products", title: "상품목록" },
    { menuTreeId: 5, link: "/blog", title: "블로그" },
    { menuTreeId: 6, link: "/location", title: "위치안내" },
    { menuTreeId: 7, link: "/contact", title: "고객센터" },
    { menuTreeId: 8, link: "/order", title: "주문하기" },
    { menuTreeId: 9, link: "/faq", title: "FAQ" },
  ],
};

export default tenant;

/* ── 회사 정보 ── */
export const HP_SITE = {
  name: "모두누리",
  nameEn: "MODUNURI",
  tagline: "소프트웨어 개발 & 솔루션",
  description: "AI, ERP, 클라우드, 모바일 앱 개발 솔루션 전문 기업. 30일 무료 데모 체험.",
  tel: "010-3805-0206",
  email: "illeesam@gmail.com",
  address: "경기도 성남시 중원구 성남대로 997번길 49-14 201호",
  ceo: "송성일",
  bizNo: "298-06-01947",
  bizRegDate: "2021년 05월 17일",
  hours: "평일 09:00 – 18:00",
  /** 입금 계좌 — 비어 있으면 "주문 확정 후 계좌번호를 안내" 문구를 보인다(원본 site-config 에도 없음) */
  bank: { name: "", account: "", holder: "" },
};

/* ── 메뉴 (key: 화면, to: 주소) ── */
export interface HpMenuItem { key: string; label: string; icon: string; to: string }
export const HP_TOP_MENU: HpMenuItem[] = [
  { key: "home", label: "홈", icon: "🏠", to: "/" },
  { key: "about", label: "회사소개", icon: "🏢", to: "/about" },
  { key: "solution", label: "솔루션안내", icon: "💡", to: "/solution" },
  { key: "products", label: "상품목록", icon: "🗂️", to: "/products" },
  { key: "detail", label: "상품상세", icon: "🔍", to: "" }, // 주소는 마지막으로 본 상품 — Layout 이 hpLastProductId() 로 정한다
  { key: "blog", label: "블로그", icon: "📝", to: "/blog" },
  { key: "location", label: "위치안내", icon: "📍", to: "/location" },
  { key: "contact", label: "고객센터", icon: "📞", to: "/contact" },
  { key: "order", label: "주문하기", icon: "🧾", to: "/order" },
  { key: "faq", label: "FAQ", icon: "❓", to: "/faq" },
];
export const HP_SIDEBAR_MENU: { section: string; items: HpMenuItem[] }[] = [
  { section: "서비스", items: [
    { key: "home", label: "홈", icon: "🏠", to: "/" },
    { key: "solution", label: "솔루션", icon: "💡", to: "/solution" },
    { key: "products", label: "상품목록", icon: "🗂️", to: "/products" },
  ] },
  { section: "회사", items: [
    { key: "about", label: "회사소개", icon: "🏢", to: "/about" },
    { key: "blog", label: "블로그", icon: "📝", to: "/blog" },
  ] },
  { section: "지원", items: [
    { key: "location", label: "위치안내", icon: "📍", to: "/location" },
    { key: "contact", label: "고객센터", icon: "📞", to: "/contact" },
    { key: "order", label: "주문하기", icon: "🧾", to: "/order" },
    { key: "faq", label: "FAQ", icon: "❓", to: "/faq" },
  ] },
];

/* ── 솔루션 ── */
export interface HpSolution { solutionId: number; emoji: string; solutionName: string; desc: string; tags: string[]; badge: string }
export const HP_SOLUTIONS: HpSolution[] = [
  { solutionId: 1, emoji: "🏢", solutionName: "홈페이지 & CMS", desc: "기업 전사적 자원 관리 통합 플랫폼", tags: ["homepage", "CMS", "blog"], badge: "인기" },
  { solutionId: 2, emoji: "🛒", solutionName: "이커머스 플랫폼", desc: "맞춤형 온라인 쇼핑몰 구축 솔루션", tags: ["쇼핑몰", "결제", "배송"], badge: "" },
  { solutionId: 3, emoji: "📈", solutionName: "시각화", desc: "데이터를 직관적인 차트·대시보드로 표현하는 시각화 솔루션", tags: ["차트", "대시보드", "데이터시각화"], badge: "" },
  { solutionId: 4, emoji: "📱", solutionName: "모바일 앱", desc: "iOS/Android 크로스플랫폼 앱 개발", tags: ["iOS", "Android", "앱"], badge: "" },
  { solutionId: 5, emoji: "🤖", solutionName: "AI 바이브", desc: "머신러닝 기반 데이터 분석 및 예측 솔루션", tags: ["AI", "ML", "데이터"], badge: "NEW" },
  { solutionId: 6, emoji: "☁️", solutionName: "클라우드 인프라", desc: "AWS/GCP 기반 클라우드 아키텍처 구축", tags: ["클라우드", "AWS", "인프라"], badge: "" },
];

/* ── 상품 카테고리 / 상품 ── */
export const HP_CATEGORIES: { categoryId: string; categoryName: string }[] = [
  { categoryId: "purchase", categoryName: "e커머스" },
  { categoryId: "homepage", categoryName: "홈페이지" },
  { categoryId: "admin", categoryName: "Admin" },
  { categoryId: "analytics", categoryName: "시각화" },
  { categoryId: "collaboration", categoryName: "협업" },
  { categoryId: "security", categoryName: "보안" },
  { categoryId: "erp", categoryName: "ERP" },
  { categoryId: "app", categoryName: "앱" },
  { categoryId: "cloud", categoryName: "클라우드" },
];

export interface HpProduct { productId: number; productName: string; emoji: string; desc: string; price: string; demo: string; categoryId: string; salesYn: "Y" | "N" }
/** 원본 데모 화면들이 올라가 있는 정적 사이트 */
const DEMO_BASE = "https://illeesam.netlify.app";
/**
 * 상품 — 원본 site-config.json. 바뀐 점(2026-10-03):
 *  - "쇼핑을 즐거움 admin" 이 상품번호 17 로 중복돼 상세·주문이 엉뚱한 상품을 열었다 → 19 로 분리.
 *  - 데모 주소가 원본 위치 기준 상대경로라 이 사이트에서는 열리지 않는다 → 절대주소. 쇼핑몰은 지금 운영 중인 Nuxt FO, 어드민은 ecFeBo BO,
 *    데이터 시각화는 이번에 함께 만든 datavisual1 사이트로 연결한다. 판매하지 않는 상품(1~9)의 demo.modunuri.kr 은 없는 주소라 비웠다(데모 버튼 → 상담 안내).
 */
export const HP_PRODUCTS: HpProduct[] = [
  { productId: 1, productName: "DataPulse Pro", emoji: "📊", desc: "실시간 비즈니스 데이터 대시보드 솔루션", price: "월 299,000원~", demo: "", categoryId: "analytics", salesYn: "N" },
  { productId: 2, productName: "WorkFlow Suite", emoji: "🤝", desc: "팀 협업 및 프로젝트 관리 올인원 플랫폼", price: "월 199,000원~", demo: "", categoryId: "collaboration", salesYn: "N" },
  { productId: 3, productName: "SecureVault", emoji: "🛡️", desc: "기업용 데이터 암호화 및 보안 관리 솔루션", price: "월 499,000원~", demo: "", categoryId: "security", salesYn: "N" },
  { productId: 4, productName: "LaunchPad ERP", emoji: "🚀", desc: "중소기업 맞춤형 통합 ERP 시스템", price: "별도 문의", demo: "", categoryId: "erp", salesYn: "N" },
  { productId: 5, productName: "AppForge Mobile", emoji: "📱", desc: "노코드/로우코드 모바일 앱 빌더", price: "월 149,000원~", demo: "", categoryId: "app", salesYn: "N" },
  { productId: 6, productName: "CloudNest IaC", emoji: "☁️", desc: "인프라-as-Code 클라우드 관리 플랫폼", price: "별도 문의", demo: "", categoryId: "cloud", salesYn: "N" },
  { productId: 7, productName: "DataPulse Enterprise (구매형)", emoji: "🧾", desc: "현업 대시보드/리포팅을 구매형으로 도입하는 엔터프라이즈 패키지.", price: "1,000만원~", demo: "", categoryId: "purchase", salesYn: "N" },
  { productId: 8, productName: "WorkFlow Suite Enterprise (구매형)", emoji: "🧩", desc: "팀 협업/프로세스 관리 기능을 구매형으로 도입하는 엔터프라이즈 패키지.", price: "2,200만원~", demo: "", categoryId: "purchase", salesYn: "N" },
  { productId: 9, productName: "SecureVault Enterprise (구매형)", emoji: "🛡️", desc: "데이터 암호화/권한관리를 구매형으로 도입하는 보안 패키지.", price: "3,000만원~", demo: "", categoryId: "purchase", salesYn: "N" },
  { productId: 17, productName: "쇼핑을 즐거움", emoji: "🏠", desc: "쇼핑을 즐거움 데모", price: "별도 문의", demo: "https://shopjoy-ecfefonuxt4.netlify.app", categoryId: "purchase", salesYn: "Y" },
  { productId: 19, productName: "쇼핑을 즐거움 admin", emoji: "🏠", desc: "쇼핑을 즐거움 admin 데모", price: "별도 문의", demo: "https://22000.illeesam.synology.me/bo.html", categoryId: "admin", salesYn: "Y" },
  { productId: 10, productName: "AnyNuri 홈페이지", emoji: "🏠", desc: "애니메이션 스튜디오 소개형 홈페이지 데모", price: "별도 문의", demo: `${DEMO_BASE}/homepage_v26/anynuri_v260329/index.html`, categoryId: "homepage", salesYn: "Y" },
  { productId: 11, productName: "Dangoeul 홈페이지", emoji: "🏠", desc: "지역 농산물 직거래 소개형 홈페이지 데모", price: "별도 문의", demo: `${DEMO_BASE}/homepage_v26/dangoeul_v260330/index.html`, categoryId: "homepage", salesYn: "Y" },
  { productId: 12, productName: "Home(STUDIO) 홈페이지", emoji: "🏠", desc: "크리에이티브 기술 스튜디오 홈페이지 데모", price: "별도 문의", demo: `${DEMO_BASE}/homepage_v26/home_v260329/index.html`, categoryId: "homepage", salesYn: "Y" },
  { productId: 13, productName: "Partyroom 홈페이지", emoji: "🏠", desc: "파티룸 공간 소개형 홈페이지 데모", price: "별도 문의", demo: `${DEMO_BASE}/homepage_v26/partyroom_v260329/index.html`, categoryId: "homepage", salesYn: "Y" },
  { productId: 14, productName: "송진현 갤러리(그림 대여/판매)", emoji: "🖼️", desc: "그림 대여 및 판매 갤러리 데모", price: "별도 문의", demo: `${DEMO_BASE}/homepage_v26/artLeaseSale_v260330/index.html`, categoryId: "homepage", salesYn: "Y" },
  { productId: 16, productName: "CareMate(병원동행) 홈페이지", emoji: "🏥", desc: "병원동행 & 돌봄 서비스 홈페이지 데모", price: "별도 문의", demo: `${DEMO_BASE}/homepage_v26/careMate_v260330/index.html`, categoryId: "homepage", salesYn: "Y" },
  { productId: 15, productName: "종합서비스관리(Admin)", emoji: "🛠️", desc: "mainFrame.html 기반 통합 서비스/문서 관리 화면", price: "별도 문의", demo: `${DEMO_BASE}/mainFrame.html#hm_index`, categoryId: "admin", salesYn: "Y" },
  { productId: 18, productName: "DataVisual 데이터 시각화", emoji: "📈", desc: "대시보드·차트·실시간 패널로 구성된 데이터 시각화 데모", price: "별도 문의", demo: "https://datavisual1--shopjoy-ecfefonuxt4.netlify.app", categoryId: "analytics", salesYn: "Y" },
];
/** 홈 "추천 상품" */
export const HP_FEATURED_IDS = [17, 14, 15];
/** 상품목록 한 번에 보이는 수(스크롤하면 더 보인다) */
export const HP_PRODUCTS_PAGE_SIZE = 6;

export const hpProductById = (id: unknown): HpProduct | undefined => HP_PRODUCTS.find((p) => p.productId === Number(id));
export const hpCategoryLabel = (p?: { categoryId: string } | null): string =>
  p ? (HP_CATEGORIES.find((c) => c.categoryId === p.categoryId)?.categoryName ?? p.categoryId) : "";
/** 주문 가능한 상품(판매중) */
export const HP_ORDERABLE = HP_PRODUCTS.filter((p) => p.salesYn === "Y");

/** "상품상세" 메뉴가 여는 마지막으로 본 상품 — 원본처럼 세션에 둔다(없으면 첫 추천 상품) */
const LAST_PID_KEY = "homepg1.lastPid";
export function hpRememberProduct(id: number) {
  try { sessionStorage.setItem(LAST_PID_KEY, String(id)); } catch { /* 저장 못 해도 이동은 된다 */ }
}
export function hpLastProductId(): number {
  try {
    const v = Number(sessionStorage.getItem(LAST_PID_KEY));
    if (hpProductById(v)) return v;
  } catch { /* 무시 */ }
  return HP_FEATURED_IDS[0]!;
}

/* ── FAQ ── */
export const HP_FAQS: { q: string; a: string }[] = [
  { q: "솔루션 도입 절차가 어떻게 되나요?", a: "문의 → 수요 분석 → 제안서 제출 → 계약 → 구축/커스터마이징 → 운영 지원 순으로 진행됩니다. 일반 구축기준 6주~12주 소요됩니다." },
  { q: "데모를 직접 사용해 볼 수 있나요?", a: "각 상품 상세 페이지의 \"데모 보기\" 버튼을 통해 30일 무료 체험이 가능합니다." },
  { q: "커스터마이징이 가능한가요?", a: "모든 솔루션은 고객사 환경에 맞게 커스터마이징 가능합니다. 별도 개발 비용이 발생할 수 있습니다." },
  { q: "기술 지원은 어떻게 받나요?", a: "이메일, 전화, 전용 슬랙 채널을 통해 지원됩니다. 엔터프라이즈 플랜은 장애시 (24시/7일) 전담 지원이 제공됩니다." },
];

/* ── 문의 ── */
/** 고객센터 "관심 서비스" (원본 codes: modunuri_contact_service) */
export const HP_CONTACT_SERVICES = ["AI 바이브", "홈페이지 & CMS", "이커머스 플랫폼", "모바일 앱 개발", "보안 솔루션", "클라우드 인프라", "기타·복합 문의"];
/** ecBeBo 문의 유형(sy_contact.category_cd) — BO 문의관리에서 이 값으로 상담/주문을 가른다 */
export const HP_INQUIRY_CONSULT = "솔루션 상담";
export const HP_INQUIRY_ORDER = "솔루션 주문";

/* ── 블로그 (원본 Blog.js 고정 글) ── */
export interface HpBlogPost { no: number; emoji: string; cat: string; title: string; date: string; read: string; summary: string }
export const HP_BLOG_POSTS: HpBlogPost[] = [
  { no: 1, emoji: "🤖", cat: "AI", title: "AI가 바꾸는 소프트웨어 개발", date: "2026.03.10", read: "5분", summary: "생성형 AI가 코드 작성, 테스트, 배포 자동화를 어떻게 혁신하고 있는지 살펴봅니다." },
  { no: 2, emoji: "☁️", cat: "클라우드", title: "클라우드 마이그레이션 성공 사례", date: "2026.02.28", read: "7분", summary: "온프레미스에서 클라우드로 이전한 중소기업의 실제 ROI 분석과 교훈을 공유합니다." },
  { no: 3, emoji: "🔐", cat: "보안", title: "보안 취약점과 대응 방법", date: "2026.02.15", read: "6분", summary: "최근 증가하는 기업 보안 위협과 효과적인 방어 전략을 구체적으로 안내합니다." },
  { no: 4, emoji: "🚀", cat: "스타트업", title: "스타트업 MVP 개발 전략", date: "2026.01.30", read: "4분", summary: "빠른 시장 검증을 위한 MVP 설계 원칙과 모두누리의 실전 개발 프레임워크를 소개합니다." },
  { no: 5, emoji: "📊", cat: "데이터", title: "데이터 기반 의사결정", date: "2026.01.20", read: "5분", summary: "비즈니스 인텔리전스 도구를 활용해 데이터를 실질적인 의사결정 자원으로 전환하는 방법." },
  { no: 6, emoji: "💻", cat: "개발트렌드", title: "노코드 시대의 개발자", date: "2026.01.10", read: "4분", summary: "노코드/로우코드 플랫폼 확산 속에서 소프트웨어 개발자의 역할이 어떻게 진화하는지 분석합니다." },
];

/* ── 회사소개: 구축사이트 이력 (원본 About.js) ── */
export interface HpProject { period: string; name: string; client: string; role: string; tech: string }
export const HP_PROJECT_GROUPS: { period: string; color: string; items: HpProject[] }[] = [
  { period: "2024 – 2026", color: "linear-gradient(90deg,#0099cc,#00c4a7)", items: [
    { period: "2026.01~2026.03", name: "헥토데이터 그룹사 통합SMS시스템", client: "헥토데이터", role: "개발", tech: "Java/Spring · Vue.js" },
    { period: "2025.05~2025.12", name: "하이닉스 PDK & DMR", client: "SK하이닉스", role: "개발", tech: "Java/Spring · React" },
    { period: "2025.01~2025.03", name: "노루페인트 주문포털(공통)", client: "노루페인트", role: "개발PL", tech: "Java/Spring · Vue.js" },
  ] },
  { period: "2021 – 2023", color: "linear-gradient(90deg,#4c6ef5,#7950f2)", items: [
    { period: "2023.03~2024.12", name: "마이디룸몰 미커머스 운영개발", client: "마이디룸", role: "운영개발", tech: "Java/MSA · React · Vue.js(nuxt)" },
    { period: "2022.11~2023.02", name: "한성름 리뉴얼 FO_PC 상품상세", client: "한성", role: "개발", tech: "Java/MSA · Vue.js(nuxt) · k8s" },
    { period: "2022.02~2022.10", name: "한화기계 PMS(Gantt) 구축", client: "한화기계", role: "개발", tech: "C#.net Core6 · React" },
    { period: "2021.10~2022.01", name: "삼성SDS 클라우드 서비스 모니터링", client: "삼성SDS", role: "개발", tech: "Java/Spring · Vue.js(Lego)" },
    { period: "2021.03~2021.09", name: "차세대 MIS구축(계약관리)", client: "SKCC", role: "개발", tech: "Java/Spring · Vue.js · k8s" },
  ] },
  { period: "2017 – 2020", color: "linear-gradient(90deg,#2f9e44,#66a80f)", items: [
    { period: "2020.03~2021.02", name: "ITSM 모바일(메뉴온,KG동부제철,연세의료원,LG U+)", client: "4개사", role: "개발", tech: "Java/Spring · Vue.js" },
    { period: "2019.10~2020.02", name: "하이닉스 hess(품질규격)", client: "SK하이닉스", role: "개발", tech: "Java/Spring · Nexcore" },
    { period: "2017.07~2019.09", name: "ITSM구축(스마일게이트,한국고용,하이닉스SW,LG U+,인천공항)", client: "6개사", role: "설계/개발PL", tech: "Java/Spring · JSP · Webix" },
    { period: "2017.01~2017.06", name: "SKT iMembership 웹 리뉴얼(주문·결제)", client: "SKT", role: "개발", tech: "JAVA · Nexcore · JSP · jQuery" },
  ] },
  { period: "2013 – 2016", color: "linear-gradient(90deg,#e67700,#f59f00)", items: [
    { period: "2016.01~2016.12", name: "NS홈쇼핑 KT IvPay(주문·대금)", client: "NS홈쇼핑", role: "개발", tech: "JAVA · eGovFramework" },
    { period: "2015.12~2016.01", name: "SK하이닉스 GSCM(수요파트 샘플관리)", client: "SK하이닉스", role: "개발", tech: "JAVA · Nexacro v14" },
    { period: "2015.05~2015.11", name: "아마존 구매대행(소핑몰 내부업무)", client: "예스커뮤니케이션", role: "개발", tech: "JAVA · eGovFramework" },
    { period: "2015.04", name: "MG새마을금고 차세대(이컨버터 컨설턴트)", client: "MG새마을금고", role: "컨설팅", tech: "JAVA · XPlatform v9.2 · Devon" },
    { period: "2014.07~2014.12", name: "솔루션개발 비컨버터 개발", client: "예스커뮤니케이션", role: "설계/개발", tech: "JAVA · Nexacro · Spring" },
    { period: "2013.09~2014.06", name: "기업은행 POST 차세대(고객파트)", client: "IBK기업은행", role: "개발", tech: "AnyFramework · 인젠트v4" },
    { period: "2013.07~2013.08", name: "국민연금 차세대 자산운용시스템", client: "국민연금", role: "공통팀장", tech: "Proframe C · XPlatform v9.2" },
    { period: "2013.01~2013.06", name: "EX한국도로공사 영업소관리시스템", client: "한국도로공사", role: "설계/개발", tech: "JAVA · XPlatform v9.2 · eGov" },
  ] },
  { period: "2005 – 2012", color: "linear-gradient(90deg,#c2255c,#e03131)", items: [
    { period: "2012.05~2012.12", name: "비바메디 SCM(약품물류 공급망관리)", client: "비바메디", role: "개발", tech: "FLEX v4 · JAVA · Eclipse" },
    { period: "2012.01~2012.04", name: "SKT M2M OpenAPI(단말기관리 TCP/IP서버)", client: "SKT", role: "개발", tech: "JAVA · JSP · NETTY" },
    { period: "2011.01~", name: "LGCNS 금융솔루션 신보험", client: "LGCNS", role: "개발", tech: "IBM RSA · Miplatform" },
    { period: "2009.12~2010.12", name: "LH한국토지주택공사 연말정산&인사전표 고도화", client: "한국토지공사", role: "설계/개발", tech: "Trustforms · Spring" },
    { period: "2009.07~2009.11", name: "대법원 전자소송 1차 특허", client: "대법원", role: "설계/개발", tech: "JSP · JAVA · EJB · Ajax · Devon" },
    { period: "2008.07~2009.07", name: "카자흐스탄 우편물류시스템(Miplatform공통)", client: "카자흐스탄", role: "설계/개발", tech: "Miplatform · Nexcore4 · Mina" },
    { period: "2007.12~2008.03", name: "한국토지공사 MIS(자금·세무·채권)", client: "한국토지공사", role: "개발", tech: "JAVA · Trustforms · Spring" },
    { period: "2006.06~2007.12", name: "티브로드 통신시스템(고객·접수·작업)", client: "티브로드", role: "개발/운영", tech: "JAVA · JSP · MVC" },
    { period: "2005.07~2006.06", name: "삼성SDS솔루션 기술지원 시스템", client: "삼성SDS", role: "개발/운영", tech: "JAVA · JSP · MVC" },
    { period: "2005.03~2005.07", name: "파원룸(고객·접수·작업)", client: "파원룸", role: "개발", tech: "JAVA · JSP · MVC" },
  ] },
  { period: "2000 – 2004", color: "linear-gradient(90deg,#495057,#868e96)", items: [
    { period: "2004.05~2005.02", name: "HFMS2004 한국도로공사 시설물관리", client: "고속도로정보통신", role: "설계/개발", tech: "JAVA · JSP(MVC)" },
    { period: "2003.08~2004.04", name: "FTMS2003 한국도로공사 교통관리", client: "한국도로공사", role: "개발", tech: "JAVA · MVC · Javascript" },
    { period: "2002.09~2003.07", name: "홈페이지·쇼핑몰", client: "㈜코리아팀", role: "설계/개발", tech: "ASP.NET(C#)" },
    { period: "2002.05~2002.09", name: "영업관리 그룹웨어(메일·전자결재·메신저)", client: "LG생명공학", role: "개발", tech: "JAVA · Javascript · Lotus Script" },
    { period: "2001.05~2002.04", name: "중앙대학교 종합정보시스템(사무자동화)", client: "중앙대학교", role: "개발", tech: "JAVA · Javascript · Lotus Notes" },
    { period: "2000.08~2001.05", name: "대학원대학교 학사행정시스템", client: "베뢰아대학원대학교", role: "개발", tech: "Power Builder 6.5" },
  ] },
];
