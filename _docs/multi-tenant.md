# ecFeFoNuxt4 멀티테넌트 구조 (2026-10-02)

사이트와 모듈은 **배포(빌드)별로 고정**이다. 어떤 사이트·모듈로 빌드할지는 환경파일 이름이 정한다.

## 1. 환경파일 — `.env.[사이트].[모듈].[프로파일]`

| 파일 | 용도 |
|---|---|
| `.env.site1.ec1.local` / `.development` / `.production` | 사이트 site1 · 모듈 ec1 (현재 쇼핑몰) |
| `.env.site2.ec2.local` / `.development` / `.production` | 사이트 site2 · 모듈 ec2 (확장성 시험용) |
| `*.example` | 각 파일의 예제(마스킹) |

- `[사이트]`(site1, site2)는 **배포 이름표**이고 파일명에만 있다. 사이트의 실제 값은 파일 안의 `NUXT_PUBLIC_SITE_ID` **하나**이며 백엔드 `sy_site.site_id`(PK)다.
  - site1 = `2604010000000001` (site_code `SHOPJOY`), site2 = `2604010000000002` (site_code `site2`)
- `NUXT_PUBLIC_TENANT_MODULE` = `tenants/[모듈]` — 파일명의 `[모듈]`과 같아야 한다.
- `NUXT_PUBLIC_THEME_COLOR` = 테넌트 대표색(tailwind `theme` 색).
- 모든 API 요청에 `X-Site-Id: <NUXT_PUBLIC_SITE_ID>` 헤더가 붙는다(브라우저 axios, SEO SSR → 백엔드 호출 모두).

### 배포 대응
- 개발(NAS) = `.env.site1.ec1.development` — `z0scripts/shopjoy-apps-dev/ecFeFoNuxt4/deploy.js`
- 운영(Netlify) = `.env.site1.ec1.production` — GitHub Actions `netlify-deploy.yml` 이 `pnpm run build`(= production 프로파일) 실행

## 2. 실행 — `scripts/tenant.mjs`

```
pnpm tenant dev   --site site2 --module ec2 --profile local
pnpm tenant build --site site1 --module ec1 --profile production
```
자주 쓰는 별칭: `pnpm local` / `dev` / `build:dev` / `build:prod`(모두 site1·ec1), `local:site2` / `dev:site2` / `build:site2:dev` / `build:site2:prod`(site2·ec2).

실행기는 빌드 전에 다음을 확인한다. 하나라도 어긋나면 중단한다.
1. 환경파일이 있는가, `tenants/<모듈>/` 이 있는가
2. 파일 안의 `NUXT_PUBLIC_TENANT_MODULE` 이 파일명의 모듈과 같은가 (다른 테넌트 파일을 복사해 이름만 바꾼 실수 방지)
3. `NUXT_PUBLIC_SITE_ID` 가 백엔드 `sy_site` 에 있고 ACTIVE 인가 — 통과하면 `사이트코드 · 이름`을 출력해 눈으로 확인한다. 백엔드에 닿지 않으면 경고만 하고 진행한다(`--skip-site-check` 로 건너뛸 수 있다).

## 3. 폴더 구조

```
ecFeFoNuxt4/
  app/                  ← 공통(core): 로그인·마이페이지·판매자 센터·결제 등 모든 모듈이 공유
    composables/useTenant.ts   ← 사이트·모듈·이름·메뉴를 읽는 단일 진입점
    types/tenantConfig.ts      ← 모듈 설정(app.config 의 tenant) 타입
  tenants/
    ec1/                ← 모듈 ec1 (현재 쇼핑몰 그대로)
      nuxt.config.ts
      app/app.config.ts                   ← tenant: 이름·메뉴·기능 스위치
      app/components/tenant/TenantHome.vue ← 홈 화면
    ec2/                ← 모듈 ec2 (별도 홈·메뉴·전용 페이지)
      app/pages/ec2-intro.vue             ← 이 모듈에만 있는 라우트
  scripts/tenant.mjs    ← 테넌트 실행기
```

### 왜 이런 모양인가 (Nuxt 레이어 규칙)
- 레이어보다 **프로젝트(app/)가 우선**이다. 그래서 core 가 같은 이름의 컴포넌트/설정을 두면 모듈이 덮을 수 없다.
- 따라서 core 는 **확장 지점**만 열고 모듈이 채운다: `<TenantHome />`(홈), `app.config.ts` 의 `tenant`(이름·메뉴·기능). core 에 `TenantHome` 구현은 두지 않는다.
- 레이어 파일에서도 `~` 별칭은 프로젝트 루트(app/)를 가리키므로 core 컴포넌트를 `~/components/...` 로 그대로 가져다 쓴다.

## 4. 새 사이트·모듈 추가 (예: site3 · ec3)
1. 백엔드 `sy_site` 에 사이트를 등록하고 `site_id` 를 확인한다.
2. `tenants/ec2/` 를 복사해 `tenants/ec3/` 를 만들고 `app.config.ts`(id/name/menus), `TenantHome.vue`, 전용 pages 를 채운다.
3. `.env.site3.ec3.{local,development,production}` 를 만든다(`NUXT_PUBLIC_SITE_ID`=그 site_id, `NUXT_PUBLIC_TENANT_MODULE=ec3`).
4. `pnpm tenant dev --site site3 --module ec3 --profile local` 로 확인한다.

## 5. 남은 과제 (백엔드)
- FO 백엔드가 `X-Site-Id` 를 필수로 받아 `sy_site` 와 대조하고, 토큰의 `siteId` 와 다르면 거부하며, 공개 API 의 "기본 사이트로 조용히 대체"(`getSiteIdOrDefault`)를 제거해야 진짜 데이터 격리가 된다. 지금은 프론트가 헤더를 보내기만 한다.
- 이메일 인증 링크 기준 주소(`app.fo-base-url`) 등 사이트마다 달라지는 백엔드 설정은 사이트별 설정(예: `sy_site.config_json`)으로 옮겨야 한다.
