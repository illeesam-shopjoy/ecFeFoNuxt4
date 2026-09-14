import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layout/**/*.vue',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        theme: '#bc8246',
        'theme-2': '#8a8f6a',
        // 2026-09-14(요청사항: "tailwind 에 맞게 커스텀되어야 해") — login/register/contact/
        // 리뷰작성 등 8곳에서 이미 쓰던 class="text-danger"(vee-validate ErrorMessage)를
        // 커스텀 CSS 규칙 대신 진짜 Tailwind 유틸리티로 만든다. text-danger/bg-danger/
        // border-danger 등이 자동 생성되므로 기존 템플릿은 손댈 필요 없음.
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
} satisfies Config
