// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-12-12",
  vite: {
    server: {
      open: "chrome",
    },
  },
  css: ["vue3-carousel/dist/carousel.css", "~/assets/scss/main.scss"],
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
      title: "jungdam",
      link: [
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
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
    "/shop": { ssr: true }, // 상품 목록: SSR + SEO
    "/prod-dtl/**": { ssr: true }, // 상품 상세 (/:id): SSR + SEO
    "/blog-dtl/**": { ssr: true }, // 블로그 상세 (/:id): SSR + SEO
  },
  // CDN: app/assets/img 폴더를 /cdn/img 경로로 정적 서빙 (절대경로로 해석 보장)
  nitro: {
    publicAssets: [
      {
        dir: fileURLToPath(new URL("app/assets/img", import.meta.url)),
        baseURL: "/cdn/img",
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
    apiBaseUrl: process.env.NUXT_API_BASE_URL ?? "https://22300.illeesam.synology.me",
    /** 토스페이먼츠 시크릿 키 (서버 전용, 결제 승인 API용) */
    tossPaymentsSecretKey: process.env.TOSSPAYMENTS_SECRET_KEY ?? "",
    /** 소셜 로그인 (서버 전용) */
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    naverClientId: process.env.NAVER_CLIENT_ID ?? "",
    naverClientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
    kakaoClientId: process.env.KAKAO_CLIENT_ID ?? "",
    kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    appleClientId: process.env.APPLE_CLIENT_ID ?? "",
    appleTeamId: process.env.APPLE_TEAM_ID ?? "",
    appleKeyId: process.env.APPLE_KEY_ID ?? "",
    applePrivateKey: process.env.APPLE_PRIVATE_KEY ?? "",
    // 2026-09-12: 자체 Redis/JWT 로그인 제거 — 인증은 전부 ecBeBo(FoAuthController)를 통하고
    // 이 Nuxt 서버는 beApi.ts로 프록시만 한다(server/api/auth/*.ts 참조). useRedis/redisUrl/
    // authJwtSecret/authAccessTokenTtlSec/authRefreshTokenTtlSec 런타임설정은 그래서 폐기.
    public: {
      cdnBase: process.env.NUXT_PUBLIC_CDN_BASE ?? "/cdn/img",
      // 2026-09 BFF 전환: 실제 상품/리뷰 이미지가 올라가는 ecBeCdn(CDN 서버) base.
      // ecBeBo가 내려주는 prodImgs[].cdnImgUrl 등은 이미 완전한 절대 URL이라 보통 그대로 쓰면 되고,
      // 상대경로만 오는 경우(예: sy_attach.url)에 한해 `${prodCdnBase}${relativePath}`로 조립한다.
      prodCdnBase: process.env.NUXT_PUBLIC_PROD_CDN_BASE ?? "https://22400.illeesam.synology.me/api/cdn",
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "",
      mode: process.env.NUXT_PUBLIC_MODE ?? "default",
      envNm: process.env.NUXT_PUBLIC_ENV_NM ?? ".env",
      appTitle: process.env.NUXT_PUBLIC_APP_TITLE ?? "정담",
      /** 토스페이먼츠 클라이언트 키 (결제창 호출용, 테스트/라이브 구분) */
      tossPaymentClientKey: process.env.NUXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY ?? "",
      /** Google Analytics 4 측정 ID (G-XXXXXXXXXX). 비어 있으면 스크립트 미로드 */
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
    },
  },
  hooks: {
    ready(nuxt) {
      const port = nuxt.options.devServer?.port ?? 3000;
      const host = (nuxt.options.devServer?.host === "0.0.0.0" ? "localhost" : nuxt.options.devServer?.host) ?? "localhost";
      const swaggerUrl = `http://${host}:${port}/api/docs`;
      console.log("\n[Env] NUXT_* 환경변수:");
      Object.keys(process.env)
        .filter((k) => k.startsWith("NUXT_"))
        .sort()
        .forEach((k) => console.log(`  ${k}=${process.env[k] ?? ""}`));
      console.log("[Env] useRuntimeConfig().public.NAME (적용값):", {
        cdnBase: process.env.NUXT_PUBLIC_CDN_BASE ?? "/cdn/img",
        apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "",
        mode: process.env.NUXT_PUBLIC_MODE ?? "default",
        envNm: process.env.NUXT_PUBLIC_ENV_NM ?? ".env",
        appTitle: process.env.NUXT_PUBLIC_APP_TITLE ?? "정담",
      });
      console.log("\n[Swagger] API 문서:", swaggerUrl, "\n");
    },
  },
});
