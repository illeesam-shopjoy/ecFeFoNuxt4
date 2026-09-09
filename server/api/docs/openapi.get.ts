/**
 * OpenAPI 3.0 스펙 (Swagger UI용)
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
      // 2026-09 BFF 전환: 경로를 ecBeBo 실제 API 경로와 동일하게 맞춤 (server/utils/beApi.ts 참조)
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
      "/api/base/ec/pd/review": {
        post: {
          summary: "리뷰 등록 (로그인 필요)",
          tags: ["products"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["prodId", "content", "rating"],
                  properties: {
                    prodId: { type: "string", description: "상품 ID" },
                    reviewTitle: { type: "string", description: "제목" },
                    content: { type: "string", description: "내용" },
                    rating: { type: "number", minimum: 0.5, maximum: 5, multipleOf: 0.5, description: "별점 (0.5 단위)" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "등록 성공" }, "400": { description: "입력 오류" }, "401": { description: "로그인 필요" } },
        },
      },
      "/api/fo/ec/cm/bltn/page": {
        get: {
          summary: "블로그 목록",
          tags: ["blogs"],
          responses: { "200": { description: "블로그 목록" } },
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
      "/api/fo/ec/pd/category": {
        get: {
          summary: "카테고리 목록 (상품 목록에서 즉석 집계)",
          tags: ["common"],
          responses: { "200": { description: "카테고리 목록" } },
        },
      },
      "/api/fo/ec/pd/category-tree": {
        get: {
          summary: "카테고리 트리 (상품 목록에서 즉석 집계)",
          tags: ["common"],
          responses: { "200": { description: "categoryTree, categoryIdToName" } },
        },
      },
      "/api/fo/sy/brand": {
        get: {
          summary: "브랜드 목록 (상품 목록에서 즉석 집계)",
          tags: ["common"],
          responses: { "200": { description: "브랜드 목록" } },
        },
      },
      "/api/co/sy/code": {
        get: {
          summary: "공통 코드 전체 목록",
          tags: ["common"],
          responses: { "200": { description: "코드 목록" } },
        },
      },
      "/api/fo/menu": {
        get: {
          summary: "상단 메뉴 (정적)",
          tags: ["common"],
          responses: { "200": { description: "메뉴 목록" } },
        },
      },
      "/api/fo/ec/pd/prod-opt": {
        get: {
          summary: "옵션(사이즈/색상) 필터 목록",
          tags: ["common"],
          responses: { "200": { description: "옵션 목록" } },
        },
      },
      "/cdn/img": {
        get: {
          summary: "정적 이미지 (CDN)",
          description: "app/assets/img 폴더의 이미지를 제공. 예: GET /cdn/img/logo.png",
          tags: ["cdn"],
          responses: { "200": { description: "이미지 바이너리" }, "404": { description: "파일 없음" } },
        },
      },
      "/cdn/img/{path}": {
        get: {
          summary: "정적 이미지 파일",
          description: "app/assets/img 하위 경로의 이미지. path 예: logo.png, banner/main.jpg, logo/logo-2.png",
          tags: ["cdn"],
          parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" }, description: "이미지 상대 경로" }],
          responses: { "200": { description: "이미지 바이너리" }, "404": { description: "파일 없음" } },
        },
      },
    },
    tags: [
      { name: "products", description: "상품" },
      { name: "blogs", description: "블로그" },
      { name: "common", description: "공통" },
      { name: "cdn", description: "정적 리소스 (이미지)" },
    ],
  };
});
