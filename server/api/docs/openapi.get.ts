/**
 * OpenAPI 3.0 스펙 (Swagger UI용)
 *
 * 2026-09-20: 이 Nuxt 서버(server/api)에는 **SEO 단위화면의 서버 렌더링(SSR)용 3개**(상품 목록/상세, 블로그 상세)와
 * 서버 전용 기능(결제 승인, 소셜 로그인, dev 도구)만 남았다. 그 외 모든 조회/등록은 브라우저가 ecBeBo 를 직접 호출한다
 * (app/svc/** + app/utils/axiosCsr.ts) — 그 API 명세는 ecBeBo Swagger 를 볼 것.
 */
export default defineEventHandler((event) => {
  const baseUrl = getRequestURL(event).origin;
  return {
    openapi: "3.0.0",
    info: {
      title: "Outstock API",
      description: "Nuxt 서버 API 문서",
      version: "1.0.0",
    },
    servers: [{ url: baseUrl, description: "현재 서버" }],
    paths: {
      // SEO 서버 렌더링 전용 — 경로는 ecBeBo 실제 API 경로와 동일(server/utils/beApi.ts 가 ecBeBo 로 넘긴다)
      "/api/fo/ec/pd/prod/page": {
        get: {
          summary: "상품 목록",
          tags: ["products"],
          responses: { "200": { description: "상품 목록" } },
        },
      },
      "/api/fo/ec/pd/prod/{id}": {
        get: {
          summary: "상품 상세",
          tags: ["products"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ecBeBo prodId" }],
          responses: { "200": { description: "상품 상세 (reviews 포함)" }, "404": { description: "없음" } },
        },
      },
      "/api/fo/ec/cm/bltn/{id}": {
        get: {
          summary: "블로그 상세",
          tags: ["blogs"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ecBeBo blogId" }],
          responses: { "200": { description: "블로그 상세" }, "404": { description: "없음" } },
        },
      },
      "/api/payments/confirm": {
        post: {
          summary: "토스페이먼츠 결제 승인 (서버 전용 — 시크릿 키 필요)",
          tags: ["payments"],
          responses: { "200": { description: "승인 성공" } },
        },
      },
      "/cdn/prod/img": {
        get: {
          summary: "정적 이미지 (CDN)",
          description: "app/assets/prod/img 폴더의 이미지를 제공. 예: GET /cdn/prod/img/logo.png",
          tags: ["cdn"],
          responses: { "200": { description: "이미지 바이너리" }, "404": { description: "파일 없음" } },
        },
      },
      "/cdn/prod/img/{path}": {
        get: {
          summary: "정적 이미지 파일",
          description: "app/assets/prod/img 하위 경로의 이미지. path 예: logo.png, banner/main.jpg, logo/logo-2.png",
          tags: ["cdn"],
          parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" }, description: "이미지 상대 경로" }],
          responses: { "200": { description: "이미지 바이너리" }, "404": { description: "파일 없음" } },
        },
      },
    },
    tags: [
      { name: "products", description: "상품" },
      { name: "blogs", description: "블로그" },
      { name: "payments", description: "결제" },
      { name: "cdn", description: "정적 리소스 (이미지)" },
    ],
  };
});
