// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";
// 2026-09-14(요청사항: "nuxt.config.ts 파일의 process.env 정보 baseConst.ts에 정의하고
// 사용하는건 어때?") — api/cdn/mode 관련 값(전부 public, 노출 무해)의 근원을 baseConst.ts
// 하나로 통일. 결제/소셜로그인 시크릿 등 서버 전용 민감정보는 그대로 여기서 직접 읽는다
// (app/ 밑 파일은 클라이언트 번들에도 들어갈 수 있어 시크릿을 두기엔 부적절).
import { CDN_URL, API_URL, RUN_MODE } from "./app/conts/baseConst";

export default defineNuxtConfig({
  compatibilityDate: "2025-12-12",
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
  app: {
    head: {
      title: "shopjoy",
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
      appTitle: process.env.NUXT_PUBLIC_APP_TITLE ?? "shopjoy",
      /** 토스페이먼츠 클라이언트 키 (결제창 호출용, 테스트/라이브 구분) */
      tossPaymentClientKey: process.env.NUXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY ?? "",
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
    ready(nuxt) {
      console.log("\n[Env] NUXT_* 환경변수:");
      Object.keys(process.env)
        .filter((k) => k.startsWith("NUXT_"))
        .sort()
        .forEach((k) => console.log(`  ${k}=${process.env[k] ?? ""}`));
      console.log("[Env] useRuntimeConfig().public.NAME (적용값):", {
        prodCdnBase: CDN_URL,
        apiBaseUrlDisplay: API_URL,
        mode: RUN_MODE,
        envNm: process.env.NUXT_PUBLIC_ENV_NM ?? ".env",
        appTitle: process.env.NUXT_PUBLIC_APP_TITLE ?? "shopjoy",
      });
    },
  },
});
