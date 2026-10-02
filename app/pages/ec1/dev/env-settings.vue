<template>
  <div>
    <h1 class="text-xl font-bold text-gray-800 mb-1">환경변수 설정</h1>
    <p class="text-sm text-gray-500 mb-1">
      토스페이먼츠 / 소셜 로그인(구글·카카오·네이버·애플) / 지도 연결 / GA4 값을 여기서 바로 확인하고 저장할 수 있습니다.
      <code class="bg-gray-100 px-1 rounded">{{ envPath }}</code> 파일을 직접 읽고 씁니다.
    </p>
    <p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
      ⚠️ 저장해도 이미 떠 있는 dev 서버에는 바로 반영되지 않습니다 — Nuxt가 환경변수를 서버 시작 시 한 번만 읽기
      때문에, 저장한 뒤 <strong>dev 서버를 재시작</strong>해야 새 값이 적용됩니다.
    </p>

    <div v-if="!isLocal" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
      이 화면은 로컬 개발 모드(<code>NUXT_PUBLIC_MODE=local</code>)에서만 사용할 수 있습니다.
    </div>

    <template v-else>
      <div v-if="pending" class="text-sm text-gray-500">불러오는 중…</div>
      <div v-else-if="loadError" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
        {{ loadError }}
      </div>
      <div v-else class="space-y-5">
        <section v-for="(fields, group) in groups" :key="group" class="border rounded-lg bg-white p-4">
          <h2 class="font-semibold text-gray-700 mb-3">{{ group }}</h2>
          <div class="space-y-3">
            <div v-for="field in fields" :key="field.key" class="flex items-start gap-3">
              <div class="w-40 shrink-0 pt-2">
                <label class="text-sm text-gray-600">{{ field.label }}</label>
                <code class="block text-[11px] text-gray-400 break-all">{{ field.key }}</code>
              </div>
              <div class="flex-1 flex items-center gap-2">
                <input
                  v-model="draft[field.key]"
                  :type="field.secret && !revealed[field.key] ? 'password' : 'text'"
                  :placeholder="field.placeholder"
                  class="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
                  autocomplete="off"
                />
                <button v-if="field.secret" type="button" class="text-gray-400 hover:text-gray-600 px-1" @click="revealed[field.key] = !revealed[field.key]" :aria-label="revealed[field.key] ? '숨기기' : '보기'">
                  <i :class="revealed[field.key] ? 'fal fa-eye-slash' : 'fal fa-eye'"></i>
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded text-sm shrink-0"
                  :class="draft[field.key] === original[field.key] ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-theme text-white hover:opacity-90'"
                  :disabled="draft[field.key] === original[field.key] || savingKey === field.key"
                  @click="save(field.key)"
                >
                  {{ savingKey === field.key ? "저장 중…" : "저장" }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 2026-09-14(요청사항: "우측 상단에 설정을클릭하면 env 값 보는페이지 하나 만들어주고
 * 페이지에서 env 값 수정도 가능하게 해줘 env 값 수정하며 토크, 카카오, 구글로그인,
 * 맵연결 등 확인하려는거야"). 실제 파일 읽기/쓰기는 server/api/dev/env.*.ts(로컬
 * 개발 서버에서만 동작)를 통해 이뤄진다.
 */
import { ref, reactive } from "vue";
import { envSvc } from "~/svc/co/dev/envSvc";
import type { SyDevEnvFieldType } from "~/types/sy/syDevEnvType";

definePageMeta({ layout: "admin" });
usePageTitle("환경변수 설정");

const config = useRuntimeConfig();
const isLocal = config.public.mode === "local";

const envPath = ref(".env");
const groups = ref<Record<string, SyDevEnvFieldType[]>>({});
const original = reactive<Record<string, string>>({});
const draft = reactive<Record<string, string>>({});
const revealed = reactive<Record<string, boolean>>({});
const pending = ref(true);
const loadError = ref("");
const savingKey = ref<string | null>(null);

async function load() {
  pending.value = true;
  loadError.value = "";
  try {
    const res = await envSvc.getAll();
    envPath.value = res.envPath;
    groups.value = res.groups;
    for (const rows of Object.values(res.groups)) {
      for (const f of rows) {
        original[f.key] = f.value;
        draft[f.key] = f.value;
      }
    }
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : "불러오기 실패";
  } finally {
    pending.value = false;
  }
}

async function save(key: string) {
  savingKey.value = key;
  try {
    await envSvc.setValue(key, draft[key] ?? "");
    original[key] = draft[key] ?? "";
    await useAlert().openAlert("저장했습니다. dev 서버를 재시작해야 적용됩니다.");
  } catch (e) {
    await useAlert().openAlert(e instanceof Error ? e.message : "저장 실패");
  } finally {
    savingKey.value = null;
  }
}

if (isLocal) load();
</script>
