# Outstock — Nuxt 4 + Tailwind CSS

> Vue 3 / Nuxt 4 기반 이커머스 프론트엔드 프로젝트

---

## 기술 스택

| 항목            | 버전 / 내용                                             |
| --------------- | ------------------------------------------------------- |
| Framework       | Nuxt 4 (Vue 3)                                          |
| CSS             | Tailwind CSS v3, SCSS                                   |
| 상태 관리       | Pinia                                                   |
| HTTP 클라이언트 | Axios                                                   |
| 유효성 검사     | Vee-Validate + Yup                                      |
| UI 컴포넌트     | vue3-carousel, @yeger/vue-masonry-wall, @vueform/slider |

---

## 설치

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

---

## 환경 파일(.env) 구성

Nuxt는 실행 명령에 따라 아래 파일을 자동 병합합니다. (하단이 우선 적용)

| 파일               | 적용 시점    | 설명                            |
| ------------------ | ------------ | ------------------------------- |
| `.env`             | 항상         | 공통 기본값 (모든 환경)         |
| `.env.development` | `nuxt dev`   | 개발 환경 자동 로드             |
| `.env.local`       | 항상         | 개인 로컬 오버라이드 (Git 제외) |
| `.env.production`  | `nuxt build` | 운영 환경 자동 로드             |

### 주요 환경 변수

| 변수명                 | 설명                       | 예시                    |
| ---------------------- | -------------------------- | ----------------------- |
| `NUXT_PUBLIC_CDN_BASE` | 이미지 CDN 기본 경로       | `https://22400.illeesam.synology.me/api/cdn/prod/img` |
| `NUXT_API_BASE_URL`    | 서버 내부 API URL (SSR용)  | `http://localhost:3000` |
| `NUXT_PUBLIC_API_BASE` | 클라이언트 API URL (CSR용) | `http://localhost:3000` |
| `PORT` / `NITRO_PORT`  | 서버 포트                  | `3000`                  |

---

## 실행 명령 전체 목록 (멀티테넌트, 2026-10-03)

스크립트 이름 = **`[명령]:[프로파일]:[모듈]`**. 환경파일은 프로파일(`.env.local` / `.env.development` / `.env.production`)마다 하나이고, 사이트(`sy_site.site_id`)·모듈은 `scripts/tenant.mjs` 인자로 함께 넘긴다. 자세한 구조는 `_docs/multi-tenant.md`.

| 모듈 | 사이트 ID | 개발서버(local) | 개발서버(development) | 빌드 local | 빌드 development | 빌드 production |
| --- | --- | --- | --- | --- | --- | --- |
| ec1 (쇼핑몰) | `SI260001` | `local:ec1` | `dev:ec1` | `build:local:ec1` | `build:dev:ec1` | `build:prod:ec1` |
| ec2 (시험용) | `SI260002` | `local:ec2` | `dev:ec2` | `build:local:ec2` | `build:dev:ec2` | `build:prod:ec2` |
| danmoo1 (당근 스타일) | `SI260003` | `local:danmoo1` | `dev:danmoo1` | `build:local:danmoo1` | `build:dev:danmoo1` | `build:prod:danmoo1` |

| 그 밖의 명령 | 설명 |
| --- | --- |
| `npm run local` / `npm run dev` | ec1 개발서버(각각 `.env.local` / `.env.development`) |
| `npm run build` | ec1 운영 빌드 — Netlify 운영 배포(GitHub Actions)가 쓰는 이름 |
| `npm run preview` / `npm run preview:dev` | 빌드 결과 미리보기(사이트·모듈은 빌드된 값 그대로) |
| `npm run typecheck -- --site SI260003 --module danmoo1` | 모듈별 타입 검사(인자 없으면 ec1) |
| `npm run generate` | 정적 사이트 생성(SSG) |

```bash
npm run local:ec2              # ec2 개발서버, .env.local (백엔드 localhost:3000)
npm run dev:danmoo1            # danmoo1 개발서버, .env.development (NAS 백엔드)
npm run build:prod:danmoo1     # danmoo1 운영 빌드
npm run dev -- --site SI260002 --module ec2   # 목록에 없는 조합은 직접(사이트·모듈은 항상 함께)
```

---

## 환경별 개발 흐름

| 단계                | 명령                                            | 비고                                       |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| 최초 설치           | `npm install`                                   |                                            |
| 로컬 개발           | `npm run local:ec1` (모듈별 `local:<모듈>`)     | `.env.local` — 백엔드 localhost:3000       |
| 개발 백엔드로 확인  | `npm run dev:ec1` (모듈별 `dev:<모듈>`)         | `.env.development` — NAS 백엔드            |
| 운영 빌드 검증      | `npm run build:prod:ec1` + `npm run preview`    | `.env.production` 기준 최종 확인           |
| 배포                | NAS: `z0scripts/shopjoy-apps-dev/ecFeFoNuxt4`, 운영: main push → GitHub Actions(Netlify) | 빌드 전 sy_site 사이트·모듈 대조 |

---

## 데모 계정

로컬 개발용 임시 계정 (별도 백엔드 없이 사용 가능)

| 항목     | 값                                    |
| -------- | ------------------------------------- |
| 이메일   | `demo1@mail.com` ~ `demo99@mail.com`  |
| 비밀번호 | `123456`                              |
| 이름     | 홍길동1 ~ 홍길동99                    |
| 연락처   | `010-1234-0001` ~ `010-1234-0099`     |
| 주소     | 성남시 중원구 성남대로 997-1 ~ 997-99 |

---

더 자세한 내용은 [Nuxt 공식 문서](https://nuxt.com/docs)를 참고하세요.
