<template>
  <Teleport to="body">
    <Transition name="dml-fade">
      <div v-show="visible" class="dml-overlay" role="dialog" aria-modal="true" aria-labelledby="hp-dml-title" @click.self="close">
        <div class="dml-dialog">
          <!-- 헤더 -->
          <div class="dml-head">
            <button type="button" class="dml-x" aria-label="닫기" @click="close">✕</button>
            <div class="dml-head-row">
              <span class="dml-head-ico" aria-hidden="true">👥</span>
              <div>
                <h3 id="hp-dml-title" class="dml-title">테스트 회원으로 로그인</h3>
                <p class="dml-desc">회원을 선택하면 비밀번호 <code>1111</code> 로 바로 로그인됩니다.</p>
              </div>
            </div>
          </div>

          <!-- 검색조건 — 등록기간(기본 최근 1년) · 사이트 · 모듈 · 검색어 -->
          <div class="dml-cond">
            <div class="dml-cond-row">
              <span class="dml-lbl">등록기간</span>
              <input v-model="cond.dateRangeStart" type="date" class="form-input dml-in dml-in--date" aria-label="등록기간 시작" />
              <span class="dml-tilde">~</span>
              <input v-model="cond.dateRangeEnd" type="date" class="form-input dml-in dml-in--date" aria-label="등록기간 끝" />
              <select class="form-input dml-in dml-in--range" aria-label="기간 빠른 선택" @change="handleBtnAction('demo-range', ($event.target as HTMLSelectElement).value)">
                <option value="">📅 기간</option>
                <option value="1">1달</option>
                <option value="3">3달</option>
                <option value="6">6달</option>
                <option value="12">1년</option>
                <option value="all">전체</option>
              </select>
              <span class="dml-lbl">사이트</span>
              <select v-model="cond.siteId" class="form-input dml-in dml-in--site" aria-label="사이트">
                <option value="">사이트 전체</option>
                <option v-for="s in sites" :key="s.siteId" :value="s.siteId">{{ (s.siteCode ? s.siteCode + " · " : "") + (s.siteNm || s.siteId) }}</option>
              </select>
              <span class="dml-lbl">모듈</span>
              <select v-model="cond.tenantModule" class="form-input dml-in dml-in--mod" aria-label="모듈">
                <option value="">모듈 전체</option>
                <option v-for="m in moduleOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="dml-cond-row">
              <input v-model="cond.searchValue" class="form-input dml-in dml-in--q" placeholder="이름 / 로그인ID / 연락처 검색" aria-label="검색어" @keyup.enter="handleBtnAction('demo-search')" />
              <button type="button" class="btn-blue btn-sm dml-search" :disabled="loading" @click="handleBtnAction('demo-search')">{{ loading ? "조회 중…" : "조회" }}</button>
            </div>
            <p class="dml-summary">
              총 <b>{{ total }}</b>명 · 이 배포: 사이트 <code>{{ tenant.siteId }}</code> · 모듈 <code class="dml-mod">{{ tenant.moduleId }}</code>
              <span>(다른 사이트 회원으로는 이 배포에서 로그인할 수 없습니다)</span>
            </p>
          </div>

          <!-- 회원 목록 -->
          <div class="dml-body">
            <table class="dml-table">
              <thead>
                <tr>
                  <th>사이트</th>
                  <th>로그인아이디</th>
                  <th>이름</th>
                  <th>전화번호</th>
                  <th>이메일</th>
                  <th>판매자</th>
                  <th>판매자사이트</th>
                  <th class="is-center">모듈</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!rows.length">
                  <td colspan="9" class="dml-empty">{{ loading ? "조회 중…" : "조회 결과가 없습니다." }}</td>
                </tr>
                <tr v-for="m in rows" :key="m.memberId" class="dml-row" :class="{ 'is-dim': loggingIn !== null && loggingIn !== m.loginId }" @click="loginAs(m)">
                  <td class="dml-site">
                    <span class="dml-site-nm">{{ m.siteNm || "-" }}</span>
                    <span v-if="m.siteId" class="dml-mono dml-sub">{{ m.siteId }}</span>
                  </td>
                  <td class="dml-mono dml-strong">{{ m.loginId }}</td>
                  <td class="dml-nowrap">{{ m.memberNm || "-" }}</td>
                  <td class="dml-nowrap">{{ m.memberPhone || "-" }}</td>
                  <td class="dml-mono">{{ m.memberEmail || "-" }}</td>
                  <td class="dml-nowrap dml-small">
                    <span v-if="m.defaultSellerNm" class="dml-seller">{{ m.defaultSellerNm }}<span v-if="(m.sellerCnt ?? 0) > 1" class="dml-muted"> 외 {{ (m.sellerCnt ?? 1) - 1 }}</span></span>
                    <span v-else class="dml-muted">-</span>
                  </td>
                  <td class="dml-nowrap dml-small">
                    <template v-if="m.defaultSellerSiteNm || m.defaultSellerSiteId">{{ m.defaultSellerSiteNm || "-" }}<span v-if="m.defaultSellerSiteId" class="dml-mono dml-muted"> · {{ m.defaultSellerSiteId }}</span></template>
                    <span v-else class="dml-muted">-</span>
                  </td>
                  <td class="is-center"><span v-if="m.tenantModule" class="badge badge-cat dml-mono">{{ m.tenantModule }}</span><span v-else class="dml-muted">-</span></td>
                  <td class="is-right dml-nowrap">
                    <span v-if="loggingIn === m.loginId" class="dml-ing">로그인 중…</span>
                    <button v-else type="button" class="btn-blue btn-sm dml-login" @click.stop="loginAs(m)">로그인</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="errorMsg" class="dml-error" role="alert">⚠️ {{ errorMsg }}</p>
          </div>

          <!-- 페이지 -->
          <div v-if="totalPage > 1" class="dml-pager">
            <button type="button" class="dml-pg" :disabled="pageNo <= 1" aria-label="이전 쪽" @click="handleBtnAction('demo-page', pageNo - 1)">‹</button>
            <button v-for="p in pageNums" :key="p" type="button" class="dml-pg" :class="{ 'is-on': p === pageNo }" @click="handleBtnAction('demo-page', p)">{{ p }}</button>
            <button type="button" class="dml-pg" :disabled="pageNo >= totalPage" aria-label="다음 쪽" @click="handleBtnAction('demo-page', pageNo + 1)">›</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * homepg1(모두누리 홈페이지) 테스트 회원 로그인 모달 — ec1 DemoMemberLoginModal 사본(2026-10-03, 요청사항: "공통적으로 로그인버튼 추가해주고").
 * 공개 회원 API(/co/ec/mb/member/page)를 등록기간(기본 최근 1년)·사이트·모듈·검색어로 조회하고, 고르면 비밀번호 1111 로 로그인한다.
 * 사이트/모듈 기본값은 이 배포의 값(다른 사이트 회원은 백엔드가 사이트 불일치로 거부). 연락처/이메일은 로그인 전이라 서버 마스킹 그대로.
 * 열: 사이트(회원 사이트명·ID) | 로그인아이디 | 이름 | 전화번호 | 이메일 | 판매자((기본)판매자 외 n) | 판매자사이트((기본)판매자의 사이트명·ID) | 모듈.
 * ec1 사본과 다른 점: 모듈 스타일(app/assets/homepg1 의 색 변수·form-input·btn-blue, 라이트/다크), 아이콘 폰트 대신 이모지,
 * 로그인 뒤 홈 대신 redirect(로그인 화면의 ?redirect=)로 간다, Esc 로 닫는다.
 */
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";
import { useTenant } from "~/composables/useTenant";
import { coMbMemberSvc } from "~/svc/co/mb/coMbMemberSvc";
import { coSySiteSvc } from "~/svc/co/sy/coSySiteSvc";
import type { MbMemberType } from "~/types/mb/mbMemberType";
import type { SySiteType } from "~/types/sy/sySiteType";

/** 판매자사이트 — 서버(MbMemberDto)는 내려주지만 공통 타입(MbMemberType)에 아직 없는 필드라 이 모달에서만 넓혀 쓴다 */
type DemoMemberRow = MbMemberType & { defaultSellerSiteId?: string; defaultSellerSiteNm?: string };

const DEMO_PASSWORD = "1111";
const PAGE_SIZE = 10;

const props = defineProps({
  /** 로그인한 뒤 갈 주소(사이트 안 주소만) */
  redirect: { type: String, default: "/" },
});
const emit = defineEmits<{ (e: "loggedIn"): void }>();

const authStore = useAuthStore();
const router = useRouter();
const tenant = useTenant();
const visible = ref(false);
const loggingIn = ref<string | null>(null);
const errorMsg = ref("");
const loading = ref(false);
const rows = ref<DemoMemberRow[]>([]);
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
    rows.value = (page.pageList ?? []) as DemoMemberRow[];
    total.value = page.pageTotalCount ?? 0;
    totalPage.value = Math.max(1, page.pageTotalPage ?? 1);
  } catch (e) {
    rows.value = [];
    total.value = 0;
    errorMsg.value = String((e as { data?: { message?: string } })?.data?.message ?? "").split("::")[0] || "회원 목록을 불러오지 못했습니다.";
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

async function loginAs(m: DemoMemberRow) {
  if (loggingIn.value) return;
  loggingIn.value = m.loginId;
  errorMsg.value = "";
  const result = await authStore.login(m.loginId, DEMO_PASSWORD);
  loggingIn.value = null;
  if (result.ok) {
    visible.value = false;
    emit("loggedIn");
    const to = props.redirect.startsWith("/") && !props.redirect.startsWith("//") ? props.redirect : "/";
    router.replace(to);
  } else {
    errorMsg.value = result.message ?? "로그인에 실패했습니다.";
  }
}

// 열려 있는 동안 Esc 로 닫기
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}
watch(visible, (v) => (v ? window.addEventListener("keydown", onKeydown) : window.removeEventListener("keydown", onKeydown)));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

defineExpose({ show });
</script>

<style scoped>
.dml-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(4px);
}
.dml-dialog {
  position: relative;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text-primary);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}
[data-theme="dark"] .dml-dialog {
  background: #121828;
  color-scheme: dark; /* 날짜 선택 아이콘 등 기본 입력 모양도 어둡게 */
}

/* 헤더 — 로고와 같은 파랑→초록 */
.dml-head {
  position: relative;
  flex-shrink: 0;
  padding: 22px 24px 18px;
  color: #ffffff;
  background: linear-gradient(135deg, #0099cc 0%, #00aa88 100%);
}
.dml-x {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}
.dml-x:hover {
  background: rgba(255, 255, 255, 0.32);
}
.dml-head-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dml-head-ico {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.dml-title {
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.3;
}
.dml-desc {
  margin-top: 4px;
  font-size: 0.8rem;
  opacity: 0.9;
}
.dml-desc code {
  padding: 1px 6px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.22);
  font-weight: 700;
}

/* 검색조건 */
.dml-cond {
  flex-shrink: 0;
  padding: 14px 20px 12px;
  background: var(--bg-base);
  border-bottom: 1px solid var(--border);
}
.dml-cond-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.dml-cond-row + .dml-cond-row {
  margin-top: 8px;
}
.dml-lbl {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-secondary);
}
.dml-lbl:not(:first-child) {
  margin-left: 4px;
}
.dml-tilde {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.dml-in {
  width: auto;
  height: 34px;
  padding: 0 10px;
  font-size: 0.78rem;
}
.dml-in--date {
  width: 138px;
}
.dml-in--range {
  width: 92px;
}
.dml-in--site {
  width: 200px;
}
.dml-in--mod {
  width: 118px;
}
.dml-in--q {
  flex: 1;
  min-width: 180px;
}
.dml-search {
  height: 34px;
  padding: 0 18px;
}
.dml-summary {
  margin-top: 8px;
  font-size: 0.72rem;
  color: var(--text-muted);
}
.dml-summary b {
  color: var(--blue);
}
.dml-summary code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--text-secondary);
}
.dml-summary .dml-mod {
  font-weight: 700;
  color: var(--purple);
}
.dml-summary span {
  margin-left: 4px;
}

/* 회원 목록 */
.dml-body {
  flex: 1;
  overflow: auto;
  padding: 14px 16px;
  overscroll-behavior: contain;
}
.dml-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
.dml-table th {
  padding: 8px 10px;
  text-align: left;
  white-space: nowrap;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.dml-table td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  vertical-align: middle;
}
.dml-table .is-center {
  text-align: center;
}
.dml-table .is-right {
  text-align: right;
}
.dml-row {
  cursor: pointer;
  transition: background 0.15s;
}
.dml-row:hover td {
  background: var(--blue-dim);
}
.dml-row.is-dim {
  opacity: 0.45;
  pointer-events: none;
}
.dml-empty {
  padding: 40px 10px !important;
  text-align: center;
  color: var(--text-muted) !important;
}
.dml-site {
  white-space: nowrap;
  line-height: 1.3;
}
.dml-site-nm {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-primary);
}
.dml-sub {
  display: block;
  font-size: 0.66rem;
  color: var(--text-muted);
}
.dml-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.dml-strong {
  font-weight: 700;
  color: var(--text-primary);
}
.dml-nowrap {
  white-space: nowrap;
}
.dml-small {
  font-size: 0.74rem;
}
.dml-seller {
  font-weight: 700;
  color: var(--blue);
}
.dml-muted {
  color: var(--text-muted);
}
.dml-ing {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--blue);
}
.dml-login {
  padding: 5px 12px;
  font-size: 0.74rem;
}
.dml-error {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(229, 62, 62, 0.08);
  border: 1px solid rgba(229, 62, 62, 0.3);
  color: #e53e3e;
  font-size: 0.8rem;
}
[data-theme="dark"] .dml-error {
  color: #fc8181;
}

/* 페이지 */
.dml-pager {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
}
.dml-pg {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
}
.dml-pg:hover:not(:disabled) {
  border-color: var(--blue);
  color: var(--blue);
}
.dml-pg:disabled {
  opacity: 0.35;
  cursor: default;
}
.dml-pg.is-on {
  background: var(--blue);
  border-color: var(--blue);
  color: #ffffff;
  font-weight: 700;
}

.dml-fade-enter-active,
.dml-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dml-fade-enter-from,
.dml-fade-leave-to {
  opacity: 0;
}
.dml-fade-enter-active .dml-dialog,
.dml-fade-leave-active .dml-dialog {
  transition: transform 0.2s ease;
}
.dml-fade-enter-from .dml-dialog,
.dml-fade-leave-to .dml-dialog {
  transform: scale(0.96);
}
@media (max-width: 639px) {
  .dml-head {
    padding: 18px 18px 14px;
  }
  .dml-cond {
    padding: 12px 14px 10px;
  }
  .dml-in--site,
  .dml-in--mod {
    flex: 1;
    width: auto;
  }
}
</style>
