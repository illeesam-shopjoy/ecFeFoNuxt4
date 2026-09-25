<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="addr-manage-title" @click.self="close">
      <div class="relative flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <!-- 헤더 -->
        <div class="flex shrink-0 items-center justify-between border-b border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] px-6 py-4">
          <div>
            <h3 id="addr-manage-title" class="m-0 text-[1.1rem] font-extrabold text-gray-900"><i class="fas fa-map-marker-alt text-theme mr-2 text-base"></i>{{ pick ? "주소 목록에서 선택" : "주소 관리" }}</h3>
            <div class="mt-0.5 text-[0.78rem] text-gray-400">{{ pick ? "주문에 쓸 배송지를 선택하세요. 필요하면 새 배송지를 추가할 수 있습니다." : "배송지를 여러 개 등록하고, 기본 배송지 1개를 정하세요." }}</div>
          </div>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-1 text-gray-400 hover:text-gray-700" aria-label="닫기" @click="close"><i class="fal fa-times"></i></button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <!-- 추가/수정 폼 -->
          <form v-if="editing" class="mb-4 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4" @submit.prevent="save">
            <h4 class="m-0 mb-3 text-[0.95rem] font-bold text-gray-900">{{ form.memberAddrId ? "배송지 수정" : "배송지 추가" }}</h4>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block"><span class="lb">배송지명</span><input v-model="form.addrNm" class="in" maxlength="30" placeholder="집, 회사 등" /></label>
              <label class="block"><span class="lb">수령자 *</span><input v-model="form.recvNm" class="in" maxlength="50" /></label>
              <label class="block sm:col-span-2"><span class="lb">연락처 *</span><input v-model="form.recvPhone" class="in" maxlength="20" placeholder="010-0000-0000" /></label>
              <div class="sm:col-span-2">
                <span class="lb">주소 *</span>
                <div class="flex gap-2">
                  <input v-model="form.zipCd" class="in !w-[110px] shrink-0 bg-[#f9fafb]" readonly placeholder="우편번호" />
                  <button type="button" class="cursor-pointer whitespace-nowrap rounded-lg border-[1.5px] border-theme bg-[#fdf6ee] px-3 text-[0.82rem] font-bold text-theme" @click="searchRef?.show()"><i class="fas fa-search mr-1"></i>주소 검색</button>
                </div>
              </div>
              <input v-model="form.addr" class="in bg-[#f9fafb] sm:col-span-2" readonly placeholder="도로명 주소" />
              <input v-model="form.addrDetail" class="in sm:col-span-2" maxlength="100" placeholder="상세 주소 (동/호수 등)" />
            </div>
            <label class="mt-3 flex cursor-pointer items-center gap-2 text-[0.85rem]"><input v-model="makeDefault" type="checkbox" class="!my-0 accent-[#bc8246]" />기본 배송지로 설정</label>
            <p v-if="err" class="m-0 mt-2 text-[0.8rem] text-red-500">{{ err }}</p>
            <div class="mt-3 flex justify-end gap-2">
              <button type="button" class="btn-sub" @click="editing = false">취소</button>
              <button type="submit" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-5 py-2 text-[0.85rem] font-bold text-white disabled:opacity-60" :disabled="saving">{{ saving ? "저장 중..." : "저장" }}</button>
            </div>
          </form>

          <div v-if="loading" class="py-10 text-center text-gray-400">불러오는 중...</div>
          <div v-else-if="!list.length && !editing" class="rounded-xl border border-dashed border-gray-300 py-10 text-center text-[0.88rem] text-gray-400">등록된 배송지가 없습니다.</div>
          <ul v-else class="m-0 grid list-none gap-2.5 p-0">
            <li v-for="a in list" :key="a.memberAddrId" class="rounded-xl border bg-white p-3.5" :class="a.defaultYn === 'Y' ? 'border-[#bc8246] shadow-sm' : 'border-[#e5e7eb]'">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-gray-900">{{ a.addrNm || "배송지" }}</span>
                <span v-if="a.defaultYn === 'Y'" class="rounded-full bg-[#faf3ea] px-2 py-px text-[0.72rem] font-bold text-[#8a5a25]">기본 배송지</span>
                <span class="ml-auto flex items-center gap-2.5 text-[0.8rem]">
                  <button v-if="pick" type="button" class="cursor-pointer rounded-md border-0 bg-gray-900 px-3 py-1 text-[0.78rem] font-bold text-white" @click="choose(a)">이 주소 선택</button>
                  <button v-if="a.defaultYn !== 'Y'" type="button" class="lnk" @click="setDefault(a)">기본으로 설정</button>
                  <button type="button" class="lnk" @click="openForm(a)">수정</button>
                  <button type="button" class="lnk !text-red-500" @click="remove(a)">삭제</button>
                </span>
              </div>
              <div class="mt-1 text-[0.86rem] text-gray-700">{{ a.recvNm }} · {{ a.recvPhone }}</div>
              <div class="text-[0.83rem] text-gray-500">({{ a.zipCode }}) {{ a.addr }} {{ a.addrDetail }}</div>
            </li>
          </ul>
        </div>

        <!-- 하단 -->
        <div class="flex shrink-0 items-center justify-between gap-2 border-t border-[#f0e2cf] bg-white px-6 py-3">
          <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white" @click="openForm()">+ 배송지 추가</button>
          <button type="button" class="btn-sub" @click="close">닫기</button>
        </div>
      </div>
    </div>
  </Teleport>
  <!-- 카카오(다음) 우편번호 검색 — 이 모달보다 위에 뜬다 -->
  <addr-search-modal ref="searchRef" :z-index="1200" @select="onAddr" />
</template>

<script setup lang="ts">
/**
 * 주소 관리 모달 — 배송지를 여러 개 등록/수정/삭제하고 기본 배송지 1개를 정한다(pages/my/addr.vue 와 같은 API: myAddrSvc).
 * 프로필 수정 모달이 열어 쓰며, 목록이 바뀔 때마다 `changed`(기본 배송지 또는 null)를 알려 프로필에 보이는 주소를 갱신하게 한다.
 */
import { reactive, ref } from "vue";
import AddrSearchModal from "~/components/modals/AddrSearchModal.vue";
import { myAddrSvc } from "~/svc/fo/ec/my/myAddrSvc";
import type { MbMemberAddrType } from "~/types/mb/mbMemberAddrType";
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";

const props = defineProps<{ pick?: boolean }>(); // 선택 모드 — 목록에서 주소 1개를 골라 돌려준다(주문 화면)
const emit = defineEmits<{ (e: "changed", defaultAddr: MbMemberAddrType | null): void; (e: "pick", addr: MbMemberAddrType): void }>();

const visible = ref(false);
const loading = ref(false);
const list = ref<MbMemberAddrType[]>([]);
const editing = ref(false);
const saving = ref(false);
const err = ref("");
const makeDefault = ref(false);
const searchRef = ref<InstanceType<typeof AddrSearchModal> | null>(null);
const blank = () => ({ memberAddrId: "", addrNm: "", recvNm: "", recvPhone: "", zipCd: "", addr: "", addrDetail: "" });
const form = reactive(blank());

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;
/** 기본 배송지 — 기본 표시가 없으면 첫 번째 */
const pickDefault = (l: MbMemberAddrType[]) => l.find((a) => a.defaultYn === "Y") ?? l[0] ?? null;

async function load() {
  loading.value = true;
  try {
    list.value = (await myAddrSvc.getMyAddrs()).slice().sort((a, b) => (b.defaultYn === "Y" ? 1 : 0) - (a.defaultYn === "Y" ? 1 : 0));
  } catch (e) {
    list.value = [];
    err.value = errText(e, "배송지를 불러오지 못했습니다.");
  } finally {
    loading.value = false;
  }
}
/** 목록을 다시 읽고 프로필에 기본 배송지를 알린다 */
async function reloadAndNotify() {
  await load();
  emit("changed", pickDefault(list.value));
}

function openForm(a?: MbMemberAddrType) {
  err.value = "";
  Object.assign(form, blank(), a ? { memberAddrId: a.memberAddrId, addrNm: a.addrNm ?? "", recvNm: a.recvNm ?? "", recvPhone: a.recvPhone ?? "", zipCd: a.zipCode ?? "", addr: a.addr ?? "", addrDetail: a.addrDetail ?? "" } : {});
  makeDefault.value = a ? a.defaultYn === "Y" : !list.value.length; // 첫 배송지는 기본으로
  editing.value = true;
}
function onAddr(r: SyAddrSearchResultType) {
  form.zipCd = r.zonecode;
  form.addr = r.address;
}
async function save() {
  err.value = "";
  if (!form.recvNm.trim() || !form.recvPhone.trim() || !form.addr.trim()) return void (err.value = "수령자, 연락처, 주소는 필수입니다.");
  saving.value = true;
  try {
    const saved = await myAddrSvc.saveAddr({ ...form, memberAddrId: form.memberAddrId || undefined, isDefault: "N" });
    if (makeDefault.value) await myAddrSvc.setDefault(saved.memberAddrId);
    editing.value = false;
    await reloadAndNotify();
    useNuxtApp().$toast.success("배송지가 저장되었습니다.");
  } catch (e) {
    err.value = errText(e, "저장에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}
async function setDefault(a: MbMemberAddrType) {
  try {
    await myAddrSvc.setDefault(a.memberAddrId);
    await reloadAndNotify();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "기본 배송지 설정에 실패했습니다."));
  }
}
async function remove(a: MbMemberAddrType) {
  if (!(await useConfirm().openConfirm({ title: "배송지 삭제", message: `'${a.addrNm || "배송지"}' 를 삭제할까요?`, confirmText: "삭제", cancelText: "취소", variant: "danger" }))) return;
  try {
    await myAddrSvc.removeAddr(a.memberAddrId);
    // 기본 배송지를 지웠다면 남은 첫 번째를 기본으로 (기본이 없으면 프로필에 보일 주소가 사라진다)
    await load();
    if (a.defaultYn === "Y" && list.value.length) await myAddrSvc.setDefault(list.value[0]!.memberAddrId);
    await reloadAndNotify();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "삭제에 실패했습니다."));
  }
}

/** 선택 모드: 이 주소를 부모에게 돌려주고 닫는다 */
function choose(a: MbMemberAddrType) {
  emit("pick", a);
  visible.value = false;
}
void props;

async function show() {
  err.value = "";
  editing.value = false;
  visible.value = true;
  await load();
}
function close() {
  visible.value = false;
}
defineExpose({ show, close });
</script>

<style scoped>
.lb { display: block; margin-bottom: 4px; font-size: 0.78rem; color: #6b7280; }
.in { width: 100%; height: 38px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 0.88rem; outline: none; }
.in:focus { border-color: #bc8246; }
.lnk { padding: 0; border: 0; background: transparent; color: #4b5563; cursor: pointer; text-decoration: underline; }
.btn-sub { padding: 8px 16px; border: 1px solid #c9ced6; border-radius: 8px; background: #f3f4f6; color: #374151; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
</style>
