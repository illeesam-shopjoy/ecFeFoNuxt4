import type { Config } from 'tailwindcss'

// 2026-10-03(요청사항: "app/assets 아래 스타일 각 모듈별로 스타일 있어야 해") — 유틸리티 클래스도 이 빌드의 모듈 파일에서만 뽑는다.
// 예전엔 모든 모듈(ec1·ec2·danmoo1 …)의 화면을 다 훑어 어느 빌드든 남의 모듈 클래스까지 CSS 에 들어갔다.
// 모듈은 scripts/tenant.mjs 가 넣는 NUXT_PUBLIC_TENANT_MODULE(nuxt.config 보다 먼저 정해진다). 없으면(편집기 자동완성 등) 전부.
const M = process.env.NUXT_PUBLIC_TENANT_MODULE || '*'

export default {
  content: [
    `./app/components/${M}/**/*.{vue,js,ts}`,
    `./app/layout/${M}/**/*.vue`,
    './app/layouts/**/*.vue',
    `./app/pages/${M}/**/*.vue`,
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // 테넌트 대표색 — 환경파일 NUXT_PUBLIC_THEME_COLOR (멀티테넌트, 2026-10-02). 없으면 기존 색.
        theme: process.env.NUXT_PUBLIC_THEME_COLOR || '#bc8246',
        'theme-2': '#8a8f6a',
        // 2026-09-14(요청사항: "tailwind 에 맞게 커스텀되어야 해") — login/register/contact/
        // 리뷰작성 등 8곳에서 이미 쓰던 class="text-danger"(vee-validate ErrorMessage)를
        // 커스텀 CSS 규칙 대신 진짜 Tailwind 유틸리티로 만든다. text-danger/bg-danger/
        // border-danger 등이 자동 생성되므로 기존 템플릿은 손댈 필요 없음.
        danger: '#dc2626',
      },
      // 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — AppImage/Skeleton*.vue
      // 4곳에서 각자 .skeleton-shimmer + @keyframes shimmer를 중복 정의하고 있던 걸 여기 하나로
      // 모음. 사용처는 `animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0]
      // to-[#f0f0f0] bg-[length:200%_100%]` 조합으로 대체.
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config
