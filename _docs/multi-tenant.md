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
- 모듈 = `--module <모듈>`(`app/{pages,components,layout}/[모듈]` + `app/conts/tenant/[모듈].ts`) → `NUXT_PUBLIC_TENANT_MODULE`.
- 사이트 = `--site <sy_site.site_id>` → `NUXT_PUBLIC_SITE_ID`. **`--site` 와 `--module` 은 항상 함께 준다**(하나만 주면 중단). 현재: ec1 → `2604010000000001`(site_code `SHOPJOY`), ec2 → `2604010000000002`(`site2`), danmoo1 → `2604010000000003`(`site3`, 2026-10-02 사이트 7 로 시작 → 10-03 사이트 3 으로 이전). 둘 다 생략하면 ec1 · `2604010000000001`.
- 앱 제목·테마색 = 모듈 설정 `app/conts/tenant/<모듈>.ts` 의 `appTitle` / `themeColor`(nuxt.config.ts 가 읽어 runtimeConfig·tailwind `theme` 색에 넣는다).
- 모든 API 요청에 `X-Site-Id: <사이트>` 헤더가 붙는다(브라우저 axios, SEO SSR → 백엔드 호출 모두).

### 배포 대응
- 개발(NAS) = `.env.development` + ec1 — `z0scripts/shopjoy-apps-dev/ecFeFoNuxt4/deploy.js` 가 `tenant.mjs build --site 2604010000000001 --module ec1 --profile development`
- 운영(Netlify) = `.env.production` + ec1 — GitHub Actions `netlify-deploy.yml` 이 `pnpm run build`
- danmoo1 미리보기(Netlify 별칭) = `.env.production` + danmoo1 — 같은 워크플로의 `deploy-danmoo1` 잡이 `pnpm run build -- --site 2604010000000003 --module danmoo1` 후 `netlify deploy --alias danmoo1` → `https://danmoo1--shopjoy-ecfefonuxt4.netlify.app` (운영 URL 과 별개, NAS 컨테이너는 아직 없음)

## 2. 실행 — `scripts/tenant.mjs`

package.json scripts 는 **프로파일만** 정한다(`local` / `dev` / `build` / `build:dev` / `build:local` / `preview` / `preview:dev` / `typecheck`). 사이트·모듈은 `--` 뒤에 붙인다.

```
npm run dev                                                # ec1 · 2604010000000001 · development (기본)
npm run dev -- --site 2604010000000002 --module ec2        # ec2
npm run build -- --site 2604010000000003 --module danmoo1  # danmoo1 production
npm run typecheck -- --site 2604010000000002 --module ec2
pnpm run build --site 2604010000000003 --module danmoo1    # pnpm 은 `--` 없이(워크플로가 이렇게 쓴다 — pnpm 은 `--` 를 인자로 그대로 넘기지만 tenant.mjs 가 건너뛴다)
```
예제 스크립트 `local:ec2` / `local:danmoo1` 도 있다.

실행기는 빌드 전에 다음을 확인한다. 하나라도 어긋나면 중단한다.
1. 환경파일 `.env.<프로파일>` 이 있는가, `app/{pages,components,layout}/<모듈>/` 와 `app/conts/tenant/<모듈>.ts` 가 있는가
2. `--site` 가 숫자 형식인가, 백엔드 `sy_site` 에 있고 ACTIVE 인가, 사이트의 FO 모듈(`sy_site.tenant_module`)이 `--module` 과 같은가 — 통과하면 `사이트코드 · 이름`을 출력해 눈으로 확인한다. 백엔드에 닿지 않으면 경고만 하고 진행한다. `--skip-site-check` 로 건너뛸 수 있다(typecheck 가 그렇게 한다).
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
      xdev/                ← 예외: 파일경로 배지(개발도구) 한 벌 — 모양이 아니라 도구라 모듈별 사본을 두지 않는다(nuxt.config components 에 함께 등록, 2026-10-02)
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
5. `app/conts/tenant/ec3.ts` 에 `appTitle`/`themeColor` 를 넣는다(환경파일·scripts 는 새로 만들지 않는다 — 프로파일별 `.env.*` 와 scripts 공용).
6. `npm run local -- --module ec3` 로 확인한다(사이트는 sy_site 의 FO 모듈로 찾는다).

## 4-1. 모듈 danmoo1 — 당근 스타일 동네 중고거래 (2026-10-02)
휴대폰 당근 캡처를 기준으로 만든 세 번째 모듈. 쇼핑몰(ec1/ec2)과 소스를 공유하지 않고 `app/{pages,components,layout}/danmoo1` 에 독립이다(모달·xdev·ui·MapSwitch 만 ec2 에서 복사). 모바일 우선 반응형 — PC 에서는 가운데 최대 640px 앱 틀(`layout/danmoo1/Layout.vue` 의 `.dm-app` CSS 변수, 다크는 `html.theme-dark`).

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
- 시드: `p2604…/_doc/ddl_pgsql/migration_20261002_seed_danmoo1_site7.sql` — (최초) 사이트 7 `tenant_module=danmoo1` → 2026-10-03 사이트 3(`2604010000000003`, site3)으로 이전(sy_site.tenant_module 과 site_id/reg_site_id='…07' 데이터 전부 '…03' 으로; DB 이관은 별도 SQL 로 수동 실행), 카테고리 12(CAT07…), site1 상품 36건 복제(PDDM…, 가격 재산정), 테스트 회원 `dm_user1~5@danmoo.com`(비밀번호 1111), 동네생활 글 4건(BLDM…).
- 공통에 추가된 것: `utils/timeAgo.ts`(상대 시각·원화), `svc/fo/ec/mb/mbLikeSvc.ts`(찜 토글, PRODUCT/BLOG), `coBlogSvc.getPagedWith/create/createReply/deleteReply`, `mapBlog` 가 `viewCount/blogCateId/regBy/replies` 도 넘김, `myChatSvc.sendRefMsg`, `composables/useDmTown.ts`·`useAuthReady.ts`.
- **`useAuthReady()`**: 화면 onMounted 는 app.vue 의 로그인 복원(onMounted)보다 먼저 실행된다. 새로고침 직후 `authStore.isStLoggedIn` 으로 분기하는 화면은 initPage 첫 줄에서 `await useAuthReady()` 를 해야 한다(안 하면 "관심목록 없음"처럼 비로그인 결과가 나온다). 다른 모듈 화면에도 같은 규칙이 적용된다(ec1/ec2 는 useMyList.ensureLogin 이 비슷한 역할).

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
