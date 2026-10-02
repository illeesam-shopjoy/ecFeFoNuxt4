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
- `NUXT_PUBLIC_TENANT_MODULE` = `[모듈]`(`app/{pages,components,layout}/[모듈]` + `app/conts/tenant/[모듈].ts`) — 파일명의 `[모듈]`과 같아야 한다.
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
1. 환경파일이 있는가, `app/{pages,components,layout}/<모듈>/` 와 `app/conts/tenant/<모듈>.ts` 가 있는가
2. 파일 안의 `NUXT_PUBLIC_TENANT_MODULE` 이 파일명의 모듈과 같은가 (다른 테넌트 파일을 복사해 이름만 바꾼 실수 방지)
3. `NUXT_PUBLIC_SITE_ID` 가 백엔드 `sy_site` 에 있고 ACTIVE 인가 — 통과하면 `사이트코드 · 이름`을 출력해 눈으로 확인한다. 백엔드에 닿지 않으면 경고만 하고 진행한다(`--skip-site-check` 로 건너뛸 수 있다).

## 3. 폴더 구조

화면 모양은 모듈마다 다르다고 보고, **화면·컴포넌트·레이아웃은 모듈마다 독립된 소스**로 둔다. 모양과 무관한 것(토스트·유틸·스토어·API 호출)만 같이 쓴다.

```
ecFeFoNuxt4/
  app/
    pages/
      ec1/                 ← 모듈 ec1 의 화면 전체 (홈, 상품, 로그인, 마이페이지, 결제, 블로그, 이벤트 …)
        index.vue          →  /
        login/index.vue    →  /login
        my/order.vue       →  /my/order
      ec2/                 ← 모듈 ec2 의 화면 전체 (ec1 과 독립된 사본 — 블로그·이벤트 없음, ec2-intro 있음)
    components/
      ec1/                 ← 모듈 ec1 의 컴포넌트 전체 (products/, modals/, my/, error/ErrorPage.vue …)
      ec2/                 ← 모듈 ec2 의 컴포넌트 전체 (독립된 사본)
    layout/
      ec1/, ec2/           ← 모듈별 레이아웃·헤더·푸터
    error.vue, app.vue     ← 공통 껍데기: 오류 화면·확인/알림 창은 #tenant-components 로 "이 빌드의 모듈" 것을 연결만 한다
    conts/tenant/
      ec1.ts, ec2.ts       ← 모듈 설정: 이름·메뉴·기능 스위치 (TenantConfigType)
    plugins/ utils/ store/ svc/ composables/ types/ conts/   ← 공통: 토스트(vue3-toastify)·유틸·스토어·API 호출·타입
  scripts/tenant.mjs       ← 테넌트 실행기
```

### 규칙
- **화면·컴포넌트·레이아웃은 모듈마다 전부 독립이다.** `app/pages`, `app/components`, `app/layout` 바로 아래에는 파일을 두지 않고 반드시 `<모듈>/` 안에 둔다. 한 모듈을 고쳐도 다른 모듈에는 영향이 없다 — 여러 모듈에 같이 반영할 수정은 각 모듈 폴더에 각각 한다. 로그인·오류 화면도 모듈별이다.
- **모듈 안에서는 자기 모듈 경로를 직접 적는다.** `app/pages/ec1/**`, `app/components/ec1/**`, `app/layout/ec1/**` 의 import 는 `~/components/ec1/…`, `~/layout/ec1/…` 이다. 다른 모듈 폴더를 import 하지 않는다.
- **공통 코드가 모듈 컴포넌트를 써야 할 때는 별칭을 쓴다.** `#tenant-components/…`(= `app/components/<이 빌드의 모듈>`), `#tenant-layout/…`. 예: `app/error.vue`, `app/app.vue`.
- **토스트·JS 유틸·스토어·svc·composables·types 는 공통이다.** 여기에는 모양(마크업·스타일)을 넣지 않는다.
- **주소에 모듈 이름은 붙지 않는다.** `app/pages/ec1/blog.vue` 의 주소는 `/blog` 다(nuxt.config.ts 의 `pages:extend` 가 접두어를 뗀다). 컴포넌트 자동 등록 이름도 모듈 폴더 기준이라 `<xdev-file-path-badge>` 처럼 그대로 쓴다.
- **빌드에는 그 배포의 모듈 것만 들어간다.** ec1 빌드에 ec2 의 화면·컴포넌트·레이아웃·설정은 없고(주소도 없음), 반대도 같다.
- 빌드 로그의 `[Tenant] 화면 N개 = 공통 0 + ec1 전용 N (…)` 로 구성을 확인한다.

## 4. 새 사이트·모듈 추가 (예: site3 · ec3)
1. 백엔드 `sy_site` 에 사이트를 등록하고 `site_id` 를 확인한다.
2. 가까운 모듈의 폴더 세 개를 통째로 복사한다: `app/pages/ec1` → `ec3`, `app/components/ec1` → `ec3`, `app/layout/ec1` → `ec3`.
3. 복사한 폴더 안의 `~/components/ec1/`, `~/layout/ec1/` 를 `ec3` 으로 일괄 바꾼다. 필요 없는 화면은 지우고 달라지는 부분을 고친다.
4. `app/conts/tenant/ec3.ts`(id/name/menus/features)를 만든다.
5. `.env.site3.ec3.{local,development,production}` 를 만든다(`NUXT_PUBLIC_SITE_ID`=그 site_id, `NUXT_PUBLIC_TENANT_MODULE=ec3`).
6. `pnpm tenant dev --site site3 --module ec3 --profile local` 로 확인한다.

## 5. 백엔드(ecBeBo) 사이트 확정 — 적용됨 (2026-10-02)
- `/api/fo/**` 는 **사이트 필수**다. `X-Site-Id` 를 `sy_site`(ACTIVE)와 대조해 확정하고, 헤더가 없으면 로그인 토큰의 siteId 만 인정한다(둘 다 없으면 400). 없는 사이트는 400, 회원 토큰의 사이트와 헤더가 다르면 403.
- FO 조회는 요청 사이트로 한정된다(상품·카테고리·이벤트·기획전·전시·오프라인쿠폰 등). 다른 사이트의 상품은 "존재하지 않음"으로 응답한다. 기본 사이트로 조용히 대체하던 코드는 없앴다.
- 규칙은 `ecBeBo/CLAUDE.md` 의 "멀티테넌트 — FO 사이트(siteId) 필수 규칙" 참고.

## 5-1. 사이트 ↔ 모듈 매핑은 DB(sy_site.tenant_module)에도 둔다 (2026-10-02)
- BO 사이트관리(SySiteDtl)의 "FO 모듈" 필드. 환경파일의 `[모듈]`과 같아야 하며, `scripts/tenant.mjs` 가 다르면 빌드를 중단한다(미지정이면 안내만).
- 회원(mb_member.site_id)·BO 사용자(sy_user.reg_site_id)의 "모듈"은 이 값을 사이트로 따라간다 — 임시로그인(테스트 회원/사용자 선택) 목록의 모듈 컬럼·필터가 이것이다(백엔드 SiteRegistry 가 캐시).
- 헤더 로고 아래에 이 배포의 `site <site_id> · <모듈>` 을 표시한다(useTenant).

## 6. 남은 과제
- `site_id` 컬럼이 없는 테이블(블로그·FAQ·공지·브랜드·문의 등)은 모든 사이트가 같이 본다. 사이트별로 나누려면 컬럼 추가(DDL)와 데이터 이관이 먼저다.
- `/api/co/**`(로그인·회원가입·공통코드 등)는 아직 헤더가 선택이다. 회원가입·로그인이 요청 사이트를 따르게 하고 `app.site.required=true` 로 켜는 작업이 남았다.
- 이메일 인증 링크 기준 주소(`app.fo-base-url`) 등 사이트마다 달라지는 백엔드 설정은 사이트별 설정(예: `sy_site.config_json`)으로 옮겨야 한다.
- 스타일(`app/assets` 의 scss)은 아직 공통이다. 모듈별 테마가 필요해지면 `app/assets/<모듈>` 로 나눈다.
