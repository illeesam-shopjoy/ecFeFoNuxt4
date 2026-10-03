// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
// 2026-09-14(요청사항: "nuxt.config.ts 파일의 process.env 정보 baseConst.ts에 정의하고
// 사용하는건 어때?") — api/cdn/mode 관련 값(전부 public, 노출 무해)의 근원을 baseConst.ts
// 하나로 통일. 결제/소셜로그인 시크릿 등 서버 전용 민감정보는 그대로 여기서 직접 읽는다
// (app/ 밑 파일은 클라이언트 번들에도 들어갈 수 있어 시크릿을 두기엔 부적절).
import { CDN_URL, API_URL, RUN_MODE, SITE_ID, TENANT_MODULE } from "./app/conts/baseConst";

// 멀티테넌트(2026-10-02): 모듈(ec1, ec2 …)마다 화면·컴포넌트·레이아웃을 독립으로 둔다(모양이 모듈마다 다르다).
//   app/pages/<모듈>/  app/components/<모듈>/  app/layout/<모듈>/  +  app/conts/tenant/<모듈>.ts(이름·메뉴·기능)
// 토스트(plugins)·유틸(utils)·스토어(store)·svc·composables·types 는 모든 모듈이 같이 쓴다. 이 빌드가 쓸 모듈은 NUXT_PUBLIC_TENANT_MODULE(scripts/tenant.mjs 의 --module 인자, 2026-10-03부터 환경파일에는 없다).
const TENANT_DIR = fileURLToPath(new URL("./app/conts/tenant", import.meta.url));
const TENANT_MODULES = readdirSync(TENANT_DIR)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => f.slice(0, -3));
if (!TENANT_MODULES.includes(TENANT_MODULE)) {
  throw new Error(`[tenant] 모듈 설정이 없습니다: app/conts/tenant/${TENANT_MODULE}.ts (NUXT_PUBLIC_TENANT_MODULE=${TENANT_MODULE})`);
}
if (!existsSync(fileURLToPath(new URL(`./app/pages/${TENANT_MODULE}`, import.meta.url)))) {
  throw new Error(`[tenant] 모듈 화면 폴더가 없습니다: app/pages/${TENANT_MODULE}/ (NUXT_PUBLIC_TENANT_MODULE=${TENANT_MODULE})`);
}
// 2026-10-03: 앱 제목·테마색은 환경파일이 아니라 모듈 설정(app/conts/tenant/<모듈>.ts 의 appTitle/themeColor)에서 읽는다 — 환경파일은 프로파일(.env.local/.development/.production)별 하나만 둔다.
//   테마색은 tailwind.config.ts 가 process.env.NUXT_PUBLIC_THEME_COLOR 로 읽으므로 여기서 환경변수에도 넣어 준다(tailwind 설정은 이 파일 다음에 로드된다).
const TENANT_CFG = (await import(`${TENANT_DIR}/${TENANT_MODULE}.ts`)).default as { name?: string; appTitle?: string; themeColor?: string };
const APP_TITLE = TENANT_CFG.appTitle ?? TENANT_CFG.name ?? "shopjoy";
const THEME_COLOR = TENANT_CFG.themeColor ?? "#bc8246";
process.env.NUXT_PUBLIC_THEME_COLOR = THEME_COLOR;

/** 화면 파일이 app/pages/<모듈>/ 아래에 있으면 그 모듈 이름, 공통 화면이면 null */
function pageModule(file?: string): string | null {
  const m = /\/app\/pages\/([^/]+)\//.exec((file ?? "").replace(/\\/g, "/"));
  return m && TENANT_MODULES.includes(m[1]!) ? m[1]! : null;
}

export default defineNuxtConfig({
  compatibilityDate: "2025-12-12",
  // 멀티테넌트: useTenant() 가 읽는 모듈 설정 — 이 빌드의 모듈 것 하나만 연결한다(다른 모듈 설정은 번들에 안 들어간다).
  alias: {
    "#tenant": `${TENANT_DIR}/${TENANT_MODULE}.ts`,
    // 공통 코드(app.vue, error.vue 등)가 "이 빌드의 모듈" 컴포넌트·레이아웃을 가리킬 때 쓴다. 모듈 안의 파일끼리는 ~/components/<모듈>/… 로 직접 적는다.
    "#tenant-components": fileURLToPath(new URL(`./app/components/${TENANT_MODULE}`, import.meta.url)),
    "#tenant-layout": fileURLToPath(new URL(`./app/layout/${TENANT_MODULE}`, import.meta.url)),
  },
  // 컴포넌트 자동 등록은 이 빌드의 모듈 폴더 + 개발도구(xdev) 폴더 — 이름은 그 폴더 기준이고 다른 모듈 컴포넌트는 빌드에 안 들어간다.
  // 2026-10-02(요청사항: "components/<모듈>/xdev 들은 없어도 될거 같은데") — 파일경로 배지(xdev)는 모양이 아니라 개발도구라 모듈마다 사본을 두지 않고 app/components/xdev 한 벌만 둔다.
  components: [{ path: "~/components/xdev" }, { path: `~/components/${TENANT_MODULE}` }],
  // 2026-09-13: ecBeBo(로컬 IntelliJ 구동 시 기본 3000)와 포트 충돌 방지 — 로컬 dev 서버는 3100 사용.
  devServer: {
    port: 3100,
  },
  vite: {
    server: {
      open: "chrome",
    },
  },
  css: ["vue3-carousel/dist/carousel.css", "~/assets/prod/scss/main.scss", "~/assets/theme-dark.css"],
  modules: [
    "@nuxtjs/tailwindcss",
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", ["defineStore", "definePiniaStore"]],
      },
    ],
  ],
  // 2026-09-23(요청사항: "홈에서 상품상세/상품목록에서 상품상세/블로그에서 블로그상세 등 상세화면
  // 오픈하고 뒤로가기할때 기존 조건의 화면정보가 그대로 보였으면 해 — 페이징이면 그 페이지, 스크롤
  // 위치도") — 목록 컴포넌트를 KeepAlive로 감싸 뒤로가기 시 다시 조회하지 않고 그대로(불러온 페이지
  // 수·스크롤 위치 포함) 복원한다. include는 컴포넌트 이름(defineOptions name)으로 매칭 — 상세/기타
  // 페이지는 이 목록에 없어 평소처럼 매번 새로 마운트되고, 그 사이 목록 쪼의 캐시만 유지된다(글로벌
  // app.keepalive라 <NuxtPage> 자체는 항상 켜져 있고, include에 없는 라우트를 오가도 캐시가 안 깨짐 —
  // definePageMeta({keepalive:true})를 개별 페이지에만 주면 그 라우트를 벗어나는 순간 KeepAlive 래퍼
  // 자체가 트리에서 사라져 캐시가 통째로 날아간다). 스크롤 위치 자체는 Nuxt 기본 scrollBehavior가
  // savedPosition으로 이미 복원해준다(별도 설정 불필요) — 여기서는 "복원할 데이터"만 살려두면 된다.
  app: {
    keepalive: { include: ["HomePage", "ShopPage", "BlogListPage"] },
    head: {
      title: APP_TITLE, // 2026-10-03: 모듈 설정(app/conts/tenant/<모듈>.ts appTitle) — 고정 "shopjoy" 라 danmoo1 도 shopjoy 로 나오던 것 수정
      link: [
        // 2026-09-13(성능 개선): 폰트 CDN에 미리 연결(DNS+TLS)해둬 실제 stylesheet 요청이
        // 시작될 때 그 연결 설정 시간을 기다리지 않게 한다 — 렌더 블로킹 스타일시트라 초기
        // 렌더링 지연에 그대로 영향을 준다. preconnect는 요청을 앞당기지 않고 "연결"만
        // 미리 해두는 것이라 부작용 없이 안전하다.
        { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossorigin: "" },
        // 2026-09-15(요청사항: "성능을 저해하는 환경적인 요소가 있으면 적극적으로 수정해줘") —
        // 위 preconnect로도 여전히 렌더 블로킹은 남아있던 부분을 마저 해결. media="print" +
        // onload로 "all"로 바꿔치기하는 표준 트릭 — 브라우저가 이 스타일시트를 렌더링을
        // 막지 않는 낮은 우선순위로 받아오고, 로드가 끝나면 실제 폰트를 적용한다(자바스크립트
        // 없는 환경 대비 noscript로 원래 방식 폴백).
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
          media: "print",
          onload: "this.media='all'",
        },
      ],
      noscript: [
        {
          innerHTML: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">`,
        },
      ],
      // 2026-09-23(요청사항: "핸드폰에서 netlify FO 열때 흰백색이 1~2.5초 보이고 오픈되 — 은은한 배경효과나
      // 이미지 보여주면 좋겠는데" / "백지화면대신 움직이는 별효과 이런거가 보였으면 좋겠어") — 이 로딩용
      // 배경+별 효과는 nuxt.config의 app.head가 아니라 server/plugins/2.boot-loading-style.ts 의
      // Nitro render:html 훅에서 직접 HTML에 심는다. 이유: unhead가 app.head의 style을 SSR 전용
      // (mode:"server")으로 등록해서, 클라이언트 JS가 부팅되는 즉시(=CSS 로드 완료와 무관하게, 실제로는
      // CSS보다 훨씬 먼저) 그 <style> 태그를 DOM에서 제거해버린다 — 정작 느린 CSS 다운로드가 끝나기도
      // 전에 사라져서 "잠깐 반짝 보였다가 그냥 흰 화면"이 되는 문제를 헤드리스 브라우저로 직접 재현해
      // 확인했다(로컬에서도 400ms대에 이미 사라짐). render:html 훅으로 넣으면 unhead가 관여하지 않는
      // 순수 정적 마크업이라 앱 CSS가 실제로 로드될 때까지 그대로 남아있는다.
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  // 하이브리드 렌더링: SEO 필요 페이지만 SSR, 나머지는 CSR
  routeRules: {
    "/**": { ssr: false }, // 기본: CSR (SPA)
    // 2026-09-20: SSR 은 SEO 가 필요한 콘텐츠 화면(상품 목록/상세, 블로그 상세, 이벤트 상세)뿐이고 서버는 SEO 용 최소 정보만 채운다
    // (server/api/fo/ec/** — useSeoDetail). 실제 데이터는 브라우저가 ecBeBo 를 직접 호출한다. 나머지는 전부 CSR.
    "/shop": { ssr: true }, // 상품 목록: 첫 페이지 SSR + SEO
    "/prod-dtl/**": { ssr: true }, // 상품 상세 (/:id): SSR + SEO
    "/blog-dtl/**": { ssr: true }, // 블로그 상세 (/:id): SSR + SEO
    "/event-dtl/**": { ssr: true }, // 이벤트 상세 (/:id): SSR + SEO
    // id 없는 /prod-dtl, /blog-dtl 은 "목록 첫 건" 미리보기(SEO 대상 아님) — CSR(svc 직접 호출). 더 구체적인 규칙이 위 와일드카드보다 우선한다.
    "/prod-dtl": { ssr: false },
    "/blog-dtl": { ssr: false },
    // 옛 템플릿 쇼핑 변형 페이지(전체 상품을 받아 클라이언트 필터링) — 서버 페이징 /shop 으로 통합
    "/shop-right": { redirect: { to: "/shop", statusCode: 301 } },
    "/shop-3-col": { redirect: { to: "/shop", statusCode: 301 } },
    "/shop-4-col": { redirect: { to: "/shop", statusCode: 301 } },
    "/account": { redirect: { to: "/my/profile", statusCode: 302 } }, // 옛 마이페이지 주소
  },
  // CDN: app/assets 폴더 전체(prod/{css,fonts,img,scss})를 /cdn 경로로 정적 서빙 (절대경로로 해석 보장)
  // 예: app/assets/prod/img/logo.png → /cdn/prod/img/logo.png
  nitro: {
    publicAssets: [
      {
        dir: fileURLToPath(new URL("app/assets", import.meta.url)),
        baseURL: "/cdn",
        maxAge: 31536000,
      },
      {
        dir: fileURLToPath(new URL("public/uploads", import.meta.url)),
        baseURL: "/uploads",
        maxAge: 86400,
      },
    ],
  },
  // 런타임 설정 (환경변수로 오버라이드 가능)
  // .env 파일 우선순위: .env.local > .env.[mode] > .env
  // - NUXT_API_BASE_URL       → runtimeConfig.apiBaseUrl (ecBeBo API 서버)
  // - NUXT_PUBLIC_PROD_CDN_BASE → runtimeConfig.public.prodCdnBase (ecBeCdn: 상품/리뷰 이미지·동영상)
  // - NUXT_PUBLIC_CDN_BASE   → runtimeConfig.public.cdnBase (템플릿 로컬 정적 데모 이미지, 위와 별개)
  // - NUXT_PUBLIC_API_BASE   → runtimeConfig.public.apiBase
  // - NUXT_PUBLIC_MODE       → runtimeConfig.public.mode
  // - NUXT_PUBLIC_ENV_NM     → runtimeConfig.public.envNm
  // - NUXT_PUBLIC_APP_TITLE  → runtimeConfig.public.appTitle
  runtimeConfig: {
    // 2026-09 BFF 전환: ecBeBo(Spring Boot) 공개 API 서버 주소. server/utils/beApi.ts 가 이 값 + "/api"를 base로 호출한다.
    // 기본값은 ecBeBo 운영 인스턴스(DSM 리버스 프록시, 22300 포트) — 로컬 개발 시 다른 백엔드를 붙이려면 NUXT_API_BASE_URL로 오버라이드.
    apiBaseUrl: API_URL,
    /** 토스페이먼츠 시크릿 키 (서버 전용, 결제 승인 API용) */
    tossPaymentsSecretKey: process.env.TOSSPAYMENTS_SECRET_KEY ?? "",
    /** 토스 결제창(API 개별 연동) 시크릿 키 — 주문 화면 결제수단 선택 방식의 승인용(서버 전용). 위젯 키(tossPaymentsSecretKey)와 짝이 다르다 */
    tossPaymentsPaySecretKey: process.env.TOSSPAYMENTS_PAY_SECRET_KEY ?? "",
    /** 결제 결과를 ecBeBo 에 기록할 때 쓰는 서버 간 공유 키(백엔드 app.pay.sync-key 와 같은 값) — 서버 전용 */
    paySyncKey: process.env.PAY_SYNC_KEY ?? "",
    /** 본인인증(PASS) — 포트원(PortOne) V2 본인인증 API 시크릿 (서버 전용). 비회원 결제 전 PASS 인증 결과를 서버에서 검증한다. */
    portoneApiSecret: process.env.PORTONE_API_SECRET ?? "",
    /** 포트원 API 주소 (테스트용으로 바꿀 수 있음) */
    portoneApiBase: process.env.PORTONE_API_BASE ?? "https://api.portone.io",
    /** 소셜 로그인 (서버 전용) */
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    naverClientId: process.env.NAVER_CLIENT_ID ?? "",
    naverClientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
    kakaoClientId: process.env.KAKAO_CLIENT_ID ?? "",
    kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    kakaoScope: process.env.KAKAO_SCOPE ?? "", // 비면 기본(account_email profile_nickname)
    // 2026-09-12: 자체 Redis/JWT 로그인 제거 — 인증은 전부 ecBeBo(FoAuthController)를 통하고
    // 이 Nuxt 서버는 beApi.ts로 프록시만 한다(server/api/auth/*.ts 참조). useRedis/redisUrl/
    // authJwtSecret/authAccessTokenTtlSec/authRefreshTokenTtlSec 런타임설정은 그래서 폐기.
    public: {
      cdnBase: process.env.NUXT_PUBLIC_CDN_BASE ?? "https://22400.illeesam.synology.me/api/cdn/prod/img",
      // 2026-09 BFF 전환: 실제 상품/리뷰 이미지가 올라가는 ecBeCdn(CDN 서버) API origin.
      // ecBeBo가 내려주는 prodImgs[].cdnImgUrl 등은 이미 완전한 절대 URL이라 보통 그대로 쓰면 되고,
      // 상대경로만 오는 경우(예: sy_attach.url)에 한해 `${prodCdnBase}/cdn${relativePath}`로 조립한다.
      // 2026-09-14: 값 자체는 "/cdn" 없는 API origin까지만(".../api") — "/cdn"은 각 사용처가
      // 필요할 때 직접 붙인다(app/conts/baseConst.ts의 CDN_URL과 동일 값, 그대로 재사용).
      prodCdnBase: CDN_URL,
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "",
      // 2026-09-20: 브라우저(CSR)가 ecBeBo 를 직접 호출하는 origin — app/utils/axiosCsr.ts 가 이 값 + "/api" 를 baseURL 로 쓴다.
      // (SEO 단위화면의 SSR 만 server/api 를 거친다.) 비밀값 아님 — ecBeBo 는 CORS 로 브라우저 호출을 허용한다.
      beBaseUrl: API_URL,
      // 2026-09-13 추가: 헤더 로고 아래 "현재 접속 중인 환경(prod/dev/local) + api/cdn 대상"
      // 표시용(EnvModeBadge.vue). 실제 서버 호출은 여전히 server/utils/beApi.ts(위 apiBaseUrl,
      // server-only)를 통해서만 이뤄지고, 이건 화면 표시 전용 미러 — 비밀값 아니라 노출 무해.
      apiBaseUrlDisplay: API_URL,
      // Netlify는 별도 NUXT_PUBLIC_MODE 없이 배포되므로(순수 `nuxt build`, .env.production
      // 미로드) 기본값을 "prod"로 둬야 실제 운영 배포 상태와 표시가 일치한다.
      mode: RUN_MODE,
      envNm: process.env.NUXT_PUBLIC_ENV_NM ?? ".env",
      appTitle: APP_TITLE,
      /** 멀티테넌트: 백엔드 사이트(sy_site.site_id) / 모듈 — useTenant() 와 axios·beApi 의 X-Site-Id 헤더가 쓴다. 값은 scripts/tenant.mjs 의 --site / --module 인자 */
      siteId: SITE_ID,
      tenantModule: TENANT_MODULE,
      themeColor: THEME_COLOR,
      /** 토스페이먼츠 클라이언트 키 (결제창 호출용, 테스트/라이브 구분) */
      tossPaymentClientKey: process.env.NUXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY ?? "",
      /** 토스 결제창(API 개별 연동) 클라이언트 키 test_ck_/live_ck_ — 주문 화면의 결제수단 선택(카드/계좌이체/가상계좌/간편결제) 결제창용 */
      tossPayClientKey: process.env.NUXT_PUBLIC_TOSSPAYMENTS_PAY_CLIENT_KEY ?? "",
      /** 토스 카드 등록(빌링) 클라이언트 키 — 'API 개별 연동' 키(결제위젯 키와 다름). 마이페이지 결제카드 등록용 */
      tossBillingClientKey: process.env.NUXT_PUBLIC_TOSSPAYMENTS_BILLING_CLIENT_KEY ?? "",
      /** 포트원 스토어 ID / 본인인증(PASS) 채널 키 — 인증창 호출용(공개 값) */
      portoneStoreId: process.env.NUXT_PUBLIC_PORTONE_STORE_ID ?? "",
      portoneIdvChannelKey: process.env.NUXT_PUBLIC_PORTONE_IDV_CHANNEL_KEY ?? "",
      /** Google Analytics 4 측정 ID (G-XXXXXXXXXX). 비어 있으면 스크립트 미로드 */
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
      // 2026-09-14(요청사항: "env 값 수정하며 ... 맵연결 등 확인하려는거야") — 지도 위젯은
      // 아직 화면에 실제로 붙어있지 않지만(/dev/env-settings에서 값만 미리 저장해둘 수
      // 있게), 값 자체는 이미 runtimeConfig로 노출해둔다.
      kakaoMapKey: process.env.NUXT_PUBLIC_KAKAO_MAP_KEY ?? "",
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
      naverMapClientId: process.env.NUXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "",
    },
  },
  hooks: {
    // 멀티테넌트: app/pages/<모듈>/ 의 화면은 "이 빌드의 모듈" 것만 남기고 주소에서 /<모듈> 을 뗀다(app/pages/ec1/blog.vue → /blog).
    // 다른 모듈의 화면은 라우트에서 빼므로 빌드에 들어가지 않는다. (app/pages 바로 아래에 화면을 두면 모든 모듈 공통이 되고 같은 주소면 모듈 화면이 이긴다 — 지금은 쓰지 않는다)
    "pages:extend"(pages) {
      const mine = pages.filter((p) => pageModule(p.file) === TENANT_MODULE);
      const prefix = new RegExp(`^/${TENANT_MODULE}(?=/|$)`);
      for (const p of mine) {
        p.path = p.path.replace(prefix, "") || "/";
        p.name = (p.name ?? "").replace(new RegExp(`^${TENANT_MODULE}-?`), "") || "index";
      }
      const minePaths = new Set(mine.map((p) => p.path));
      const kept = pages.filter((p) => {
        const mod = pageModule(p.file);
        return mod === TENANT_MODULE || (mod === null && !minePaths.has(p.path));
      });
      pages.splice(0, pages.length, ...kept);
      console.log(`[Tenant] 화면 ${kept.length}개 = 공통 ${kept.length - mine.length} + ${TENANT_MODULE} 전용 ${mine.length} (${mine.map((p) => p.path).sort().join(" ")})`);
      if (process.env.TENANT_PRINT_ROUTES === "1") console.log(`[Tenant] 전체 주소: ${kept.map((p) => p.path).sort().join(" ")}`);
    },
    ready(nuxt) {
      console.log("\n[Env] NUXT_* 환경변수:");
      Object.keys(process.env)
        .filter((k) => k.startsWith("NUXT_"))
        .sort()
        .forEach((k) => console.log(`  ${k}=${process.env[k] ?? ""}`));
      console.log(`[Tenant] 사이트=${SITE_ID}  모듈=${TENANT_MODULE}(app/pages/${TENANT_MODULE})  사이트(sy_site.site_id)=${SITE_ID}`);
      console.log("[Env] useRuntimeConfig().public.NAME (적용값):", {
        prodCdnBase: CDN_URL,
        apiBaseUrlDisplay: API_URL,
        mode: RUN_MODE,
        envNm: process.env.NUXT_PUBLIC_ENV_NM ?? ".env",
        appTitle: APP_TITLE,
        themeColor: THEME_COLOR,
      });
    },
  },
});
