<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <!-- 2026-09-20(요청사항: "블로그 상세 배너 있어야 하지 않어?") — 다른 상세 화면처럼 상단 배너 + 홈 / 블로그 목록 / 블로그 상세 -->
    <breadcrumb-area title="블로그 상세" subtitle="블로그 상세" parent-title="블로그 목록" parent-link="/blog" heading-tag="div" />
    <!-- 스켈레톤: SSR/CSR 로딩 중 -->
    <skeleton-blog-detail v-if="pending" />

    <!-- 블로그 상세 -->
    <section v-else-if="item" class="blog__area pt-[16px] md:pt-[100px]">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-9 col-lg-8">
            <div class="postbox__title mb-55">
              <h1><a v-html="item.blogTitle"></a></h1>
              <div class="blog__meta">
                <span>작성자 <a href="#">{{ item.blogAuthor }}</a></span>
                <span>/ {{ item.regDate }}</span>
              </div>
            </div>

            <!-- 메인 썸네일: AppImage (스켈레톤 + noImage) -->
            <div class="postbox__thumb w-img mb-40">
              <app-image
                :src="item.img"
                alt="블로그 이미지"
                wrap-class="w-full"
                :skeleton-style="{ width: '100%', aspectRatio: '16/9' }"
              />
            </div>

            <!-- 본문: ecBeBo blogContent(에디터 HTML) — 브라우저에서 정화 후 렌더 -->
            <div class="postbox__wrapper mb-70">
              <client-only>
                <div v-if="item.blogContent" class="postbox__text he-view" v-html="toSafeHtml(item.blogContent)"></div>
              </client-only>
            </div>

            <div class="postbox__share mb-95">
              <div class="row">
                <div class="col-xl-6 col-lg-6 col-md-6">
                  <div class="postbox__social">
                    <span>친구에게 공유:</span>
                    <ul>
                      <li><a href="#" title="Facebook에 공유" @click.prevent="shareOnFacebook"><i class="fab fa-facebook-f"></i></a></li>
                      <li><a href="#" title="Twitter에 공유" @click.prevent="shareOnTwitter"><i class="fab fa-twitter"></i></a></li>
                      <li><a href="#" title="Pinterest에 공유" @click.prevent="shareOnPinterest"><i class="fab fa-dribbble"></i></a></li>
                      <li><a href="#" title="링크 복사 / 공유하기" @click.prevent="shareLink"><i class="fas fa-share-alt"></i></a></li>
                    </ul>
                  </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-6">
                  <div class="postbox__tag ml-auto">
                    <span>태그:</span>
                    <a href="#">가구,</a>
                    <a href="#">테마,</a>
                    <a href="#">의자,</a>
                    <a href="#">인테리어</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- 추천 글: API에서 로드된 블로그 목록 사용 -->
            <div class="postbox__related-title">
              <h3>추천 글</h3>
            </div>
            <div class="postbox__related-item">
              <div class="row">
                <!-- 로딩 중 스켈레톤 -->
                <template v-if="relatedPending">
                  <div v-for="n in 2" :key="n" class="col-xl-6 col-lg-6 col-md-6">
                    <skeleton-card />
                  </div>
                </template>
                <!-- 추천 글 목록 -->
                <div v-else v-for="(blog, i) in relatedBlogs" :key="i" class="col-xl-6 col-lg-6 col-md-6">
                  <blog-item :item="blog" :style_2="true" />
                </div>
              </div>
            </div>

            <!-- 2026-09-22(요청사항: "컨텐츠 영역과의 사이의 공백란이 너무 커 좀 줄여줘") — mt-65+pt-90(총 155px)이 겹쳐 모바일에서
                 공백이 과했다. 모바일은 16px로 줄이고 데스크톱 원래 값은 유지(다른 페이지와 동일 패턴). -->
            <div class="postbox__line mt-[16px] md:mt-[65px]"></div>
            <div class="postbox__comments pt-[16px] md:pt-[90px]">
              <div class="postbox__comment-title mb-30">
                <h3>댓글 (32)</h3>
              </div>
              <div class="latest-comments mb-30">
                <ul>
                  <li>
                    <div class="comments-box">
                      <div class="comments-avatar">
                        <!-- 댓글 아바타: AppImage (noImage 포함) -->
                        <app-image
                          :src="`${CDN_URL}/cdn/prod/img/blog/comments/avater-1.png`"
                          alt="김민수"
                          :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }"
                          :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }"
                        />
                      </div>
                      <div class="comments-text">
                        <div class="avatar-name">
                          <h5>김민수</h5>
                          <span> - 3개월 전 </span>
                          <a class="reply" href="#">답글 쓰기</a>
                        </div>
                        <p>많은 출판·웹 에디터가 기본 예시 문장으로 로렘 입숨을 사용합니다. 다양한 버전이 시간이 지나며 우연히 또는 의도적으로 만들어져 왔습니다.</p>
                      </div>
                    </div>
                  </li>
                  <li class="children">
                    <div class="comments-box">
                      <div class="comments-avatar">
                        <app-image
                          :src="`${CDN_URL}/cdn/prod/img/blog/comments/avater-2.png`"
                          alt="이영희"
                          :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }"
                          :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }"
                        />
                      </div>
                      <div class="comments-text">
                        <div class="avatar-name">
                          <h5>이영희</h5>
                          <span> - 6개월 전 </span>
                          <a class="reply" href="#">답글 쓰기</a>
                        </div>
                        <p>많은 출판·웹 에디터가 기본 예시 문장으로 로렘 입숨을 사용하며, 검색하면 아직 초기 단계인 웹 사이트들을 많이 찾을 수 있습니다.</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="comments-box">
                      <div class="comments-avatar">
                        <app-image
                          :src="`${CDN_URL}/cdn/prod/img/blog/comments/avater-3.png`"
                          alt="박지훈"
                          :img-style="{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }"
                          :skeleton-style="{ width: '60px', height: '60px', borderRadius: '50%' }"
                        />
                      </div>
                      <div class="comments-text">
                        <div class="avatar-name">
                          <h5>박지훈</h5>
                          <span> - 6개월 전 </span>
                          <a class="reply" href="#">답글 쓰기</a>
                        </div>
                        <p>많은 출판·웹 에디터가 기본 예시 문장으로 로렘 입숨을 사용합니다. 다양한 버전이 시간이 지나며 우연히 또는 의도적으로 만들어져 왔습니다.</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div class="postbox__line mb-95"></div>
            <div class="post-comments-form mb-100">
              <div class="post-comments-title mb-30">
                <h3>댓글 남기기</h3>
              </div>
              <!-- 댓글 등록 폼 (옛 BlogDetailsForm) -->
              <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — vee-validate <Form>/<Field> 를 <fo-form> + yup(useFoValidate)로 교체 -->
              <fo-form :columns="commentCols" :form="commentForm" :errors="errors" :cols="2" :gap="16" show-actions submit-label="댓글 등록" @submit="handleBtnAction('form-submit')" />
            </div>
          </div>

          <div class="col-xl-3 col-lg-4">
            <blog-sidebar />
          </div>
        </div>
      </div>
    </section>

    <!-- 블로그 없음 fallback -->
    <div v-else class="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
      블로그를 찾을 수 없습니다.
    </div>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import SkeletonBlogDetail from "~/components/ui/SkeletonBlogDetail.vue";
import { type CmBlogType } from "~/types/cm/cmBlogType";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { computed } from "vue";
import BlogItem from "~/components/blogs/BlogItem.vue";
import BlogSidebar from "~/components/common/sidebar/BlogSidebar.vue";
import AppImage from "~/components/ui/AppImage.vue";
import SkeletonCard from "~/components/ui/SkeletonCard.vue";
import { CDN_URL } from "~/conts/baseConst";
import { toSafeHtml } from "~/utils/htmlSafe";
import FoForm from "~/components/fo/FoForm.vue";
import { useFoValidate } from "~/composables/useFoValidate";
import type { FoFormColumn } from "~/types/fo/foCompType";
import * as yup from "yup";

const route = useRoute();
const id = route.params.id as string;

// SEO 단위화면(useSeoDetail): 서버 렌더링은 SEO 용 최소 정보(제목/요약/이미지)만, 화면이 뜬 뒤 브라우저가 ecBeBo 에서 본문까지 직접 조회한다.
const { item, pending, seo } = await useSeoDetail<CmBlogType>(`blog-${id}`, id ? `/api/fo/ec/cm/bltn/${encodeURIComponent(id)}` : null, () => coBlogSvc.getById(id));

import { usePageTitle } from "~/composables/usePageTitle";
import { useGa } from "~/composables/useGa";
useSeoMeta({
  title: () => (item.value ? `${item.value.blogTitle} | Outstock 블로그` : "블로그 상세"),
  ogTitle: () => item.value?.blogTitle ?? "블로그 상세",
  description: () => item.value?.blogSummary,
  ogDescription: () => item.value?.blogSummary,
  ogImage: () => item.value?.img,
});
usePageTitle("블로그 상세");
if (seo.value) useCdnCache(300); // 서버 렌더 결과(SEO 정보 있음)만 Netlify CDN 5분 캐시 — 오류/빈 페이지는 캐시 안 함

// GA4: 상세 조회 데이터 기준으로 page_view 전송
const { sendPageView } = useGa();
watch(
  item,
  (v) => {
    if (v?.blogTitle) sendPageView(`${v.blogTitle} | Outstock 블로그`);
  },
  { immediate: true }
);

// ── 추천 글 (옛 BlogDetailsArea) ─────────────────────────────
// 2026-09-13(성능 개선): lazy:true — 본문(item)만 SSR을 블로킹하고 "추천 글"은 보조
// 콘텐츠라 화면이 뜬 뒤 비동기로 채워지게 한다.
const { data: allBlogs, pending: relatedPending } = useAsyncData<CmBlogType[]>(
  "blog-related",
  () => coBlogSvc.getPage(),
  { lazy: true, server: false } // 보조 콘텐츠 — 서버 렌더 제외
);

const relatedBlogs = computed(() =>
  (allBlogs.value ?? []).filter((b) => b.blogId !== item.value?.blogId).slice(0, 2)
);

const currentUrl = computed(() =>
  import.meta.client ? window.location.href : ""
);
const pageTitle = computed(() => item.value?.blogTitle ?? "");

function shareOnFacebook() {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}`,
    "_blank", "width=600,height=400"
  );
}

function shareOnTwitter() {
  window.open(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl.value)}&text=${encodeURIComponent(pageTitle.value)}`,
    "_blank", "width=600,height=400"
  );
}

function shareOnPinterest() {
  window.open(
    `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl.value)}&description=${encodeURIComponent(pageTitle.value)}`,
    "_blank", "width=600,height=400"
  );
}

async function shareLink() {
  if (!import.meta.client) return;
  if (navigator.share) {
    try {
      await navigator.share({ title: pageTitle.value, url: currentUrl.value });
    } catch {
      // 사용자가 취소한 경우
    }
  } else {
    await navigator.clipboard.writeText(currentUrl.value);
    await useAlert().openAlert("링크가 복사되었습니다!");
  }
}

// ── 댓글 등록 폼 (옛 BlogDetailsForm) ─────────────────────────────
const schema = yup.object({
  name: yup.string().required("이름을 입력해 주세요").label("이름"),
  email: yup.string().required("이메일을 입력해 주세요").email("올바른 이메일 주소를 입력해 주세요").label("이메일"),
  subject: yup.string().required("제목을 입력해 주세요").min(10, "제목은 10자 이상이어야 합니다").label("제목"),
  msg: yup.string().required("메시지를 입력해 주세요").min(20, "메시지는 20자 이상이어야 합니다").label("메시지"),
});

const commentForm = reactive({ name: "", email: "", subject: "", msg: "" });
const commentCols: FoFormColumn[] = [
  { key: "name", label: "이름", type: "text", placeholder: "이름" },
  { key: "email", label: "이메일", type: "email", placeholder: "이메일" },
  { key: "subject", label: "제목", type: "text", placeholder: "제목", colSpan: 2 },
  { key: "msg", label: "내용", type: "textarea", placeholder: "내용", rows: 10, colSpan: 2 },
];
const { errors, validate } = useFoValidate(schema, commentForm);

async function onSubmit() {
  if (!(await validate())) return;
  await useAlert().openAlert(JSON.stringify(commentForm, null, 2));
  Object.assign(commentForm, { name: "", email: "", subject: "", msg: "" });
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ blog-dtl : handleBtnAction -> ", cmd, param);
  // 댓글 등록 (검증 후 전송)
  if (cmd === "form-submit") {
    return onSubmit();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
