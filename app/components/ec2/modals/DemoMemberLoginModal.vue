<template>
  <Teleport to="body">
    <Transition name="demo-login-fade">
      <div v-show="visible" class="dml-root fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="demo-login-title" @click.self="close">
        <div class="dml-dialog relative w-full max-w-[1200px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
          <!-- 헤더 -->
          <div class="dml-head relative shrink-0 px-6 pt-6 pb-4">
            <button type="button" class="dml-close absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition" @click="close" aria-label="닫기">
              <i class="fal fa-times"></i>
            </button>
            <div class="flex items-center gap-3">
              <span class="dml-head-icon w-11 h-11 rounded-xl flex items-center justify-center text-xl"><i class="fas fa-user-friends"></i></span>
              <div>
                <h3 id="demo-login-title" class="dml-head-title text-[1.15rem] font-bold leading-tight m-0">테스트 회원으로 로그인</h3>
                <p class="dml-head-sub text-[0.82rem] mt-1 mb-0">회원을 선택하면 비밀번호 <code class="dml-code px-1.5 py-0.5 rounded font-semibold">1111</code> 로 바로 로그인됩니다.</p>
              </div>
            </div>
          </div>

          <!-- 검색조건 — 등록기간(기본 최근 1년) · 사이트 · 모듈 · 검색어 -->
          <div class="dml-cond shrink-0 px-5 pt-4 pb-3">
            <div class="flex flex-wrap items-center gap-2 text-[0.78rem]">
              <span class="dml-label">등록기간</span>
              <input v-model="cond.dateRangeStart" type="date" class="in !w-[132px]" />
              <span class="dml-muted">~</span>
              <input v-model="cond.dateRangeEnd" type="date" class="in !w-[132px]" />
              <select class="in !w-[90px]" @change="handleBtnAction('demo-range', ($event.target as HTMLSelectElement).value)">
                <option value="">📅 기간</option>
                <option value="1">1달</option>
                <option value="3">3달</option>
                <option value="6">6달</option>
                <option value="12">1년</option>
                <option value="all">전체</option>
              </select>
              <span class="dml-label ml-1">사이트</span>
              <select v-model="cond.siteId" class="in !w-[190px]">
                <option value="">사이트 전체</option>
                <option v-for="s in sites" :key="s.siteId" :value="s.siteId">{{ (s.siteCode ? s.siteCode + " · " : "") + (s.siteNm || s.siteId) }}</option>
              </select>
              <span class="dml-label ml-1">모듈</span>
              <select v-model="cond.tenantModule" class="in !w-[110px]">
                <option value="">모듈 전체</option>
                <option v-for="m in moduleOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="mt-2 flex gap-2">
              <input v-model="cond.searchValue" class="in flex-1" placeholder="이름 / 로그인ID / 연락처 검색" @keyup.enter="handleBtnAction('demo-search')" />
              <button type="button" class="dml-search shrink-0 rounded-lg px-4 text-[0.82rem] font-bold disabled:opacity-60" :disabled="loading" @click="handleBtnAction('demo-search')">{{ loading ? "조회 중…" : "조회" }}</button>
            </div>
            <p class="dml-muted mt-1.5 mb-0 text-[0.72rem]">
              총 <b class="dml-accent">{{ total }}</b>명 · 이 배포: 사이트 <span class="font-mono">{{ tenant.siteId }}</span> · 모듈 <span class="dml-mod font-mono font-bold">{{ tenant.moduleId }}</span>
              <span class="ml-1">(다른 사이트 회원으로는 이 배포에서 로그인할 수 없습니다)</span>
            </p>
          </div>

          <!-- 회원 목록 -->
          <div class="dml-list overflow-auto p-4 flex-1">
            <table class="dml-table w-full border-collapse text-[0.8rem]">
              <!-- 2026-10-03(요청사항) — 열 순서: 사이트(회원 사이트명 + 아래 siteId) | 로그인아이디 | 이름 | 전화번호 | 이메일 | 판매자((기본)판매자, 외 n) | 판매자사이트(그 판매자의 사이트명 · ID) | 모듈.
                   예전 "(기본)판매자" 열은 "판매자"로, 예전 "사이트" 열(회원 사이트)은 맨 앞 "사이트"로 옮기고 그 자리는 판매자의 사이트를 보인다. -->
              <thead>
                <tr class="text-left text-[0.72rem]">
                  <th class="th">사이트</th>
                  <th class="th">로그인아이디</th>
                  <th class="th">이름</th>
                  <th class="th">전화번호</th>
                  <th class="th">이메일</th>
                  <th class="th">판매자</th>
                  <th class="th">판매자사이트</th>
                  <th class="th text-center">모듈</th>
                  <th class="th"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!rows.length">
                  <td colspan="9" class="td dml-muted py-10 text-center">{{ loading ? "조회 중…" : "조회 결과가 없습니다." }}</td>
                </tr>
                <tr v-for="m in rows" :key="m.memberId" class="dml-row cursor-pointer" :class="{ 'opacity-50 pointer-events-none': loggingIn !== null && loggingIn !== m.loginId }" @click="loginAs(m)">
                  <td class="td text-[0.72rem] whitespace-nowrap leading-tight">
                    <span class="dml-strong font-semibold">{{ m.siteNm || "-" }}</span>
                    <span v-if="m.siteId" class="dml-muted block font-mono text-[0.66rem]">{{ m.siteId }}</span>
                  </td>
                  <td class="td dml-strong font-mono font-semibold">{{ m.loginId }}</td>
                  <td class="td whitespace-nowrap">{{ m.memberNm || "-" }}</td>
                  <td class="td whitespace-nowrap">{{ m.memberPhone || "-" }}</td>
                  <td class="td font-mono">{{ m.memberEmail || "-" }}</td>
                  <td class="td text-[0.72rem] whitespace-nowrap"><span v-if="m.defaultSellerNm" class="dml-link font-semibold">{{ m.defaultSellerNm }}<span v-if="(m.sellerCnt ?? 0) > 1" class="dml-muted font-normal"> 외 {{ (m.sellerCnt ?? 1) - 1 }}</span></span><span v-else class="dml-faint">-</span></td>
                  <td class="td text-[0.72rem] whitespace-nowrap">
                    <template v-if="m.defaultSellerSiteNm || m.defaultSellerSiteId">{{ m.defaultSellerSiteNm || "-" }}<span v-if="m.defaultSellerSiteId" class="dml-muted font-mono"> · {{ m.defaultSellerSiteId }}</span></template>
                    <span v-else class="dml-faint">-</span>
                  </td>
                  <td class="td text-center"><span v-if="m.tenantModule" class="dml-chip rounded-full px-2 py-px text-[0.68rem] font-bold font-mono">{{ m.tenantModule }}</span><span v-else class="dml-faint">-</span></td>
                  <td class="td text-right whitespace-nowrap">
                    <span v-if="loggingIn === m.loginId" class="dml-accent text-[0.72rem] font-semibold">로그인 중…</span>
                    <button v-else type="button" class="dml-login rounded-md px-3 py-1 text-[0.72rem] font-bold" @click.stop="loginAs(m)">로그인</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="errorMsg" class="dml-error mt-4 mb-0 px-3 py-2 rounded-lg text-[0.82rem]"><i class="fas fa-exclamation-circle mr-1.5"></i>{{ errorMsg }}</p>
          </div>

          <!-- 페이지 -->
          <div v-if="totalPage > 1" class="dml-pager shrink-0 flex items-center justify-center gap-1 px-4 py-2.5 text-[0.78rem]">
            <button type="button" class="pg" :disabled="pageNo <= 1" @click="handleBtnAction('demo-page', pageNo - 1)">‹</button>
            <template v-for="p in pageNums" :key="p">
              <button type="button" class="pg" :class="{ 'pg-on': p === pageNo }" @click="handleBtnAction('demo-page', p)">{{ p }}</button>
            </template>
            <button type="button" class="pg" :disabled="pageNo >= totalPage" @click="handleBtnAction('demo-page', pageNo + 1)">›</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 2026-09-14(요청사항: "회원가입 아래 회원목록 모달 호출해줘 그 중에서 한명 선택하여 로그인되게 해줘 비밀번호 1111 로 보내면 로그인될거야")
 * 2026-10-02(요청사항: "임시로그인 정보에 상단검색영역추가해주고 등록기간 1년, 사이트, 모듈 조건 추가해줘 / 목록에는 로그인아이디, 이름, 전화번호, 이메일, siteId, 모듈")
 *   — 고정 목록 10명 대신 공개 회원 API(/co/ec/mb/member/page)를 조회한다. 등록기간은 reg_date 기준(기본 최근 1년), 사이트/모듈 기본값은 이 배포의 값
 *   (다른 사이트 회원으로는 이 배포에서 로그인해도 백엔드가 사이트 불일치로 거부하므로). 모듈(tenantModule)은 회원 소속 사이트의 FO 모듈(sy_site.tenant_module)을 서버가 채워 준다.
 *   연락처/이메일은 로그인 전이라 서버의 민감정보 마스킹 규칙이 그대로 적용된다.
 * 2026-10-03(요청사항) — 목록 열: 사이트(회원 사이트명·ID) | 로그인아이디 | 이름 | 전화번호 | 이메일 | 판매자((기본)판매자 외 n) | 판매자사이트((기본)판매자의 사이트명·ID) | 모듈.
 *   판매자사이트는 서버가 채우는 defaultSellerSiteId/defaultSellerSiteNm(판매자↔사이트 매핑) — 회원 사이트와 다를 수 있다.
 * 2026-10-04(요청사항: "임시로그인 스타일 이상하네", danmoo1 다크에서 발견) — 다크 테마에서 흰 칸에 밝은 글자가 겹쳐 안 보였다(전역 다크 CSS 가 글자색만 바꿈).
 *   ec2 도 같은 사본이라 같이 고쳤다: 색은 모두 이 모달의 CSS 변수(--dml-*)로, 라이트 값 + html.theme-dark 값(쇼핑몰 다크 팔레트). Tailwind 회색 유틸은 쓰지 않는다.
 */
import { computed, reactive, ref } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";
import { useTenant } from "~/composables/useTenant";
import { coMbMemberSvc } from "~/svc/co/mb/coMbMemberSvc";
import { coSySiteSvc } from "~/svc/co/sy/coSySiteSvc";
import type { MbMemberType } from "~/types/mb/mbMemberType";
import type { SySiteType } from "~/types/sy/sySiteType";

const DEMO_PASSWORD = "1111";
const PAGE_SIZE = 10;

const emit = defineEmits<{ (e: "loggedIn"): void }>();

const authStore = useAuthStore();
const router = useRouter();
const tenant = useTenant();
const visible = ref(false);
const loggingIn = ref<string | null>(null);
const errorMsg = ref("");
const loading = ref(false);
const rows = ref<MbMemberType[]>([]);
const total = ref(0);
const pageNo = ref(1);
const totalPage = ref(1);
const sites = ref<SySiteType[]>([]);
const cond = reactive({ dateRangeStart: "", dateRangeEnd: "", siteId: "", tenantModule: "", searchValue: "" });

const moduleOptions = computed(() => [...new Set(sites.value.map((s) => s.tenantModule).filter((m): m is string => !!m))].sort());
const pageNums = computed(() => {
  const s = Math.max(1, pageNo.value - 2);
  const e = Math.min(totalPage.value, s + 4);
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
});

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** 최근 N개월(또는 "all"=전체)로 등록기간 채우기 */
function setRange(months: string) {
  if (months === "all") {
    cond.dateRangeStart = "";
    cond.dateRangeEnd = "";
    return;
  }
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - Number(months));
  cond.dateRangeStart = ymd(from);
  cond.dateRangeEnd = ymd(to);
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ DemoMemberLoginModal.vue : handleBtnAction -> ", cmd, param);
  if (cmd === "demo-search") {
    pageNo.value = 1;
    return load();
  } else if (cmd === "demo-page") {
    pageNo.value = Number(param);
    return load();
  } else if (cmd === "demo-range") {
    if (!param) return;
    setRange(String(param));
    pageNo.value = 1;
    return load();
  } else {
    console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
  }
};

async function load() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const page = await coMbMemberSvc.getMemberPage({
      pageNo: pageNo.value,
      pageSize: PAGE_SIZE,
      memberStatusCd: "ACTIVE",
      ...(cond.dateRangeStart || cond.dateRangeEnd ? { dateRangeType: "reg_date", dateRangeStart: cond.dateRangeStart || undefined, dateRangeEnd: cond.dateRangeEnd || undefined } : {}),
      siteId: cond.siteId || undefined,
      tenantModule: cond.tenantModule || undefined,
      ...(cond.searchValue.trim() ? { searchType: "memberNm,loginId,memberPhone", searchValue: cond.searchValue.trim() } : {}),
    });
    rows.value = page.pageList ?? [];
    total.value = page.pageTotalCount ?? 0;
    totalPage.value = Math.max(1, page.pageTotalPage ?? 1);
  } catch (e) {
    rows.value = [];
    total.value = 0;
    errorMsg.value = String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? "회원 목록을 불러오지 못했습니다.").split("::")[0]!;
  } finally {
    loading.value = false;
  }
}

async function show() {
  visible.value = true;
  errorMsg.value = "";
  // 기본 조건: 등록기간 최근 1년 · 이 배포의 사이트/모듈
  setRange("12");
  cond.siteId = tenant.siteId;
  cond.tenantModule = tenant.moduleId;
  cond.searchValue = "";
  pageNo.value = 1;
  if (!sites.value.length) {
    try {
      sites.value = await coSySiteSvc.getActiveSites();
    } catch {
      sites.value = []; // 사이트 목록을 못 받아도 회원 조회는 진행
    }
  }
  await load();
}
function close() {
  visible.value = false;
}

async function loginAs(m: MbMemberType) {
  if (loggingIn.value) return;
  loggingIn.value = m.loginId;
  errorMsg.value = "";
  const result = await authStore.login(m.loginId, DEMO_PASSWORD);
  loggingIn.value = null;
  if (result.ok) {
    visible.value = false;
    emit("loggedIn");
    router.push("/");
  } else {
    errorMsg.value = result.message ?? "로그인에 실패했습니다.";
  }
}

defineExpose({ show });
</script>

<style scoped>
/* 2026-10-04: 색은 모두 --dml-* 변수로(값은 아래 전역 블록 — 라이트 + html.theme-dark). 쇼핑몰 다크 팔레트(app/assets/ec2/theme-dark.css)와 같은 색.
   전역 다크 CSS(app/assets/ec2/theme-dark.css)가 표·회색 유틸의 글자색만 바꾸던 문제를 피하려고 표 칸 선택자 우선순위를 .dml-table 로 높였다. */
.dml-root { background: rgba(26, 20, 16, 0.6); backdrop-filter: blur(3px); }
.dml-dialog { background: var(--dml-bg); color: var(--dml-text); box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35); }
.dml-head { color: #fff; background: var(--dml-head); }
.dml-head-title { color: #fff; }
.dml-head-sub { color: rgba(255, 255, 255, 0.9); }
.dml-head-icon { background: rgba(255, 255, 255, 0.22); }
.dml-close { background: rgba(255, 255, 255, 0.18); color: #fff; }
.dml-close:hover { background: rgba(255, 255, 255, 0.32); }
.dml-code { background: rgba(0, 0, 0, 0.25); color: #fff; }
.dml-cond { background: var(--dml-soft); border-bottom: 1px solid var(--dml-line); color: var(--dml-text2); }
.dml-label { font-weight: 700; color: var(--dml-text); }
.dml-muted { color: var(--dml-text2); }
.dml-faint { color: var(--dml-text3); }
.dml-strong { color: var(--dml-text); }
.dml-accent { color: var(--dml-accent-text); }
.dml-link { color: var(--dml-link); }
.dml-mod { color: var(--dml-chip-fg); }
.dml-chip { background: var(--dml-chip-bg); color: var(--dml-chip-fg); }
.dml-search { border: 0; background: var(--dml-text); color: var(--dml-bg); }
.dml-login { border: 0; background: var(--dml-accent); color: #fff; }
.dml-list { background: var(--dml-soft); }
.dml-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); color: #ef4444; }
.dml-pager { background: var(--dml-bg); border-top: 1px solid var(--dml-line); }
.in { height: 32px; padding: 0 8px; border: 1px solid var(--dml-line); border-radius: 8px; background: var(--dml-bg); color: var(--dml-text); font-size: 0.78rem; outline: none; color-scheme: light dark; }
.in::placeholder { color: var(--dml-text3); }
.in:focus { border-color: var(--dml-accent); }
.dml-table { color: var(--dml-text); }
.dml-table .th { padding: 6px 8px; border-bottom: 1px solid var(--dml-line); font-weight: 600; white-space: nowrap; background: transparent; color: var(--dml-text2); }
.dml-table .td { padding: 7px 8px; border-bottom: 1px solid var(--dml-line); background: var(--dml-bg); color: var(--dml-text); }
/* 2026-10-03: 클래스명 .row 는 테마 전역 그리드(.row{display:flex;flex-wrap:wrap}, scss/_grid.scss)와 겹쳐 표 행이 줄바꿈되며 깨졌다 → dml-row */
.dml-table .dml-row:hover .td { background: var(--dml-hover); }
.pg { min-width: 28px; height: 28px; padding: 0 6px; border: 1px solid var(--dml-line); border-radius: 6px; background: var(--dml-bg); color: var(--dml-text2); cursor: pointer; }
.pg:disabled { opacity: 0.35; cursor: default; }
.pg-on { background: var(--dml-text); border-color: var(--dml-text); color: var(--dml-bg); font-weight: 700; }
.demo-login-fade-enter-active,
.demo-login-fade-leave-active {
  transition: opacity 0.2s ease;
}
.demo-login-fade-enter-from,
.demo-login-fade-leave-to {
  opacity: 0;
}
.demo-login-fade-enter-active .dml-dialog,
.demo-login-fade-leave-active .dml-dialog {
  transition: transform 0.2s ease;
}
.demo-login-fade-enter-from .dml-dialog,
.demo-login-fade-leave-to .dml-dialog {
  transform: scale(0.95);
}
</style>

<style>
/* 2026-10-04: 테마별 색 값(--dml-*) — 전역 블록에 둔다. scoped 의 ":global(html.theme-dark) .dml-root" 는 컴파일되면 "html.theme-dark" 만 남아
   (.dml-root 가 빠짐) 모달 자신이 정한 라이트 값을 못 이겼다. .dml-root 는 이 모듈 빌드의 이 모달에만 있다(모듈별 독립 소스). */
.dml-root {
  --dml-bg: #fff;
  --dml-soft: #faf7f2;
  --dml-line: #ece4d8;
  --dml-text: #1f2937;
  --dml-text2: #5f6670;
  --dml-text3: #c9c2b8;
  --dml-hover: #f3f7fe;
  --dml-accent: #2f6fd6;
  --dml-accent-soft: #e8f0fc;
  --dml-accent-text: #1d4fa8;
  --dml-link: #1d4ed8;
  --dml-chip-bg: #ede9fe;
  --dml-chip-fg: #7c3aed;
  --dml-head: linear-gradient(135deg, #4a86e8 0%, #2f6fd6 100%);
}
html.theme-dark .dml-root {
  --dml-bg: #1e1a15;
  --dml-soft: #191510;
  --dml-line: #332d25;
  --dml-text: #f2ede6;
  --dml-text2: #b3a99c;
  --dml-text3: #6f675d;
  --dml-hover: #28231c;
  --dml-accent: #3b7be0;
  --dml-accent-soft: rgba(47, 111, 214, 0.25);
  --dml-accent-text: #6ea0f0;
  --dml-link: #93c5fd;
  --dml-chip-bg: rgba(124, 58, 237, 0.25);
  --dml-chip-fg: #c4b5fd;
}
</style>
