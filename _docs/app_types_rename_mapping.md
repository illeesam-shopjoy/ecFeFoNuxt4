# app/types 파일 이름 변경 매핑

아래는 `app/types/` 내 타입 파일의 이전 이름 → 새 이름 매핑입니다.
(접두사: mb=회원, sy=시스템, co=공통/콘텐츠, or=주문, pd=상품, dv=배송)

| 이전 파일명 | 새 파일명 |
|------------|----------|
| addrType.ts | mbAddrType.ts |
| authType.ts | syAuthType.ts |
| blogType.ts | coBlogType.ts |
| brandType.ts | coBrandType.ts |
| cartType.ts | orCartType.ts (→ orCartItemType.ts + orCartStateType.ts) |
| categoryTreeType.ts | coCategoryTreeType.ts |
| categoryType.ts | coCategoryType.ts |
| claimItemType.ts | orClaimItemType.ts |
| claimType.ts | orClaimType.ts |
| codeType.ts | syCodeType.ts |
| deliveryItemType.ts | dvDeliveryItemType.ts |
| deliveryType.ts | dvDeliveryType.ts |
| HeroSliderDataType.ts | coHeroSliderDataType.ts + coHeroSliderDataTypeTwo.ts + coHeroSliderDataTypeThree.ts |
| inquiryType.ts | coInquiryType.ts + coContactInfoItemType.ts |
| loginType.ts | syLoginType.ts (→ syLoginFormType.ts + syCheckoutLoginFormType.ts) |
| memberType.ts | mbMemberType.ts |
| menuTreeType.ts | syMenuTreeType.ts |
| optionType.ts | pdOptionType.ts |
| orderItemType.ts | orOrderItemType.ts |
| orderType.ts | orOrderType.ts |
| paymentType.ts | orPaymentType.ts |
| productType.ts | pdProductType.ts |
| reviewType.ts | pdReviewType.ts |
| userType.ts | syUserType.ts |
| wishlistType.ts | mbWishlistType.ts (→ mbWishlistItemType.ts + mbWishlistStateType.ts) |

**인터페이스 명 = 파일명 기준 PascalCase** (예: mbAddrType.ts → `MbAddrType`, pdProductType.ts → `PdProductType`).  
**파일당 인터페이스 1개**로 통일되어, 복합 타입은 아래처럼 분리됨.

| 추가된 파일 | 인터페이스 |
|------------|-----------|
| mbRegisterFormType.ts | MbRegisterFormType |
| mbWishlistItemType.ts | MbWishlistItemType (type alias of PdProductType) |
| mbWishlistStateType.ts | MbWishlistStateType |
| orCartItemType.ts | OrCartItemType |
| orCartStateType.ts | OrCartStateType |
| coContactInfoItemType.ts | CoContactInfoItemType |
| coInquiryType.ts | CoInquiryType |
| syLoginFormType.ts | SyLoginFormType |
| syCheckoutLoginFormType.ts | SyCheckoutLoginFormType |
| coHeroSliderDataTypeTwo.ts | CoHeroSliderDataTypeTwo |
| coHeroSliderDataTypeThree.ts | CoHeroSliderDataTypeThree |

삭제된 파일: orCartType.ts, mbWishlistType.ts, syLoginType.ts (위 분리 파일로 대체)

import 경로 예: `~/types/productType` → `~/types/pdProductType`, 타입명 `ProductType` → `PdProductType`

---

## 2026-09-20 2차 정리 — 백엔드 테이블/DTO 메타 기준으로 재정렬

타입명은 **연결된 백엔드 테이블명**(`pd_prod`, `pd_prod_sku` …)을 PascalCase로 옮긴 이름을 쓴다. 필드명은 ecBeBo DTO 필드를 그대로 쓰고, 백엔드에 없는 화면용 파생값은 `isXxx`/기존 이름을 유지한다.

| 이전 타입 / 파일 | 새 타입 / 파일 | 근거 테이블 |
|---|---|---|
| PdProductType (pdProductType.ts) | **PdProdType** (pdProdType.ts) | pd_prod |
| PdSkuType (pdProductType.ts 안) | **PdProdSkuType** (pdProdSkuType.ts, 파일 분리) | pd_prod_sku |
| PdOptionType (pdOptionType.ts) | **PdProdOptType** (pdProdOptType.ts) | pd_prod_opt |
| CoBlogType | **CmBlogType** (cmBlogType.ts) | cm_blog |
| CoBrandType | **SyBrandType** (syBrandType.ts) | sy_brand |
| CoCategoryType / CoCategoryTreeType | **PdCategoryType / PdCategoryTreeType** | pd_category |
| OrCartItemType | **OdCartItemType** (odCartItemType.ts) | od_cart |
| MbWishlistItemType | **MbLikeItemType** (mbLikeItemType.ts) | mb_like |
| SyCouponType | **PmCouponType** (pmCouponType.ts) | pm_coupon (※ 아직 API 없는 클라이언트 목업) |
| CoInquiryType | 삭제 (사용처 없음) | — |

### 필드 변경
- PdProdType: `optionSizes` → **`prodOpt1List`**, `optionColors` → **`prodOpt2List`**, `banner/trending/topRated` → **`isBanner/isTrending/isTopRated`**, `dimension` 삭제(백엔드 컬럼 없음·미사용).
  - ⚠ 백엔드 메타에서 `prodOpt1`=1단(보통 COLOR), `prodOpt2`=2단(보통 SIZE)인데 위 이름은 요청에 따라 1=사이즈, 2=컬러로 매핑돼 있다(분류는 `mapProduct.classifyOptionType` 이 옵션 유형 코드로 한다). 번호를 백엔드와 일치시키려면 두 이름을 맞바꾸고 소비처(ProductDetailsContent 등)의 색상/사이즈 UI 바인딩을 함께 바꿔야 한다.
- PdProdOptType: `optionId/optionCode/optionNm/optionType/optionLevel` → **`prodOptId/prodOptStdCd/prodOptNm/prodOptTypeCd/prodOptTypeLevel`** (PdProdOptDto 기준)
- PdReviewType: `title` → **`reviewTitle`** (PdReviewDto 기준)

### 손대지 않은 것 (테이블 매핑이 아닌 화면/위젯 전용 타입)
`coContactInfoItemType`, `coHeroSliderData*Type`(전시 위젯 JSON), `pmTimedealType`(dealXxx 파생), `mbMemberType`/`mbRegisterFormType`/`syLoginFormType`/`syCheckoutLoginFormType`(폼 입력값), `syCodeType`/`syMenuTreeType`(이미 테이블명과 일치), `chatTypes`, `foMyType`.

### 업무구분별 폴더 (2026-09-20)
`app/types/{업무접두사}/{파일}.ts` — import 는 `~/types/pd/pdProdType` 형태.

| 폴더 | 파일 |
|---|---|
| pd (상품) | pdProdType, pdProdSkuType, pdProdOptType, pdCategoryType, pdCategoryTreeType, pdReviewType |
| od (주문) | odCartItemType |
| mb (회원) | mbLikeItemType, mbMemberType, mbRegisterFormType |
| sy (시스템) | syBrandType, syCodeType, syMenuTreeType, syLoginFormType, syCheckoutLoginFormType |
| cm (콘텐츠) | cmBlogType |
| pm (프로모션) | pmCouponType, pmTimedealType |
| co (공통/전시 위젯) | coContactInfoItemType, coHeroSliderDataType(+Two/Three) |
| fo (FO 화면 공통) | foCompType, foMyType |
| (루트 유지) | chatTypes.ts, page.ts, image.d.ts, nuxt-app.d.ts — 접두사 규칙이 없거나 전역 선언 파일 |
