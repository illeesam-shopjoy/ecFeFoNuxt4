<template>
  <Teleport to="body">
    <Transition name="demo-login-fade">
      <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1a1410]/60 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="demo-login-title" @click.self="close">
        <div class="demo-login-dialog relative w-full max-w-[920px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.28)]">
          <!-- 헤더 -->
          <div class="relative shrink-0 px-6 pt-6 pb-4 text-white bg-[linear-gradient(135deg,#c08a4b_0%,#a06a2e_100%)]">
            <button type="button" class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 transition" @click="close" aria-label="닫기">
              <i class="fal fa-times"></i>
            </button>
            <div class="flex items-center gap-3">
              <span class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl"><i class="fas fa-user-friends"></i></span>
              <div>
                <h3 id="demo-login-title" class="text-[1.15rem] font-bold leading-tight m-0 text-white">테스트 회원으로 로그인</h3>
                <p class="text-[0.82rem] text-white/85 mt-1 mb-0">회원을 선택하면 비밀번호 <code class="px-1.5 py-0.5 rounded bg-black/25 text-white font-semibold">1111</code> 로 바로 로그인됩니다.</p>
              </div>
            </div>
          </div>

          <!-- 검색조건 — 등록기간(기본 최근 1년) · 사이트 · 모듈 · 검색어 -->
          <div class="shrink-0 px-5 pt-4 pb-3 bg-[#faf7f2] border-b border-[#ece4d8]">
            <div class="flex flex-wrap items-center gap-2 text-[0.78rem] text-gray-600">
              <span class="font-bold text-gray-800">등록기간</span>
              <input v-model="cond.dateRangeStart" type="date" class="in !w-[132px]" />
              <span>~</span>
              <input v-model="cond.dateRangeEnd" type="date" class="in !w-[132px]" />
              <select class="in !w-[90px]" @change="handleBtnAction('demo-range', ($event.target as HTMLSelectElement).value)">
                <option value="">📅 기간</option>
                <option value="1">1달</option>
                <option value="3">3달</option>
                <option value="6">6달</option>
                <option value="12">1년</option>
                <option value="all">전체</option>
              </select>
              <span class="font-bold text-gray-800 ml-1">사이트</span>
              <select v-model="cond.siteId" class="in !w-[190px]">
                <option value="">사이트 전체</option>
                <option v-for="s in sites" :key="s.siteId" :value="s.siteId">{{ (s.siteCode ? s.siteCode + " · " : "") + (s.siteNm || s.siteId) }}</option>
              </select>
              <span class="font-bold text-gray-800 ml-1">모듈</span>
              <select v-model="cond.tenantModule" class="in !w-[110px]">
                <option value="">모듈 전체</option>
                <option v-for="m in moduleOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="mt-2 flex gap-2">
              <input v-model="cond.searchValue" class="in flex-1" placeholder="이름 / 로그인ID / 연락처 검색" @keyup.enter="handleBtnAction('demo-search')" />
              <button type="button" class="shrink-0 rounded-lg border-0 bg-gray-900 px-4 text-[0.82rem] font-bold text-white disabled:opacity-60" :disabled="loading" @click="handleBtnAction('demo-search')">{{ loading ? "조회 중…" : "조회" }}</button>
            </div>
            <p class="mt-1.5 mb-0 text-[0.72rem] text-gray-400">
              총 <b class="text-theme">{{ total }}</b>명 · 이 배포: 사이트 <span class="font-mono">{{ tenant.siteId }}</span> · 모듈 <span class="font-mono font-bold text-[#7c3aed]">{{ tenant.moduleId }}</span>
              <span class="ml-1">(다른 사이트 회원으로는 이 배포에서 로그인할 수 없습니다)</span>
            </p>
          </div>

          <!-- 회원 목록 -->
          <div class="overflow-auto p-4 bg-[#faf7f2] flex-1">
            <table class="w-full border-collapse text-[0.8rem]">
              <thead>
                <tr class="text-left text-[0.72rem] text-gray-500">
                  <th class="th">로그인아이디</th>
                  <th class="th">이름</th>
                  <th class="th">전화번호</th>
                  <th class="th">이메일</th>
                  <th class="th">siteId</th>
                  <th class="th text-center">모듈</th>
                  <th class="th"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!rows.length">
                  <td colspan="7" class="py-10 text-center text-gray-400">{{ loading ? "조회 중…" : "조회 결과가 없습니다." }}</td>
                </tr>
                <tr v-for="m in rows" :key="m.memberId" class="row cursor-pointer" :class="{ 'opacity-50 pointer-events-none': loggingIn !== null && loggingIn !== m.loginId }" @click="loginAs(m)">
                  <td class="td font-mono font-semibold text-gray-900">{{ m.loginId }}</td>
                  <td class="td whitespace-nowrap">{{ m.memberNm || "-" }}</td>
                  <td class="td whitespace-nowrap">{{ m.memberPhone || "-" }}</td>
                  <td class="td font-mono">{{ m.memberEmail || "-" }}</td>
                  <td class="td font-mono text-[0.72rem] whitespace-nowrap">{{ m.siteId || "-" }}<span v-if="m.siteNm" class="text-gray-400"> · {{ m.siteNm }}</span></td>
                  <td class="td text-center"><span v-if="m.tenantModule" class="rounded-full bg-[#ede9fe] px-2 py-px text-[0.68rem] font-bold font-mono text-[#7c3aed]">{{ m.tenantModule }}</span><span v-else class="text-gray-300">-</span></td>
                  <td class="td text-right whitespace-nowrap">
                    <span v-if="loggingIn === m.loginId" class="text-[0.72rem] text-theme font-semibold">로그인 중…</span>
                    <button v-else type="button" class="rounded-md border-0 bg-theme px-3 py-1 text-[0.72rem] font-bold text-white" @click.stop="loginAs(m)">로그인</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="errorMsg" class="mt-4 mb-0 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[0.82rem]"><i class="fas fa-exclamation-circle mr-1.5"></i>{{ errorMsg }}</p>
          </div>

          <!-- 페이지 -->
          <div v-if="totalPage > 1" class="shrink-0 flex items-center justify-center gap-1 px-4 py-2.5 border-t border-[#ece4d8] bg-white text-[0.78rem]">
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
    console.warn("[handleBtnAction] unknown cmd:", cmd);
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
.in { height: 32px; padding: 0 8px; border: 1px solid #e5e0d6; border-radius: 8px; background: #fff; font-size: 0.78rem; outline: none; }
.in:focus { border-color: #bc8246; }
.th { padding: 6px 8px; border-bottom: 1px solid #ece4d8; font-weight: 600; white-space: nowrap; }
.td { padding: 7px 8px; border-bottom: 1px solid #f1ece4; background: #fff; }
.row:hover .td { background: #fdf6ee; }
.pg { min-width: 28px; height: 28px; padding: 0 6px; border: 1px solid #e5e0d6; border-radius: 6px; background: #fff; color: #666; cursor: pointer; }
.pg:disabled { opacity: 0.35; cursor: default; }
.pg-on { background: #111; border-color: #111; color: #fff; font-weight: 700; }
.demo-login-fade-enter-active,
.demo-login-fade-leave-active {
  transition: opacity 0.2s ease;
}
.demo-login-fade-enter-from,
.demo-login-fade-leave-to {
  opacity: 0;
}
.demo-login-fade-enter-active .demo-login-dialog,
.demo-login-fade-leave-active .demo-login-dialog {
  transition: transform 0.2s ease;
}
.demo-login-fade-enter-from .demo-login-dialog,
.demo-login-fade-leave-to .demo-login-dialog {
  transform: scale(0.95);
}
</style>
