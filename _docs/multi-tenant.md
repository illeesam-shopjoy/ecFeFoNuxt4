# ecFeFoNuxt4 멀티테넌트 구조 (2026-10-02)

사이트와 모듈은 **배포(빌드)별로 고정**이다. 어떤 사이트·모듈로 빌드할지는 **실행 명령의 인자**(`scripts/tenant.mjs --site/--module`)가 정하고, 환경파일은 프로파일별로 하나다. (2026-10-03 재정리 — 그 전엔 `.env.[사이트].[모듈].[프로파일]` 9개 파일이었다)

## 1. 환경파일 — `.env.[프로파일]`

| 파일 | 용도 |
|---|---|
| `.env.local` | 로컬 실행(백엔드 localhost:3000) |
| `.env.development` | NAS 개발 배포(22100) |
| `.env.production` | Netlify 운영(+ danmoo1 별칭) |
| `*.example` | 각 파일의 예제(마스킹) |

- 환경파일에는 **프로파일 성격의 값만** 둔다: 백엔드/CDN 주소, 실행 모드, 결제·소셜·지도 키. 사이트·모듈·제목·테마색은 두지 않는다(있어도 무시, `tenant.mjs` 가 경고).
- 모듈 = `--module <모듈>`(`app/{pages,components,layout,assets}/[모듈]` + `app/conts/tenant/[모듈].ts`) → `NUXT_PUBLIC_TENANT_MODULE`.
- 사이트 = `--site <sy_site.site_id>` → `NUXT_PUBLIC_SITE_ID`. **`--site` 와 `--module` 은 항상 함께 준다**(하나만 주면 중단). 현재: ec1 → `SI260001`(site_code `SHOPJOY`), ec2 → `SI260002`(`site2`), danmoo1 → `SI260003`(`site3`, 2026-10-02 사이트 7 로 시작 → 10-03 사이트 3 으로 이전). 둘 다 생략하면 ec1 · `SI260001`.
- 앱 제목·테마색 = 모듈 설정 `app/conts/tenant/<모듈>.ts` 의 `appTitle` / `themeColor`(nuxt.config.ts 가 읽어 runtimeConfig·tailwind `theme` 색에 넣는다).
- 모든 API 요청에 `X-Site-Id: <사이트>` 헤더가 붙는다(브라우저 axios, SEO SSR → 백엔드 호출 모두).

### 배포 대응
- 개발(NAS) = `.env.development` + ec1 — `z0scripts/shopjoy-apps-dev/ecFeFoNuxt4/deploy.js` 가 `tenant.mjs build --site SI260001 --module ec1 --profile development`
- 운영(Netlify) = `.env.production` + ec1 — GitHub Actions `netlify-deploy.yml` 이 `pnpm run build`
- danmoo1 미리보기(Netlify 별칭) = `.env.production` + danmoo1 — 같은 워크플로의 `deploy-danmoo1` 잡이 `pnpm run build:prod:danmoo1` 후 `netlify deploy --alias danmoo1` → `https://danmoo1--shopjoy-ecfefonuxt4.netlify.app` (운영 URL 과 별개, NAS 컨테이너는 아직 없음)

## 2. 실행 — `scripts/tenant.mjs`

package.json scripts 이름 = **`[명령]:[프로파일]:[모듈]`** (2026-10-03). 모듈 = ec1(SI260001) · ec2(SI260002) · danmoo1(SI260003) · homepg1(SI260004) · datavisual1(SI260005).

| 용도 | local | development | production |
|---|---|---|---|
| 개발서버 | `local:ec1` `local:ec2` `local:danmoo1` | `dev:ec1` `dev:ec2` `dev:danmoo1` | — |
| 빌드 | `build:local:ec1` `build:local:ec2` `build:local:danmoo1` | `build:dev:ec1` `build:dev:ec2` `build:dev:danmoo1` | `build:prod:ec1` `build:prod:ec2` `build:prod:danmoo1` |

- 모듈이 없는 `local` / `dev` / `build`(Netlify 운영이 쓰는 이름) / `preview` 는 ec1. `preview` 는 사이트·모듈을 주지 않으면 빌드된 값을 그대로 쓴다.
- 목록에 없는 조합은 직접 인자를 붙인다(사이트·모듈은 항상 함께):
```
npm run dev -- --site SI260002 --module ec2
npm run typecheck -- --site SI260003 --module danmoo1
pnpm run build --site SI260003 --module danmoo1    # pnpm 은 `--` 없이도 된다(pnpm 이 넘기는 `--` 는 tenant.mjs 가 건너뛴다)
```

실행기는 빌드 전에 다음을 확인한다. 1·3 이 어긋나면 중단하고, 2(사이트·모듈 짝)는 **2026-10-03 부터 경고만 하고 실행한다**(로컬·개발·운영 모두 — 사용자 요청 "일단 실행해주고").
1. 환경파일 `.env.<프로파일>` 이 있는가, `app/{pages,components,layout}/<모듈>/` 와 `app/conts/tenant/<모듈>.ts` 가 있는가
2. `--site` 가 사이트 ID 형식(SI260001)인가, 백엔드 `sy_site` 에 있고 ACTIVE 인가, 사이트의 FO 모듈(`sy_site.tenant_module`)이 `--module` 과 같은가 — 통과하면 `사이트코드 · 이름`을 출력해 눈으로 확인한다. 백엔드에 닿지 않으면 경고만 하고 진행한다. `--skip-site-check` 로 건너뛸 수 있다(typecheck 가 그렇게 한다).
3. 환경파일에 사이트·모듈·제목·테마색 키가 남아 있으면 무시한다고 경고한다(인자가 우선).

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
      ec1/, ec2/           ← 모듈별 레이아웃·헤더·푸터 (모듈 전용 TS 도우미도 여기: homepg1/hpUi.ts, datavisual1/dvUi.ts·dvChart.ts)
    assets/
      ec1/, ec2/, danmoo1/ ← 모듈별 전역 스타일 (쇼핑몰 테마 scss/ + theme-dark.css 사본, 2026-10-03)
      homepg1/, datavisual1/ ← 모듈별 전역 스타일 style.css (+ 이미지)
      prod/                ← 공통: 이미지·아이콘 폰트(Font Awesome) — /cdn/prod/… 주소로 서빙, DB 데이터가 이 주소를 쓴다
    error.vue, app.vue     ← 공통 껍데기: 오류 화면·확인/알림 창은 #tenant-components 로 "이 빌드의 모듈" 것을 연결만 한다
    conts/tenant/
      ec1.ts, ec2.ts …     ← 모듈 설정: 이름·메뉴·기능 스위치·전역 스타일 목록(css) (TenantConfigType)
    plugins/ utils/ store/ svc/ composables/ types/ conts/   ← 공통: 토스트(vue3-toastify)·유틸·스토어·API 호출·타입
  scripts/tenant.mjs       ← 테넌트 실행기
```

### 규칙
- **화면·컴포넌트·레이아웃은 모듈마다 전부 독립이다.** `app/pages`, `app/components`, `app/layout` 바로 아래에는 파일을 두지 않고 반드시 `<모듈>/` 안에 둔다. 한 모듈을 고쳐도 다른 모듈에는 영향이 없다 — 여러 모듈에 같이 반영할 수정은 각 모듈 폴더에 각각 한다. 로그인·오류 화면도 모듈별이다.
- **모듈 안에서는 자기 모듈 경로를 직접 적는다.** `app/pages/ec1/**`, `app/components/ec1/**`, `app/layout/ec1/**` 의 import 는 `~/components/ec1/…`, `~/layout/ec1/…` 이다. 다른 모듈 폴더를 import 하지 않는다.
- **공통 코드가 모듈 컴포넌트를 써야 할 때는 별칭을 쓴다.** `#tenant-components/…`(= `app/components/<이 빌드의 모듈>`), `#tenant-layout/…`. 예: `app/error.vue`, `app/app.vue`.
- **토스트·JS 유틸·스토어·svc·composables·types 는 공통이다.** 여기에는 모양(마크업·스타일)을 넣지 않는다.
- **전역 스타일도 모듈별이다(2026-10-03).** `app/assets/<모듈>/` 에 두고 모듈 설정의 `css` 목록(필수)으로 빌드에 넣는다 — nuxt.config 가 폴더·목록이 없으면 빌드를 멈춘다. 쇼핑몰 테마(.row·.card·body·h1 …)와 모양이 다른 모듈은 그 테마를 넣지 않는다. 앱 CSS 가 오기 전 부팅 화면 색(server/plugins/2.boot-loading-style.ts)도 모듈별로 고를 수 있다.
- **주소에 모듈 이름은 붙지 않는다.** `app/pages/ec1/blog.vue` 의 주소는 `/blog` 다(nuxt.config.ts 의 `pages:extend` 가 접두어를 뗀다). 컴포넌트 자동 등록 이름도 모듈 폴더 기준이다(`app/components/<모듈>` 만 등록 — 2026-10-03 로컬 전용 파일경로 배지 xdev 는 지웠다).
- **빌드에는 그 배포의 모듈 것만 들어간다.** ec1 빌드에 ec2 의 화면·컴포넌트·레이아웃·설정은 없고(주소도 없음), 반대도 같다.
- 빌드 로그의 `[Tenant] 화면 N개 = 공통 0 + ec1 전용 N (…)` 로 구성을 확인한다.

## 4. 새 사이트·모듈 추가 (예: site3 · ec3)
1. 백엔드 `sy_site` 에 사이트를 등록하고 `site_id` 를 확인한다.
2. 가까운 모듈의 폴더 세 개를 통째로 복사한다: `app/pages/ec1` → `ec3`, `app/components/ec1` → `ec3`, `app/layout/ec1` → `ec3`.
3. 복사한 폴더 안의 `~/components/ec1/`, `~/layout/ec1/` 를 `ec3` 으로 일괄 바꾼다. 필요 없는 화면은 지우고 달라지는 부분을 고친다.
4. `app/conts/tenant/ec3.ts`(id/name/menus/features/css)를 만든다. 스타일 폴더 `app/assets/ec3/` 도 만든다(쇼핑몰 테마면 `app/assets/ec1` 을 복사하고 css 목록의 경로를 ec3 으로).
5. `app/conts/tenant/ec3.ts` 에 `appTitle`/`themeColor` 를 넣는다(환경파일은 새로 만들지 않는다 — 프로파일별 `.env.*` 공용).
6. package.json scripts 에 `local:ec3` / `dev:ec3` / `build:local:ec3` / `build:dev:ec3` / `build:prod:ec3` 를 추가한다(`--site <그 site_id> --module ec3`).
7. `npm run local:ec3` 로 확인한다.

## 4-1. 모듈 danmoo1 — 당근 스타일 동네 중고거래 (2026-10-02)
휴대폰 당근 캡처를 기준으로 만든 세 번째 모듈. 쇼핑몰(ec1/ec2)과 소스를 공유하지 않고 `app/{pages,components,layout}/danmoo1` 에 독립이다(모달·ui·MapSwitch 만 ec2 에서 복사). 모바일 우선 반응형 — PC 에서는 가운데 최대 640px 앱 틀(`layout/danmoo1/Layout.vue` 의 `.dm-app` CSS 변수, 다크는 `html.theme-dark`).

| 주소 | 화면 | 데이터 |
|---|---|---|
| `/` | 홈 — 내 동네·동네 범위 ▾(localStorage) · 카테고리 칩 · 필터줄(정렬/가격대/거래 가능만) · 중고거래 피드(무한 스크롤, 동네·끌올·예약중/판매완료 표시) · 글쓰기 FAB | `/fo/ec/pd/prod/page`(sort/priceMin/priceMax), `/fo/ec/pd/category` 1단계 |
| `/search` | 최근 검색어(브라우저 저장)·추천 검색어·내 키워드 → 탭 **중고거래**(상품명 검색 + 필터줄) / **동네생활**(글 제목·내용 `searchValue`), 키워드 알림 등록 | `searchType=prodNm&searchValue`, `/fo/ec/cm/bltn/page?searchValue` |
| `/noti` | 활동 알림(마이페이지 알림 API, 읽음/삭제) / 새 글(등록한 키워드의 최신 물건) | `/fo/my/noti/*` |
| `/services` | 전체 서비스 메뉴 — 연결 안 된 것은 "준비 중" | 상수 `DM_SERVICES` |
| `/community`, `/community/:id` | 동네생활 글 목록(추천=최신·인기=조회수·주제 칩)·**공감(mb_like BLOG, 실제 저장)**·댓글 수 / 상세(공감·공유·**댓글 작성·내 댓글 삭제**) | 블로그 카테고리 `BC000000000000020`(cm_blog 는 site_id 가 없어 카테고리로만 가른다), `POST·DELETE /fo/ec/cm/bltn/{id}/reply`(ecBeBo FoCmBlogController, 2026-10-02 신설) |
| `/map` | 동네지도(MapSwitch, 동네 바꾸기) + 업체 카테고리 + 동네 가게(표시용 샘플) | 좌표 상수 `DM_TOWN_COORDS` |
| `/chat`, `/chat/:id` | 채팅 목록(전체/진행중/종료, 안 읽음 점)·채팅방(3초 폴링, **상단에 문의 중인 물건 카드**, 자주 쓰는 문구) — 회원끼리 직접 채팅 API 가 없어 **고객센터 채팅방**(회원당 1개, 운영자 응대). 상품 "채팅하기"·"가격 제안"은 상품 참조(refTypeCd PRODUCT) 메시지로 들어간다 | `/fo/my/chat/*` (`sendRefMsg`) |
| `/jobs`, `/realty` | 알바·부동산 — 바로가기/매물종류 칩, 상세 시트(지원·문의는 준비 중), 관심(localStorage). 백엔드 데이터 없음, 표시용 샘플 | 상수 |
| `/prod/:id` | 물건 상세 — 사진 스와이프(n/N)·판매자·상태·설명·**거래 희망 장소(지도)**·**판매자의 다른 물건**(같은 브랜드)·비슷한 물건(같은 카테고리), 하단 ♥·가격·**가격 제안**·채팅하기, 더보기(공유/링크 복사/신고) | `/fo/ec/pd/prod/{id}`, `/fo/ec/mb/like` |
| `/write` | 동네생활 글(주제 태그·블로그 등록) / 내 물건 팔기(판매자만: 사진 1장(AttachUploader PROD_IMG)·카테고리·판매/나눔·가격 제안 받기·창고·설명) | `POST /fo/ec/cm/bltn`, `POST /fo/ec/pd/my-prod` |
| `/my` | 나의 danmoo — 프로필·매너온도(고정 36.5)·요약(관심/채팅/쿠폰/판매)·머니(=적립금 잔액)·메뉴 | `/fo/ec/my/info`, `/fo/ec/mb/like`, `/fo/my/coupon`, `/fo/my/chat` |
| `/my/likes`, `/my/prods`, `/my/orders`, `/my/coupons`, `/my/posts`, `/my/settings` | 관심목록(2열, 해제)·판매내역(판매중/예약·중지/완료 탭)·구매내역(주문)·쿠폰함·모아보기(내가 쓴 글=regBy)·설정(동네·범위·다크 모드·키워드 관리·최근 기록 삭제·계정·앱 정보) | `/fo/ec/pd/my-prod`, `/fo/my/order/list`, `/fo/my/coupon/list`, 블로그 카테고리 글의 `regBy` |
| `/login`, `/signup` | 이메일 로그인 + 테스트 계정 모달(`?redirect=` 로 복귀) / **회원가입**(이름·이메일·비밀번호 정책·약관, 가입 사이트=이 배포의 사이트 → 가입 후 자동 로그인) | `/co/fo-auth/login`, `/co/fo-auth/join`(body.siteId, 2026-10-03 백엔드가 X-Site-Id 도 인정) |
| `/my/recent` | 최근 본 물건(localStorage 상품ID → 단건 조회, 최근 10개) | `/fo/ec/pd/prod/{id}` |

2026-10-03 보강: 판매내역 ⋯ 시트(예약중↔판매중 = `PUT my-prod` 상태, 끌어올리기 = 같은 내용 PUT 으로 updDate 갱신 → 홈 "끌올", 판매완료 = `DELETE my-prod`(ENDED), 수정 = `/write?type=prod&edit=`), 동네생활 내 글 ⋯(수정 `/write?type=community&edit=` = `PUT bltn`(카테고리·구분·조회수 그대로 돌려보냄), 삭제 = `DELETE bltn`), 채팅 사진 전송(`coUploadSvc.uploadMulti(…, "chat")` → `sendImage`), 하단 채팅 탭 안 읽음 수(60초 캐시), theme-color 메타. 테스트 판매자: `dm_user1` 을 ACTIVE 판매자+창고로 시드(`migration_20261003_seed_danmoo1_seller.sql`).

- 모듈 전용 상수(동네 목록·좌표·탭·서비스 메뉴·정렬·가격대·샘플)와 `townOf()`(상품ID 로 동네 고정 배정 — 상품에 동네 데이터가 없어 표시용), `dmStatusOf()`(예약중/판매완료)는 `app/conts/tenant/danmoo1.ts` 의 named export — 이 빌드에만 들어간다. 내 동네·범위·최근 검색·키워드 알림·알바/부동산 관심은 서버 저장이 아니라 localStorage(`dm.*`).
- 매너온도(36.5°C)·동네 가게·알바·부동산은 데이터가 없어 표시용이며 화면에 "샘플"로 적어 두었다. 회원끼리 1:1 채팅은 백엔드에 없어 고객센터 채팅방으로 대신한다.
- 시드: `p2604…/_doc/ddl_pgsql/migration_20261002_seed_danmoo1_site7.sql` — (최초) 사이트 7 `tenant_module=danmoo1` → 2026-10-03 사이트 3(`SI260003`, site3)으로 이전(sy_site.tenant_module 과 site_id/reg_site_id='…07' 데이터 전부 '…03' 으로; DB 이관은 별도 SQL 로 수동 실행), 카테고리 12(CAT07…), site1 상품 36건 복제(PDDM…, 가격 재산정), 테스트 회원 `dm_user1~5@danmoo.com`(비밀번호 1111), 동네생활 글 4건(BLDM…).
- 공통에 추가된 것: `utils/timeAgo.ts`(상대 시각·원화), `svc/fo/ec/mb/mbLikeSvc.ts`(찜 토글, PRODUCT/BLOG), `coBlogSvc.getPagedWith/create/createReply/deleteReply`, `mapBlog` 가 `viewCount/blogCateId/regBy/replies` 도 넘김, `myChatSvc.sendRefMsg`, `composables/useDmTown.ts`·`useAuthReady.ts`.
- **`useAuthReady()`**: 화면 onMounted 는 app.vue 의 로그인 복원(onMounted)보다 먼저 실행된다. 새로고침 직후 `authStore.isStLoggedIn` 으로 분기하는 화면은 initPage 첫 줄에서 `await useAuthReady()` 를 해야 한다(안 하면 "관심목록 없음"처럼 비로그인 결과가 나온다). 다른 모듈 화면에도 같은 규칙이 적용된다(ec1/ec2 는 useMyList.ensureLogin 이 비슷한 역할).

## 4-2. 모듈 homepg1 — 모두누리(MODUNURI) 회사 홈페이지 (2026-10-03, 사이트 SI260004)
원본 `C:\_pjt_github\p2604_modunuri_illeesam\homepage_v26\modunuri_v260329`(Vue CDN SPA, `api/base/site-config.json`)을 옮겼다. 회사 정보·메뉴·솔루션·상품·FAQ·블로그·구축 이력은 `app/conts/tenant/homepg1.ts` 상수(백엔드 데이터 없음). 스타일 `app/assets/homepg1/style.css`(라이트 기본 + `html[data-theme=dark]`, 저장 키 `modunuri-theme`). 배포: Netlify 별칭 `https://homepg1--shopjoy-ecfefonuxt4.netlify.app`.

| 주소 | 화면 |
|---|---|
| `/` | 히어로·실적·주요 제품(솔루션)·추천 상품(17·14·15)·상담 배너 |
| `/about`, `/solution` | 회사소개(창업 스토리·핵심 가치·구축사이트 36건·사업자등록증명 이미지·연락처) / 솔루션 6종(도입 문의 → 고객센터에 관심 서비스 미리 선택) |
| `/products`, `/products/:id` | 상품목록(카테고리 칩=판매중 수, 검색, 판매중 먼저, 6개씩 스크롤, `?cat=`) / 상세(데모·도입 문의·주문하기·공유, 사양, 같은 카테고리 관련 상품). 상단 "상품상세" 메뉴 = 마지막으로 본 상품 |
| `/order?pid=` | **주문하기** — 판매중 상품 선택·주문자 정보·계좌이체 안내 → ecBeBo 고객문의 접수(유형 `솔루션 주문`, 본문에 상품·가격·회사명·요청사항) → **접수번호(contactId)** 표시(입금 메모용) |
| `/contact?service=&pid=` | **고객센터(문의하기)** — 상담 양식 → ecBeBo 고객문의 접수(유형 `솔루션 상담`, 본문에 회사명·관심 서비스·문의 상품) → 접수번호 알림 |
| `/blog`, `/blog/:no`, `/faq`, `/location` | 블로그 6건(이전/다음 글) · FAQ · 위치(구글 지도 embed, 교통) |

- 문의·주문 접수는 `coContactSvc.submitReceipt` → `POST /api/fo/ec/cm/contact`(FoCmContactController, 비회원 허용). `sy_contact.reg_site_id` = SI260004, 담당자는 **ecFeBo BO 문의관리**에서 유형(category_cd) `솔루션 상담`/`솔루션 주문`으로 보고 답변한다. 접수 알림(메일·시스템)은 백엔드가 비동기로 보낸다.
- 원본에서 바꾼 점: 상품번호 17 중복(쇼핑을 즐거움 admin → 19), 상대경로 데모 주소 → 절대주소(쇼핑몰=운영 Nuxt FO, admin=ecFeBo BO, DataVisual=datavisual1 별칭, 나머지 홈페이지 데모=illeesam.netlify.app), 판매안함 상품(1~9)의 없는 데모 주소(demo.modunuri.kr) 제거 → 데모 버튼이 상담 신청 안내. 원본의 문의·주문은 저장되지 않았다(placeholder POST).

## 4-3. 모듈 datavisual1 — DataVisual 데이터 시각화 대시보드 (2026-10-03, 사이트 SI260005)
원본 `C:\_pjt_github\p2604_modunuri_illeesam\dataVisual_v26\datavisual_v260406`(Vue CDN + Chart.js 4)을 옮겼다. 차트 값은 화면에서 만든 예시(랜덤) — 백엔드 호출 없음. Chart.js 4 + `chartjs-adapter-date-fns`(시간축)는 이 모듈 위젯만 import 해서 다른 모듈 번들에는 없다. 스타일 `app/assets/datavisual1/style.css`(다크 기본, 저장 키 `dv-theme`). 배포: `https://datavisual1--shopjoy-ecfefonuxt4.netlify.app`.

| 주소 | 화면 |
|---|---|
| `/` | 대시보드 — 기간 선택 + DashboardPanel(KPI 4·라인·도넛·바·에어리어·게이지 2·데이터 테이블) |
| `/gallery` | 차트 갤러리 — 전체/통계/차트/데이터/실시간 탭, 위젯 13종 |
| `/realtime` | 실시간 — RealtimePanel(3초 KPI, 1초 시계열 산점도 3, 게이지 4) |
| `/panels?tab=` | 패널 보기 — 대시보드/분석/그리드(2컬럼·3컬럼·혼합·실시간 단일)/실시간 |
| `/manager`, `/layout` | 위젯 관리(종류별 추가·제거·설정, 바로 저장) / 레이아웃 편집(12칸 격자, 끌어 자리 바꾸기·W±H±·삭제·추가, [저장]) — 둘이 같은 배치(localStorage `dv_layout`)를 고친다 |

- 위젯 `app/components/datavisual1/widgets/*`(공통 틀 DvWidgetCard), 패널 `panels/DashboardPanel·RealtimePanel`(두 화면이 같이 씀 — 분석·그리드 패널은 패널 화면에 합침). 차트 공통 `app/layout/datavisual1/dvChart.ts`(`useDvChart`: 마운트 50ms 뒤 그리기·테마 바뀌면 색 다시 읽어 새로 그리기·떠날 때 지우기).
- 원본에서 바꾼 점: 차트 색에 CSS 변수 문자열('var(--text-muted)')을 넘겨 캔버스가 기본 회색으로 그리던 것 → 실제 색으로 바꿔 넘기고 테마 전환 시 다시 그림, 위젯 관리 변경이 저장되지 않던 것 → 레이아웃과 같은 배치에 저장, 히트맵 칸이 24보다 적을 때 시간 표기.

## 5. 백엔드(ecBeBo) 사이트 확정 — 적용됨 (2026-10-02)
- `/api/fo/**` 는 **사이트 필수**다. `X-Site-Id` 를 `sy_site`(ACTIVE)와 대조해 확정하고, 헤더가 없으면 로그인 토큰의 siteId 만 인정한다(둘 다 없으면 400). 없는 사이트는 400, 회원 토큰의 사이트와 헤더가 다르면 403.
- FO 조회는 요청 사이트로 한정된다(상품·카테고리·이벤트·기획전·전시·오프라인쿠폰 등). 다른 사이트의 상품은 "존재하지 않음"으로 응답한다. 기본 사이트로 조용히 대체하던 코드는 없앴다.
- 규칙은 `ecBeBo/CLAUDE.md` 의 "멀티테넌트 — FO 사이트(siteId) 필수 규칙" 참고.

## 5-1. 사이트 ↔ 모듈 매핑은 DB(sy_site.tenant_module)에도 둔다 (2026-10-02)
- BO 사이트관리(SySiteDtl)의 "FO 모듈" 필드. 실행 인자 `--module` 과 같아야 한다. `scripts/tenant.mjs` 는 다르면 경고만 하고 실행한다(2026-10-03).
- 회원(mb_member.site_id)·BO 사용자(sy_user.reg_site_id)의 "모듈"은 이 값을 사이트로 따라간다 — 임시로그인(테스트 회원/사용자 선택) 목록의 모듈 컬럼·필터가 이것이다(백엔드 SiteRegistry 가 캐시).
- 헤더 로고 아래에 이 배포의 `site <site_id> · <모듈>` 을 표시한다(useTenant).

## 5-2. 사이트·모듈 짝 확인 — 화면 (X) 표시 · 로그인 체크 토글 (2026-10-03)
- 모든 FO 요청에 `X-Site-Id`(사이트)와 함께 **`X-Module`**(이 배포의 모듈)을 보낸다(`plugins/beClient.ts`, 채팅 SSE 포함). ecFeBo 의 FO(foApiAxios)도 같다.
- 앱 시작 때(홈 포함) `plugins/siteModuleCheck.client.ts` 가 `GET /api/co/sy/site/{siteId}` 로 사이트의 FO 모듈을 대조한다(`composables/useSiteModuleCheck.ts`).
  맞지 않으면 **상단 로고(이름) 옆에 빨간 (X)** — 마우스를 올리면 "사이트(SI…)와 모듈(…)가 맞지 않습니다." + 사이트의 FO 모듈.
  위치: ec1·ec2 `HeaderLogo.vue`, homepg1·datavisual1 `Layout.vue` 로고, danmoo1 `DmTopBar.vue`(동네 이름 옆), bbm1 레이아웃.
- **"사이트 정상여부 체크" 토글**(기본 꺼짐, localStorage `modu-fo-site-check` = Y/N) — ec1·ec2 상단 ⚙ 설정, danmoo1 상단 맨 오른쪽 ⚙(설정 시트)·설정 화면,
  homepg1·datavisual1 상단 맨 오른쪽 ⚙ 드롭다운(다크 모드 포함), ecFeBo FO ⚙ 설정.
- **상단 오른쪽 공통 구성(2026-10-03, 사용자 "상단 제일 우측에 설정 … 알림아이콘 … 공통적으로 로그인버튼")**: `[로그인 | 이름·로그아웃] [🔔 알림] [⚙ 설정]`, ⚙ 가 맨 오른쪽.
  homepg1·datavisual1 은 로그인 화면(`/login`, 아이디·비밀번호 + 테스트 회원 모달, 길이 제한 없음)이 새로 생겼다. 알림은 `myNotiSvc`(목록 10건·안 읽은 수·읽음·모두 읽음).
  켜면 요청마다 `X-Site-Check: Y` 를 보내고, 백엔드(`SiteModuleGuard`)가 **로그인·소셜 로그인 때** 사이트의 FO 모듈과 `X-Module` 이 다르면 "사이트(…)와 모듈(…)가 맞지 않습니다." 로 거부한다.
  나중에 운영 FO 는 토글 없이 로그인 필터로 항상 확인하도록 바꿀 예정.

## 5-3. 개발 표시줄 — 사이트 바꿔 보기 (2026-10-03, 개발·로컬만)
- 실행모드가 운영(`prod`·`production`)이 아니면 `app.vue` 가 **왼쪽 위 작은 버튼**(fixed, 화면 흐름 밖)을 그린다(운영 빌드에는 없다).
  접힘 `DEV »` → 누르면 글자 폭만큼 `DEV 사이트 SI… ▾ 모듈 … ▾ 실행모드 dev|local «` 로 펼침, `«` 로 접기. 펼침 여부는 localStorage `modu-dev-bar-open`, 사이트를 바꿔 보는 중이면 접혀 있어도 빨간 점(2026-10-04 사용자 요청).
- 사이트·모듈을 누르면 아래에 바꾸는 칸이 열린다.
  - **사이트**: 사용 중 사이트 목록(`/api/co/sy/site`)에서 골라 [변경] → **로그아웃한 뒤 새로고침**. 고른 값은 쿠키 `modu-dev-site-<모듈>`(30일)에 두고
    `plugins/0.devSite.ts` 가 `useState("devSiteOverride")` 로 옮긴다 → `useTenant().siteId`·요청 헤더 `X-Site-Id`(브라우저)가 그 사이트를 쓴다.
    고른 사이트의 모듈이 이 빌드와 다르면 로고 옆 (X) 가 뜬다. [빌드 값으로] 로 되돌린다.
  - **모듈**: 빌드마다 고정(그 모듈 화면만 번들에 들어감)이라 바꿀 수 없다 → NAS 개발 배포(22001~22006, `utils/devSite.ts` 의 `DEV_MODULE_PORTS`)면
    그 모듈의 개발 주소로 `?devSite=<사이트>` 를 붙여 이동, 로컬은 `npm run local:<모듈>` 안내만.
- 서버 렌더(SEO 단위화면의 server/api)는 빌드 사이트로 조회한다 — 바꾼 사이트의 상세는 브라우저 전체 조회로 채워진다(개발 전용이라 감수).

## 5-4. 모듈 기본 테마 (2026-10-03)
- 모듈 설정 `defaultTheme: "light" | "dark"` — 사용자가 고른 적이 없으면(localStorage `theme` 없음) 이 값. danmoo1 = `dark`(사용자 "기본스킨 검정").
- 다크가 기본인 모듈은 nuxt.config `app.head.script` 가 첫 그리기 전에 `html.theme-dark` 를 붙인다(깜빡임 방지). 로딩 화면 색도 `server/plugins/2.boot-loading-style.ts` 에 모듈별로.

## 6. 남은 과제
- `site_id` 컬럼이 없는 테이블(블로그·FAQ·공지·브랜드·문의 등)은 모든 사이트가 같이 본다. 사이트별로 나누려면 컬럼 추가(DDL)와 데이터 이관이 먼저다.
- `/api/co/**`(로그인·회원가입·공통코드 등)는 아직 헤더가 선택이다. 회원가입·로그인이 요청 사이트를 따르게 하고 `app.site.required=true` 로 켜는 작업이 남았다.
- 이메일 인증 링크 기준 주소(`app.fo-base-url`) 등 사이트마다 달라지는 백엔드 설정은 사이트별 설정(예: `sy_site.config_json`)으로 옮겨야 한다.
- (해결 2026-10-03) 스타일은 `app/assets/<모듈>` 로 나눴다. ec1·ec2·danmoo1 은 같은 쇼핑몰 테마의 사본이라, 셋에 같이 반영할 수정은 각 폴더에 각각 한다.
