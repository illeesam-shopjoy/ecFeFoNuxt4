<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="상품 상세" subtitle="상품 상세" parent-title="상품 목록" parent-link="/shop" heading-tag="div" />

    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-product-detail v-if="pending" />

    <!-- 상품 상세 -->
    <template v-else-if="item">
      <section class="shop__area pb-[110px]">
        <!-- 2026-09-22(요청사항: "배너와 상품 이미지 사이 공백이 커 — 줄여줘") — 이 div 의 pt-60(60px)이 배너 바로 아래(.page__title + section) 이미
             줄여둔 여백 위에 또 더해져 폰에서 유난히 크게 벌어졌다. 폰에서만 더 줄인다. -->
        <div class="shop__top bg-white pt-[16px] pb-60 md:pt-[60px]">
          <div class="max-w-7xl mx-auto px-4">
            <div class="row">
              <div class="col-xl-6 col-lg-6">
                <!-- 2026-09-20(요청사항: 상품상세를 ecFeBo 처럼 개선) — 메인 이미지 확대 보기, 하단 가로 썸네일(기본이미지 뱃지), 라이트박스는 ProdGallery.
                     예전엔 세로 썸네일 스트립 + 고정 문구 "new / -16%" 였다. -->
                <prod-gallery :item="item" :color-opt-id="galleryColorId" />
              </div>
              <div class="col-xl-6 col-lg-6">
                <product-details-content ref="detailRef" :item="item" :style_2="true" detail @inquiry="scrollToSection('qna')" @color-change="galleryColorId = $event" />
              </div>
            </div>
          </div>
        </div>

        <div class="shop__bottom bg-white">
          <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — detail-tab-* 커스텀
               클래스를 Tailwind로 대체(JS ref="tabNavRef" 등 참조는 유지). -->
          <!-- 2026-09-14 버그수정(요청사항: "Top 을 가리면 안되고 / 원래 위치에 있던 정보가
               가려질때 고정되는거야") — Tailwind 유틸리티 클래스명 "sticky"가 _header.scss의
               사이트 헤더용 전역 규칙(.sticky { position: fixed !important; top:0; z-index:999 })과
               이름이 겹쳐서, position:sticky가 아니라 position:fixed로 강제 적용되며 항상
               최상단에 고정돼버렸다(스크롤 위치와 무관하게, 헤더까지 가리며). 클래스명이 아니라
               [position:sticky] 임의 속성 문법으로 바꿔 이름 충돌을 피함 — 진짜 position:sticky가
               적용되어 원래 위치가 뷰포트 상단(헤더 높이만큼 아래)에 닿을 때만 고정된다. -->
          <div class="[position:sticky] z-40 bg-white border-b-2 border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.06)] min-h-[52px]" ref="tabNavRef" :style="{ top: headerH + 'px' }">
            <div class="max-w-7xl mx-auto px-0 sm:px-4">
              <div class="flex justify-between sm:justify-center gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <!-- 2026-09-20(요청사항: 탭 강조) — 지금 보고 있는 섹션의 탭은 굵은 글씨 + 아래 밑줄 + 옅은 배경 -->
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  type="button"
                  :aria-current="activeTab === tab.id ? 'true' : undefined"
                  :class="[
                    'relative px-2 sm:px-7 py-4 text-[0.85rem] sm:text-base border-0 cursor-pointer transition-colors tracking-wide whitespace-nowrap after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:transition-colors',
                    activeTab === tab.id ? 'text-theme font-semibold bg-[#fbf6ee] after:bg-current' : 'font-medium bg-transparent text-gray-500 hover:text-gray-700 after:bg-transparent',
                  ]"
                  @click="scrollToSection(tab.id)"
                >{{ tab.label }}<span v-if="tab.count != null" class="ml-1 sm:ml-1.5 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-px text-[0.72rem] font-bold leading-[1.3]" :class="activeTab === tab.id ? 'bg-theme text-white' : tab.count > 0 ? 'bg-[#e8587a] text-white' : 'bg-[#e5e7eb] text-gray-500'">{{ tab.count }}</span></button>
              </div>
            </div>
          </div>

          <div class="max-w-7xl mx-auto px-4">
            <!-- 상세정보 섹션 (2026-09-20: 상품설명 + 세탁 및 관리. 예전 "추가 정보"의 무게/치수/사이즈는 상품과 무관한 고정값이라 제거) -->
            <div ref="secDetail" id="sec-detail" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">상세정보</h2>
              <div class="mb-3.5 rounded-xl border border-[#e5e7eb] bg-white p-5 sm:p-7">
                <h3 class="mb-3.5 flex items-center gap-2 text-[0.95rem] font-bold text-gray-900"><span aria-hidden="true">📋</span> 상품 설명</h3>
                <!-- ecBeBo contentHtml 은 단일 HTML 블록. 서버 렌더(SEO 최소 정보)에는 비어 있고 브라우저가 전체 조회한 뒤 채워진다 -->
                <div v-if="item.contentHtml" class="product__details-des" v-html="item.contentHtml"></div>
                <p v-else-if="item.smDesc" class="text-[0.9rem] leading-[1.9] text-gray-600">{{ item.smDesc }}</p>
              </div>
              <div class="rounded-xl border border-[#e5e7eb] bg-white p-5 sm:p-7">
                <h3 class="mb-3.5 flex items-center gap-2 text-[0.95rem] font-bold text-gray-900"><span aria-hidden="true">🧺</span> 세탁 및 관리</h3>
                <ul class="m-0 flex list-none flex-col gap-3 p-0">
                  <li v-for="c in careItems" :key="c.label" class="flex items-start gap-3">
                    <span class="w-6 shrink-0 text-center text-lg" aria-hidden="true">{{ c.icon }}</span>
                    <span>
                      <span class="block text-[0.76rem] text-[#9ca3af]">{{ c.label }}</span>
                      <span class="block text-[0.9rem] text-gray-800">{{ c.value }}</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 리뷰 섹션 -->
            <div ref="secReview" id="sec-review" class="pt-14 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px] last:border-b-0">
              <div class="product__details-review">
                <div class="postbox__comments">
                  <!-- 제목: 리뷰(N)만 한 줄에 배치 -->
                  <div class="block mb-20">
                    <h3 class="m-0 text-[1.35rem] font-bold text-gray-900 pb-3 border-b-2 border-[#e5e7eb]">상품평 <span class="ml-2 inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-px align-middle text-[0.8rem] font-bold leading-[1.4]" :class="totalReviewCount > 0 ? 'bg-[#e8587a] text-white' : 'bg-[#e5e7eb] text-gray-500'">{{ totalReviewCount }}</span></h3>
                  </div>
                  <!-- 2026-09-22(요청사항: "모아보기시 해당줄에 이미지, 동영상 목록 나열해주고 한줄에 안들어가는 나머지는 ...으로,
                       모아보기 버튼은 제일 우측면에") — 텍스트 대신 실제 썸네일을 한 줄로 나열하고, DOM 측정 없이(성능) 고정
                       개수만 보여준 뒤 넘치면 "…"만 붙인다. 버튼은 ml-auto로 항상 줄 맨 끝에 붙는다. -->
                  <div v-if="totalAttachmentCount > 0" class="flex flex-nowrap items-center gap-2 mb-20">
                    <div class="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
                      <button
                        v-for="(f, i) in shownAttachments"
                        :key="f.url"
                        type="button"
                        class="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded border border-gray-200 bg-gray-100 p-0"
                        @click="openAllMedia(i)"
                      >
                        <img v-if="f.thumb" :src="f.thumb" alt="" class="h-full w-full object-cover" />
                        <span v-else class="flex h-full w-full items-center justify-center bg-gray-600"></span>
                        <span v-if="isVideoUrl(f.url)" class="absolute inset-0 flex items-center justify-center bg-black/25"><i class="fa fa-play text-[10px] text-white"></i></span>
                      </button>
                      <span v-if="totalAttachmentCount > shownAttachments.length" class="shrink-0 text-sm tracking-widest text-gray-400">…</span>
                    </div>
                    <button type="button" class="os-btn os-btn-black ml-auto shrink-0 whitespace-nowrap !text-sm !px-3 !py-1 !h-auto" @click="openAllMedia(0)">모아보기</button>
                  </div>
                  <!-- 2026-09-20: 평점 요약(평균 + 별점 분포)과 정렬 — ecFeBo 상품평 -->
                  <div v-if="reviewList.length" class="mb-5 flex flex-wrap items-center gap-8 rounded-xl border border-[#e5e7eb] bg-white p-6">
                    <div class="text-center">
                      <div class="text-[2.6rem] font-black leading-none text-gray-900">{{ avgRating.toFixed(1) }}</div>
                      <div class="mt-1 text-[#f5a623]"><i v-for="st in 5" :key="st" :class="st <= Math.round(avgRating) ? 'fas fa-star' : 'fal fa-star'"></i></div>
                      <div class="mt-1 text-[0.8rem] text-[#9ca3af]">{{ reviewList.length }}개 상품평</div>
                    </div>
                    <div class="flex min-w-[200px] flex-1 flex-col gap-1">
                      <div v-for="d in ratingDist" :key="d.star" class="flex items-center gap-2 text-[0.78rem] text-gray-600">
                        <span class="w-6 text-right">{{ d.star }}<i class="fas fa-star ml-0.5 text-[0.65rem] text-[#f5a623]"></i></span>
                        <div class="h-2 flex-1 overflow-hidden rounded bg-[#eee]"><div class="h-full bg-[#f5a623]" :style="{ width: d.pct + '%' }"></div></div>
                        <span class="w-9 text-right text-[#9ca3af]">{{ d.pct }}%</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="reviewList.length > 1" class="mb-5 flex flex-wrap gap-2">
                    <button
                      v-for="o in reviewSortOptions"
                      :key="o.id"
                      type="button"
                      :class="['cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.82rem] transition-colors', reviewSort === o.id ? 'border-[#222] bg-[#222] font-semibold text-white' : 'border-[#e5e7eb] bg-white text-gray-600 hover:border-[#999]']"
                      @click="reviewSort = o.id"
                    >{{ o.label }}</button>
                  </div>
                  <div class="latest-comments mb-30">
                    <ul>
                      <template v-for="review in sortedReviews" :key="review.reviewId">
                        <li>
                          <!-- 2026-09-22(요청사항: "상품평 글이 찌그러져 보여 — 좌측에 빈 공백, 별표도 2줄") — 첨부 썸네일이 있으면 그 열(최대 5장 × 48px)이
                               고정폭을 차지하는데, min-w-0인 가운데 열이 그걸 위해 계속 줄어들다 90px까지 짜부라져서 이름·버튼·별점이 한 글자씩 줄바꿈됐다.
                               flex-wrap을 켜고 가운데 열에 실질적인 min-width를 줘서, 자리가 부족하면 첨부열이 통째로 다음 줄로 내려가게 한다(짜부라지지 않음). -->
                          <div class="flex flex-wrap items-start gap-4">
                            <div class="comments-avatar shrink-0">
                              <app-image :src="review.img" :alt="review.writerNm" :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }" :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }" />
                            </div>
                            <div class="min-w-[200px] flex-1">
                              <div class="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <h5 class="m-0">{{ review.writerNm }}</h5>
                                <span class="inline-flex flex-wrap gap-2">
                                  <button v-if="isLoggedIn" type="button" class="whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] text-inherit hover:opacity-85" @click.prevent="startReply(review.reviewId)">답글 쓰기</button>
                                  <button v-if="canModifyReview(review)" type="button" class="whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] text-inherit hover:opacity-85" @click.prevent="startEditReview(review)">수정</button>
                                  <button v-if="canModifyReview(review)" type="button" class="whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] text-danger hover:opacity-85" @click.prevent="deleteReview(review.reviewId, false, !review.memberId)">삭제</button>
                                </span>
                              </div>
                              <div class="mb-1 flex items-center gap-0.5 text-[0.9rem]">
                                <i v-for="s in 5" :key="s" class="text-[#f5a623]" :class="s <= review.rating ? 'fas fa-star' : 'fal fa-star'"></i>
                              </div>
                              <div v-if="!isAutoTitle(review.reviewTitle, review.reviewContent)" class="mb-1 text-[0.95rem] font-bold text-gray-900">{{ review.reviewTitle }}</div>
                              <client-only><div class="he-view" v-html="toSafeHtml(review.reviewContent) || '내용 없음'"></div></client-only>
                              <ul v-if="otherFilesOf(review).length" class="m-0 mt-2 flex list-none flex-col gap-1 p-0">
                                <li v-for="f in otherFilesOf(review)" :key="f.attachId" class="text-[0.8rem]">
                                  <a :href="f.cdnImgUrl" target="_blank" rel="noopener" :download="f.fileNm" class="text-[#2563eb] hover:underline"><i class="far fa-file mr-1"></i>{{ f.fileNm }}</a>
                                </li>
                              </ul>
                            </div>
                            <div v-if="mediaFilesOf(review).length > 0" class="ml-[76px] flex w-full flex-col items-start sm:ml-0 sm:w-auto sm:shrink-0 sm:items-end">
                              <div class="flex flex-wrap gap-1.5 sm:justify-end">
                                <template v-for="(f, i) in mediaFilesOf(review).slice(0, 5)" :key="f.url">
                                  <button type="button" class="relative w-12 h-12 rounded overflow-hidden border border-gray-200 p-0 cursor-pointer bg-gray-100 shrink-0 hover:opacity-90" @click="openMedia(mediaFilesOf(review), i)">
                                    <img v-if="f.thumb" :src="f.thumb" :alt="`첨부 ${i + 1}`" class="w-full h-full object-cover" />
                                    <span v-else class="w-full h-full flex items-center justify-center bg-gray-500"></span>
                                    <span v-if="isVideoUrl(f.url)" class="absolute inset-0 flex items-center justify-center bg-black/25"><i class="fa fa-play text-[11px] text-white"></i></span>
                                  </button>
                                </template>
                              </div>
                              <button
                                v-if="mediaFilesOf(review).length > 5"
                                type="button"
                                class="bg-transparent border-0 cursor-pointer text-sm text-gray-500 hover:underline mt-1"
                                @click="openMedia(mediaFilesOf(review), 5)"
                              >
                                외 {{ mediaFilesOf(review).length - 5 }}개
                              </button>
                            </div>
                          </div>
                        </li>
                        <li v-for="reply in (review.replies ?? [])" :key="reply.reviewId" class="children">
                          <div class="flex flex-wrap items-start gap-4">
                            <div class="comments-avatar shrink-0">
                              <app-image :src="reply.img" :alt="reply.writerNm" :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }" :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }" />
                            </div>
                            <div class="min-w-[160px] flex-1">
                              <div class="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <h5 class="m-0">{{ reply.writerNm }}</h5>
                                <button type="button" class="whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] text-danger hover:opacity-85" @click.prevent="deleteReview(reply.reviewId, true)">삭제</button>
                              </div>
                              <client-only><div class="he-view" v-html="toSafeHtml(reply.reviewContent)"></div></client-only>
                            </div>
                          </div>
                        </li>
                      </template>
                    </ul>
                  </div>
                </div>
                <div class="post-comments-form mb-100">
                  <div class="post-comments-title mb-30">
                    <h3>{{ replyingToReviewId ? '답글 쓰기' : editingReviewId ? '상품평 수정' : '상품평 쓰기' }}</h3>
                    <div v-if="!replyingToReviewId" class="post-rating">
                      <ul>
                        <li v-for="n in 5" :key="n">
                          <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[length:inherit] hover:opacity-85" :aria-label="`${n}점`" @click.prevent="setReviewRating(n)">
                            <i class="text-[#f5a623]" :class="n <= reviewRating ? 'fas fa-star' : 'fal fa-star'"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <!-- 2026-09-14(요청사항: "리뷰작성 에도 yup 적용해줘") — login/register/contact와
                       동일하게 vee-validate Form/Field/yup 스키마로 전환. 별점은 커스텀 UI라 yup
                       Field로 못 묶어 기존 방식(handleReviewSubmit 안의 수동 체크) 그대로 유지. -->
                  <Form id="contacts-form" ref="reviewFormRef" class="conatct-post-form" :validation-schema="reviewSchema" @submit="handleReviewSubmit">
                    <div class="row">
                      <!-- 2026-09-20: 로그인 안 한 사용자는 이름 + 글 비밀번호(수정·삭제용)를 입력해 작성한다 -->
                      <div v-if="!isLoggedIn && !replyingToReviewId && !editingReviewId" class="col-xl-12">
                        <div class="mb-3 grid gap-3 sm:grid-cols-2">
                          <label class="block">
                            <span class="mb-1 block text-[0.78rem] text-gray-500">이름<span class="ml-0.5 text-theme">*</span></span>
                            <input v-model="guestNm" type="text" maxlength="20" placeholder="이름 (2~20자)" class="!h-[34px] w-full rounded-md border border-[#e5e7eb] !px-[10px] !py-0 !text-[0.82rem] outline-none focus:border-[#bc8246]" :class="{ '!border-red-400': guestNmError }" @input="guestNmError = ''" />
                            <span v-if="guestNmError" class="mt-1 block text-[0.75rem] leading-snug text-red-500">{{ guestNmError }}</span>
                          </label>
                          <label class="block">
                            <span class="mb-1 block text-[0.78rem] text-gray-500">글 비밀번호<span class="ml-0.5 text-theme">*</span> <span class="text-gray-400">(수정·삭제할 때 필요)</span></span>
                            <input v-model="guestPwd" type="password" maxlength="20" autocomplete="new-password" placeholder="4~20자" class="!h-[34px] w-full rounded-md border border-[#e5e7eb] !px-[10px] !py-0 !text-[0.82rem] outline-none focus:border-[#bc8246]" :class="{ '!border-red-400': guestPwdError }" @input="guestPwdError = ''" />
                            <span v-if="guestPwdError" class="mt-1 block text-[0.75rem] leading-snug text-red-500">{{ guestPwdError }}</span>
                          </label>
                        </div>
                      </div>
                      <!-- 2026-09-22(요청사항: "제목만 2자 이상 필수, 내용은 필수 아니어도 됨") -->
                      <div v-if="!replyingToReviewId" class="col-xl-12 mb-3">
                        <label class="block">
                          <span class="mb-1 block text-[0.78rem] text-gray-500">제목<span class="ml-0.5 text-theme">*</span></span>
                          <input v-model="reviewTitleInput" type="text" maxlength="100" placeholder="제목 (2자 이상)" class="!h-[34px] w-full rounded-md border border-[#e5e7eb] !px-[10px] !py-0 !text-[0.82rem] outline-none focus:border-[#bc8246]" :class="{ '!border-red-400': reviewTitleError }" @input="reviewTitleError = ''" />
                          <span v-if="reviewTitleError" class="mt-1 block text-[0.75rem] leading-snug text-red-500">{{ reviewTitleError }}</span>
                        </label>
                      </div>
                      <div class="col-xl-12">
                        <div class="contact-icon relative contacts-message">
                          <Field name="comments" v-slot="{ value, handleChange }">
                            <html-editor id="comments" :model-value="(value as string) ?? ''" height="170px" placeholder="내용을 입력하세요 (선택 · 이미지는 붙여넣기/삽입 가능)" upload-code="REVIEW_CONTENT_IMG" @update:model-value="handleChange" />
                          </Field>
                          <ErrorMessage name="comments" class="text-danger" />
                        </div>
                      </div>
                      <!-- 첨부: 이미지·동영상(파일당 100MB)·문서 등 여러 파일 한 번에 (답글은 첨부 없음) -->
                      <div v-if="!replyingToReviewId" class="col-xl-12 mb-3">
                        <attach-uploader v-model="reviewAttachChanges" :initial-files="editingReviewFiles" title="첨부파일" :show-grp="false" grp-code="REVIEW" :max-count="10" :accept="REVIEW_ATTACH_ACCEPT" />
                      </div>
                      <div v-if="reviewFormError" class="col-xl-12 mb-3 text-[0.82rem] leading-snug text-red-500">{{ reviewFormError }}</div>
                      <!-- 2026-09-14(요청사항: "리뷰등록 가운데 정렬해줘") -->
                      <div class="col-xl-12 text-center">
                        <button v-if="editingReviewId || replyingToReviewId" class="os-btn mr-2 !h-auto !px-[22px] !py-[9px] !text-[13px] !leading-tight" type="button" @click="cancelReviewForm">취소</button>
                        <!-- 2026-09-22(요청사항: "수정저장을 저장으로, 버튼 색은 검정(담기 버튼과 같은 색) 말고 다른 색으로") -->
                        <button class="os-btn !h-auto !px-[22px] !py-[9px] !text-[13px] !leading-tight !text-white" style="background: linear-gradient(135deg, #c9955f 0%, #a06a35 100%); border-color: #a06a35" type="submit" :disabled="reviewFormLoading">
                          {{ reviewFormLoading ? "저장 중..." : (replyingToReviewId ? "답글 등록" : editingReviewId ? "저장" : "상품평 등록") }}
                        </button>
                      </div>
                    </div>
                  </Form>
                </div>
                <writer-pwd-modal ref="pwdModal" />
                <media-viewer-modal
                  :open="mediaViewerOpen"
                  :items="mediaViewerItems"
                  :initial-index="mediaViewerInitialIndex"
                  @close="mediaViewerOpen = false"
                />
              </div>
            </div>

            <!-- Q&A 섹션 (2026-09-20) -->
            <div ref="secQna" id="sec-qna" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">Q&amp;A <span class="ml-2 inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-px align-middle text-[0.8rem] font-bold leading-[1.4]" :class="qnaCount > 0 ? 'bg-[#e8587a] text-white' : 'bg-[#e5e7eb] text-gray-500'">{{ qnaCount }}</span></h2>
              <prod-qna :prod-id="item.prodId" @count="qnaCount = $event" />
            </div>

            <!-- 사이즈 섹션 -->
            <div ref="secSize" id="sec-size" class="pt-12 pb-10 border-b border-[#f0f0f0] scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">사이즈</h2>
              <prod-size-guide />
            </div>

            <!-- 스타일 섹션 (2026-09-20) -->
            <div ref="secStyle" id="sec-style" class="pt-12 pb-10 scroll-mt-[120px]">
              <h2 class="text-[1.35rem] font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#e5e7eb]">스타일</h2>
              <prod-style-rec />
            </div>
          </div>
        </div>
      </section>

      <!-- 하단 고정 구매바: 본문 구매 버튼이 화면 위로 지나가면 나타난다 (2026-09-20) -->
      <prod-buy-bar :item="item" :show="showBuyBar" @cart="detailRef?.addToCart()" @buy="detailRef?.buyNow()" />

      <!-- 관련 상품 -->
      <section class="related__product pb-60">
        <div class="max-w-7xl mx-auto px-4">
          <div class="row">
            <div class="col-xl-12">
              <div class="section__title-wrapper text-center mb-55">
                <div class="section__title mb-10">
                  <h2>관련 상품</h2>
                </div>
                <div class="section__sub-title">
                  <p>함께 보면 좋은 상품을 만나보세요.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div v-for="(prdItem, i) in relatedProducts" :key="i" class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <product-item :item="prdItem" />
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- 상품 없음 fallback -->
    <div v-else class="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">상품을 찾을 수 없습니다.</div>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import SkeletonProductDetail from "~/components/ui/SkeletonProductDetail.vue";
import { type PdProdType } from "~/types/pd/pdProdType";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import ProductDetailsContent from "~/components/shop-details/ProductDetailsContent.vue";
import ProdGallery from "~/components/prod-detail/ProdGallery.vue";
import ProdBuyBar from "~/components/prod-detail/ProdBuyBar.vue";
import ProdSizeGuide from "~/components/prod-detail/ProdSizeGuide.vue";
import ProdStyleRec from "~/components/prod-detail/ProdStyleRec.vue";
import ProdQna from "~/components/prod-detail/ProdQna.vue";
import ProductItem from "~/components/products/ProductItem.vue";
import AppImage from "~/components/ui/AppImage.vue";
import MediaViewerModal from "~/components/modals/MediaViewerModal.vue";
import { pdReviewSvc } from "~/svc/fo/ec/pd/pdReviewSvc";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";
import { useAuthStore } from "~/store/useAuthStore";
import AttachUploader from "~/components/ui/AttachUploader.vue";
import HtmlEditor from "~/components/ui/HtmlEditor.vue";
import { htmlToText, toSafeHtml } from "~/utils/htmlSafe";
import WriterPwdModal from "~/components/modals/WriterPwdModal.vue";
import type { PdReviewType } from "~/types/pd/pdReviewType";
import type { SyAttachType } from "~/types/sy/syAttachType";
import { isImageExt, isVideoExt } from "~/utils/mapProduct";
import { Field, Form, ErrorMessage, type GenericObject } from "vee-validate";
import * as yup from "yup";

const route = useRoute();
const id = route.params.id as string;
// ecBeBo prodId는 문자열(예: "PR2607070656371295")이라 숫자 검증은 더 이상 의미가 없다 —
// 대신 URL에 점(.)이 들어간 경우(.css.map 등 정적 리소스 오요청)만 걸러낸다(2026-09 BFF 전환).
const isValidProdId = Boolean(id) && !id.includes(".");

// SEO 단위화면(useSeoDetail): 서버 렌더링은 SEO 용 최소 정보만(server/api), 화면이 뜬 뒤 브라우저가 ecBeBo 에서 전체 정보(리뷰·옵션·본문)를 직접 조회한다.
const { item, pending, refresh: refreshItem, seo } = await useSeoDetail<PdProdType>(
  `product-${id}`,
  isValidProdId ? `/api/fo/ec/pd/prod/${id}` : null,
  () => (isValidProdId ? pdProductSvc.getById(id) : Promise.resolve(null))
);

// 관련 상품 — 같은 카테고리 상품 4개만 별도 조회(전체 카탈로그 X). SEO 대상이 아니라 서버 렌더에서는 뺀다.
const { data: relatedList } = useAsyncData<PdProdType[]>(
  `related-${id}`,
  async () => {
    const categoryId = item.value?.category?.categoryId;
    if (!categoryId) return [];
    return (await pdProductSvc.getPaged({ pageNo: 1, pageSize: 5, categoryIds: [categoryId] })).items;
  },
  { default: () => [], lazy: true, server: false, watch: [() => item.value?.category?.categoryId] } // 클라이언트 내비게이션은 카테고리를 뒤늦게 알게 되므로 바뀌면 재조회
);
const relatedProducts = computed(() => relatedList.value.filter((p) => p.prodId !== item.value?.prodId).slice(0, 4));

import { usePageTitle } from "~/composables/usePageTitle";
import { useGa } from "~/composables/useGa";
useSeoMeta({
  title: () => (item.value ? `${item.value.prodNm} | Outstock` : "상품 상세"),
  ogTitle: () => item.value?.prodNm ?? "상품 상세",
  description: () => item.value?.smDesc,
  ogDescription: () => item.value?.smDesc,
  ogImage: () => item.value?.img,
});
// 상품 구조화 데이터(JSON-LD) — 검색결과에 가격/재고/평점이 노출될 수 있게(2026-09 SEO 보강).
useHead(() => ({
  link: item.value ? [{ rel: "canonical", href: `https://shopjoy-ecfefonuxt4.netlify.app/prod-dtl/${id}` }] : [],
  script: item.value
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: item.value.prodNm,
            description: item.value.smDesc,
            image: item.value.img ? [item.value.img] : undefined,
            brand: item.value.brand?.brandNm ? { "@type": "Brand", name: item.value.brand.brandNm } : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "KRW",
              price: item.value.salePrice,
              availability: item.value.prodStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `https://shopjoy-ecfefonuxt4.netlify.app/prod-dtl/${id}`,
            },
            ...(item.value.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: item.value.rating, reviewCount: item.value.reviews?.length ?? 1 } } : {}),
          }),
        },
      ]
    : [],
}));
usePageTitle("상품 상세");
if (seo.value) useCdnCache(300); // 서버 렌더 결과(SEO 정보 있음)만 Netlify CDN 5분 캐시 — 변하는 데이터(상품평 등)는 SSR 에 없어 안전, 오류/빈 페이지는 캐시 안 함

// GA4: 상세 조회 데이터 기준으로 page_view 전송
const { sendPageView } = useGa();
watch(
  item,
  (v) => {
    if (v?.prodNm) sendPageView(`${v.prodNm} | Outstock`);
  },
  { immediate: true }
);

// ── 탭 & 섹션 스크롤 ─────────────────────────────────────────────
// 2026-09-20(요청사항: 상품상세를 ecFeBo 처럼) — 탭: 상세정보 / 상품평 / Q&A / 사이즈 / 스타일 (2026-09-22 순서 변경 — 화면의 섹션 순서도 같다)
type TabId = "detail" | "size" | "review" | "qna" | "style";
const qnaCount = ref(0);
const tabs = computed(() => [
  { id: "detail" as TabId, label: "상세정보", count: null as number | null },
  { id: "review" as TabId, label: "상품평", count: totalReviewCount.value },
  { id: "qna" as TabId, label: "Q&A", count: qnaCount.value },
  { id: "size" as TabId, label: "사이즈", count: null as number | null },
  { id: "style" as TabId, label: "스타일", count: null as number | null },
]);

// 세탁 및 관리 — 백엔드에 상품별 데이터가 없어 ecFeBo 와 같은 공통 안내문(고정값)
const careItems = [
  { icon: "💧", label: "세탁 방법", value: "찬물 손세탁 또는 세탁기 약세탁 권장" },
  { icon: "🌡️", label: "건조 방법", value: "그늘에서 자연 건조 (드라이기 금지)" },
  { icon: "👕", label: "다림질", value: "낮은 온도로 뒤집어 다림질" },
  { icon: "🚫", label: "주의사항", value: "표백제 사용 금지, 드라이클리닝 권장 안함" },
];

const activeTab = ref<TabId>("detail");
const tabNavRef = ref<HTMLElement | null>(null);
const secDetail = ref<HTMLElement | null>(null);
const secSize = ref<HTMLElement | null>(null);
const secReview = ref<HTMLElement | null>(null);
const secQna = ref<HTMLElement | null>(null);
const secStyle = ref<HTMLElement | null>(null);
// 2026-09-14 버그수정(요청사항: "F5 refresh 하면 상품설명/추가정보/리뷰 바가 최상단에 보였다가
// 사라지는데 이러면 안되") — SSR/하이드레이션 직후 onMounted가 실제 헤더 높이를 측정하기
// 전까지는 이 값이 0이라 잠깐 top:0px로 렌더돼(=진짜 페이지 맨 위) 눈에 띄게 깜빡였다.
// 헤더의 대략적인 실제 높이(로고+환경배지 2줄+패딩)로 기본값을 잡아 그 순간에도 자연스럽게
// 보이도록 하고, onMounted에서 정확한 값으로 즉시 보정한다.
const headerH = ref(90);

function sectionEl(id: TabId): HTMLElement | null {
  return { detail: secDetail.value, size: secSize.value, review: secReview.value, qna: secQna.value, style: secStyle.value }[id];
}

function scrollToSection(id: TabId) {
  activeTab.value = id;
  const el = sectionEl(id);
  if (!el) return;
  const navH = tabNavRef.value?.offsetHeight ?? 52;
  const total = headerH.value + navH + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - total;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

// 활성 탭 — 스크롤 위치 기준: 고정 탭바 바로 아래(기준선)를 지나간 마지막 섹션이 "지금 보고 있는 섹션"이다.
// (예전 IntersectionObserver 는 화면 20~35% 띠를 지나는 섹션만 잡아 짧은 섹션(Q&A/스타일)을 건너뛰거나 못 잡았다.)
const TAB_ORDER: TabId[] = ["detail", "review", "qna", "size", "style"];
function updateActiveTab() {
  const anchor = headerH.value + (tabNavRef.value?.offsetHeight ?? 52) + 24;
  let current: TabId = "detail";
  for (const id of TAB_ORDER) {
    const el = sectionEl(id);
    if (el && el.getBoundingClientRect().top <= anchor) current = id;
  }
  // 페이지 맨 아래까지 내려가면(뒤에 관련 상품만 남음) 마지막 섹션을 활성으로
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "style";
  activeTab.value = current;
}

// 하단 고정 구매바 — 본문 구매 버튼 영역이 헤더 아래로 완전히 지나가면 나타난다
const detailRef = ref<InstanceType<typeof ProductDetailsContent> | null>(null);
const showBuyBar = ref(false);
let scrollRaf = 0;
function updateBuyBar() {
  scrollRaf = 0;
  updateActiveTab();
  const buyEl = detailRef.value?.getBuyEl?.();
  showBuyBar.value = buyEl ? buyEl.getBoundingClientRect().bottom < headerH.value : false;
}
function onScroll() {
  if (!scrollRaf) scrollRaf = requestAnimationFrame(updateBuyBar);
}

let headerObserver: ResizeObserver | null = null;
onMounted(() => {
  // 고정 헤더 높이 추적
  const headerEl = document.getElementById("header-sticky");
  if (headerEl) {
    headerH.value = headerEl.offsetHeight;
    headerObserver = new ResizeObserver(() => {
      headerH.value = headerEl.offsetHeight;
    });
    headerObserver.observe(headerEl);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => {
  headerObserver?.disconnect();
  window.removeEventListener("scroll", onScroll);
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
});

// ── 리뷰 (옛 ProductDetailsReview) ─────────────────────────────
const VIDEO_EXT = new Set(["mp4", "webm", "mov"]);
function isVideoUrl(url: string): boolean {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXT.has(ext);
}

const totalReviewCount = computed(() => {
  const list = item.value?.reviews ?? [];
  return list.reduce((sum, r) => sum + 1 + (r.replies?.length ?? 0), 0);
});

// 평점 요약(평균 + 별점 분포)과 정렬 (2026-09-20) — 답글이 아닌 리뷰 본문만 대상
const reviewList = computed(() => item.value?.reviews ?? []);
const avgRating = computed(() => {
  const list = reviewList.value.filter((r) => r.rating > 0);
  return list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : Number(item.value?.rating) || 0;
});
const ratingDist = computed(() => {
  const total = reviewList.value.length || 1;
  return [5, 4, 3, 2, 1].map((star) => {
    const n = reviewList.value.filter((r) => Math.round(r.rating) === star).length;
    return { star, pct: Math.round((n / total) * 100) };
  });
});
const reviewSortOptions = [
  { id: "latest", label: "최신순" },
  { id: "high", label: "별점높은순" },
  { id: "low", label: "별점낮은순" },
] as const;
const reviewSort = ref<(typeof reviewSortOptions)[number]["id"]>("latest");
const sortedReviews = computed(() => {
  const list = [...reviewList.value];
  if (reviewSort.value === "high") return list.sort((a, b) => b.rating - a.rating || String(b.reviewDate).localeCompare(String(a.reviewDate)));
  if (reviewSort.value === "low") return list.sort((a, b) => a.rating - b.rating || String(b.reviewDate).localeCompare(String(a.reviewDate)));
  return list.sort((a, b) => String(b.reviewDate).localeCompare(String(a.reviewDate)));
});

const allAttachmentsList = computed(() => {
  const list = item.value?.reviews ?? [];
  const out: { url: string; thumb?: string }[] = [];
  for (const r of list) {
    out.push(...mediaFilesOf(r));
  }
  return out;
});
const totalAttachmentCount = computed(() => allAttachmentsList.value.length);
// 헤더 줄에 미리보기로 보여줄 개수 — DOM 폭 측정 없이 고정 개수만(성능), 넘치면 "…"만 표시
const ATTACH_PREVIEW_COUNT = 8;
const shownAttachments = computed(() => allAttachmentsList.value.slice(0, ATTACH_PREVIEW_COUNT));

const mediaViewerOpen = ref(false);
const mediaViewerItems = ref<{ url: string; thumb?: string }[]>([]);
const mediaViewerInitialIndex = ref(0);

function openMedia(items: { url: string; thumb?: string }[], index: number) {
  mediaViewerItems.value = items;
  mediaViewerInitialIndex.value = index;
  mediaViewerOpen.value = true;
}
function openAllMedia(index = 0) {
  mediaViewerItems.value = [...allAttachmentsList.value];
  mediaViewerInitialIndex.value = index;
  mediaViewerOpen.value = true;
}

const reviewRating = ref(0);
const galleryColorId = ref(""); // 선택한 색상 옵션ID — 갤러리가 그 색상 이미지를 먼저 보여준다
const replyingToReviewId = ref<string | null>(null);

// ── 작성자 판정 / 비회원 작성·수정 (2026-09-20: "상품평/Q&A 에 아무나 등록, 비로그인은 글 비밀번호로 수정·삭제") ──
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isStLoggedIn);
const myMemberId = computed(() => authStore.user?.memberId ?? "");
// 회원 글은 본인만, 비회원 글(memberId 없음)은 누구에게나 버튼을 보이고 글 비밀번호로 서버가 판정한다
const canModifyReview = (r: PdReviewType) => !r.memberId || (isLoggedIn.value && r.memberId === myMemberId.value);
const otherFilesOf = (r: PdReviewType) => (r.attachFiles ?? []).filter((f) => f.cdnImgUrl && !isImageExt(f.fileExt) && !isVideoExt(f.fileExt));
// 2026-09-22(요청사항: "동영상배경이미지로 썸네일이 표시되어야 해") — attachments(평평한 URL 목록)는 어떤 파일이 동영상인지만
// 구분할 뿐 그 동영상의 실제 프레임 썸네일(ecBeBo가 이미 ffmpeg로 만들어 thumbCdnUrl에 내려줌)은 버렸다. attachFiles(원본,
// thumbCdnUrl 포함)에서 다시 {url, thumb}쌍으로 만들어 실제 썸네일을 쓸 수 있게 한다.
const mediaFilesOf = (r: PdReviewType): { url: string; thumb?: string }[] =>
  (r.attachFiles ?? [])
    .filter((f) => f.cdnImgUrl && (isImageExt(f.fileExt) || isVideoExt(f.fileExt)))
    .map((f) => ({ url: f.cdnImgUrl as string, thumb: f.thumbCdnUrl || (isImageExt(f.fileExt) ? f.cdnImgUrl : undefined) }));
// 서버 허용 확장자(FileUploadUtil) 중 이미지·문서·압축·동영상 — 동영상은 파일당 100MB(AttachUploader 기본)
const REVIEW_ATTACH_ACCEPT = ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv", "flv"];
const guestNm = ref("");
const guestPwd = ref("");
const reviewTitleInput = ref(""); // 상품평 제목(선택)
const reviewAttachChanges = ref<SyAttachChangeType[]>([]);
const editingReviewId = ref<string | null>(null);
const editingReviewFiles = ref<SyAttachType[]>([]);
const reviewFormError = ref("");
const guestNmError = ref(""); // 이름/글 비밀번호 검증 오류는 각 입력란 아래에 보여준다
const guestPwdError = ref("");
const reviewFormRef = ref<{ setFieldValue: (name: string, v: string) => void; resetForm: () => void } | null>(null);
const pwdModal = ref<InstanceType<typeof WriterPwdModal> | null>(null);

function startEditReview(r: PdReviewType) {
  editingReviewId.value = r.reviewId;
  replyingToReviewId.value = null;
  reviewRating.value = r.rating;
  editingReviewFiles.value = r.attachFiles ?? [];
  reviewAttachChanges.value = [];
  reviewFormError.value = "";
  reviewTitleInput.value = isAutoTitle(r.reviewTitle, r.reviewContent) ? "" : (r.reviewTitle ?? "");
  reviewFormRef.value?.setFieldValue("comments", r.reviewContent ?? "");
  nextTick(() => document.getElementById("contacts-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
}
function cancelReviewForm() {
  editingReviewId.value = null;
  replyingToReviewId.value = null;
  editingReviewFiles.value = [];
  reviewAttachChanges.value = [];
  reviewFormError.value = "";
  reviewTitleInput.value = "";
  reviewFormRef.value?.resetForm();
}

/** 제목이 내용 앞부분으로 자동 생성된 것이면 목록에 따로 보여주지 않는다 */
const isAutoTitle = (title: string | undefined, content: string | undefined) => {
  const tt = (title ?? "").replace(/…$/, "").trim();
  return !tt || htmlToText(content).startsWith(tt);
};

function setReviewRating(n: number) {
  reviewRating.value = n;
}
function startReply(reviewId: string) {
  replyingToReviewId.value = reviewId;
}

const router = useRouter();
const { $toast } = useNuxtApp();

const deletingId = ref<string | null>(null);

// 리뷰(review)는 /api/fo/ec/pd/review/{id}, 답글(reply)은 /api/fo/ec/pd/review-comment/{id} —
// ecBeBo에서 둘이 서로 다른 컨트롤러라(PdReviewController vs PdReviewCommentController) 경로도 분리했다.
async function deleteReview(reviewId: string, isReply: boolean, guest = false) {
  const ok = await useConfirm().openConfirm({
    title: "삭제 확인",
    message: isReply ? "이 답글을 삭제할까요?" : "이 상품평을 삭제할까요? 달린 답글도 함께 삭제됩니다.",
    confirmText: "삭제",
    cancelText: "취소",
    variant: "danger",
  });
  if (!ok || deletingId.value !== null) return;
  let writerPwd: string | undefined;
  if (guest && !isReply) {
    const asked = await pwdModal.value?.ask("삭제하려면 글 비밀번호를 입력해 주세요.");
    if (asked === null || asked === undefined) return;
    writerPwd = asked;
  }
  deletingId.value = reviewId;
  try {
    const res = isReply ? await pdReviewSvc.deleteReviewComment(reviewId) : await pdReviewSvc.deleteReview(reviewId, writerPwd);
    if (res?.success) {
      $toast?.success?.(res.message ?? "삭제되었습니다.");
      await refreshItem(); // 새로고침 대신 최신 상품·상품평을 직접 재조회(SSR CDN 캐시 우회, 열린 탭 유지)
    }
  } catch (e: any) {
    const msg = String(e?.data?.message ?? e?.message ?? "삭제에 실패했습니다.").split("::")[0] ?? "";
    $toast?.error?.(msg);
  } finally {
    deletingId.value = null;
  }
}

// ── 리뷰/답글 등록 폼 (옛 ReviewForm) ─────────────────────────────
// 2026-09-14(요청사항: "리뷰작성 에도 yup 적용해줘") — login/register/contact와 동일한 스키마 방식.
// 2026-09-22(요청사항: "제목만 2자 이상 필수, 내용은 필수 아니어도 됨") — comments(내용)는 더 이상 필수가 아니다. 제목(reviewTitleInput)은
// vee-validate Field 로 안 묶인 일반 입력이라 이름/비밀번호와 같은 방식(reviewTitleError)으로 직접 검사한다(답글은 제목 없음, 검사 제외).
const reviewSchema = yup.object({
  comments: yup.string().label("내용"),
});
const reviewFormLoading = ref(false);
const reviewTitleError = ref("");

async function handleReviewSubmit(rawValues: GenericObject, { resetForm }: { resetForm: () => void }) {
  const values = rawValues as { comments: string }; // vee-validate 는 값 타입을 GenericObject 로만 알려줌
  const contentTrim = values.comments.trim();
  reviewFormError.value = "";
  guestNmError.value = "";
  guestPwdError.value = "";
  reviewTitleError.value = "";
  if (!replyingToReviewId.value && reviewTitleInput.value.trim().length < 2) {
    reviewTitleError.value = "제목을 2자 이상 입력해 주세요.";
    return;
  }
  if (!replyingToReviewId.value && (reviewRating.value < 0.5 || !item.value?.prodId)) {
    $toast?.error?.("별점을 선택해 주세요.");
    return;
  }
  const isGuestWrite = !isLoggedIn.value && !replyingToReviewId.value && !editingReviewId.value;
  if (isGuestWrite) {
    const nm = guestNm.value.trim();
    guestNmError.value = nm.length < 2 || nm.length > 20 ? "이름을 2~20자로 입력해 주세요." : "";
    guestPwdError.value = guestPwd.value.length < 4 || guestPwd.value.length > 20 ? "글 비밀번호를 4~20자로 입력해 주세요." : "";
    if (guestNmError.value || guestPwdError.value) return;
  }
  reviewFormLoading.value = true;
  try {
    if (replyingToReviewId.value) {
      const res = await pdReviewSvc.createReviewComment({ reviewId: replyingToReviewId.value, content: contentTrim });
      if (res?.success) {
        $toast?.success?.(res.message ?? "답글이 등록되었습니다.");
        resetForm();
        replyingToReviewId.value = null;
        await refreshItem(); // 새로고침 대신 최신 상품·상품평을 직접 재조회(SSR CDN 캐시 우회, 열린 탭 유지)
      }
    } else if (editingReviewId.value) {
      const target = (item.value?.reviews ?? []).find((r) => r.reviewId === editingReviewId.value);
      let writerPwd: string | undefined;
      if (target && !target.memberId) {
        const asked = await pwdModal.value?.ask("수정하려면 글 비밀번호를 입력해 주세요.");
        if (asked === null || asked === undefined) return;
        writerPwd = asked;
      }
      const res = await pdReviewSvc.updateReview(editingReviewId.value, { content: contentTrim, rating: reviewRating.value, reviewTitle: reviewTitleInput.value, writerPwd, attachFiles: reviewAttachChanges.value });
      if (res?.success) {
        $toast?.success?.(res.message ?? "수정되었습니다.");
        cancelReviewForm();
        await refreshItem();
      }
    } else if (item.value) {
      const res = await pdReviewSvc.createReview({
        prodId: item.value.prodId,
        content: contentTrim,
        rating: reviewRating.value,
        reviewTitle: reviewTitleInput.value,
        writerNm: isGuestWrite ? guestNm.value : undefined,
        writerPwd: isGuestWrite ? guestPwd.value : undefined,
        attachFiles: reviewAttachChanges.value,
      });
      if (res?.success) {
        $toast?.success?.(res.message ?? "상품평이 등록되었습니다.");
        resetForm();
        guestPwd.value = "";
        reviewTitleInput.value = "";
        reviewAttachChanges.value = [];
        reviewRating.value = 0;
        await refreshItem(); // 새로고침 대신 최신 상품·상품평을 직접 재조회(SSR CDN 캐시 우회, 열린 탭 유지)
      }
    }
  } catch (e: any) {
    const msg = String(e?.data?.message ?? e?.message ?? (replyingToReviewId.value ? "답글 등록에 실패했습니다." : "저장에 실패했습니다.")).split("::")[0] ?? "";
    reviewFormError.value = msg;
    $toast?.error?.(msg);
  } finally {
    reviewFormLoading.value = false;
  }
}
</script>

