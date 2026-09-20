/**
 * 공통 코드 Pinia 스토어.
 * codeGrp / codeValue / codeLabel 구조의 코드 목록을 /api/co/sy/code 에서 로드·캐시합니다.
 */
import { defineStore } from "pinia";
import { type SyCodeType } from "~/types/sy/syCodeType";
import { syCodeSvc } from "~/svc/co/sy/syCodeSvc";

/** 진행 중인 그룹 요청(중복 요청 방지) — 스토어 상태가 아니라 모듈 변수로 둔다 */
const inflight = new Map<string, Promise<void>>();

export const useCodeStore = defineStore("code", {
  state: () => ({
    codes: [] as SyCodeType[],
    loaded: false, // 전체 코드를 받았는지(loadStCodes)
    loadedGrps: [] as string[], // 그룹 단위로 이미 받은 코드그룹(saLoadCodes) — 빈 그룹도 포함해 재요청을 막는다
  }),

  actions: {
    /**
     * 화면이 쓰는 코드그룹만 로딩해 누적 적재한다 (ecFeBo foCodeStore.saLoadCodes 와 같은 이름).
     * 이미 받은 그룹은 다시 요청하지 않고, 같은 그룹을 동시에 요청해도 한 번만 나간다. grps 를 안 주면 전체 로드.
     */
    async saLoadCodes(grps?: string[]) {
      if (!grps?.length) return this.loadStCodes();
      if (this.loaded) return; // 전체를 이미 받았으면 그룹 요청 불필요
      const missing = [...new Set(grps)].filter((g) => !this.loadedGrps.includes(g));
      if (!missing.length) return;
      const key = missing.slice().sort().join(",");
      let p = inflight.get(key);
      if (!p) {
        p = syCodeSvc
          .getByGroups(missing)
          .then((rows) => {
            const have = new Set(this.codes.map((c) => c.codeId));
            this.codes.push(...rows.filter((r) => !have.has(r.codeId)));
            this.loadedGrps.push(...missing);
          })
          .catch((err) => console.error("[useCodeStore] 코드그룹 로드 실패:", missing, err))
          .finally(() => inflight.delete(key));
        inflight.set(key, p);
      }
      await p;
    },
    async loadStCodes() {
      if (this.loaded) return;
      try {
        this.codes = await syCodeSvc.getCodes();
        this.loaded = true;
      } catch (err) {
        console.error("[useCodeStore] 코드 로드 실패:", err);
      }
    },
  },

  getters: {
    /** 코드그룹의 코드 목록 조회 (ecFeBo foCodeStore.sgGetGrpCodes 와 같은 이름) — 사용: useCodeStore().sgGetGrpCodes("CLAIM_TYPE_CD") */
    sgGetGrpCodes() {
      return (grp: string): SyCodeType[] => (this.getStCodes as Record<string, SyCodeType[]>)[grp] ?? [];
    },

    /**
     * 그룹별 코드 맵 { codeGrp → SyCodeType[] }
     * 예: getCodes["YN"] → [{ codeValue:"Y", codeLabel:"예" }, ...]
     */
    getStCodes: (state): Record<string, SyCodeType[]> =>
      state.codes.reduce(
        (acc, code) => {
          const key = code.codeGrp.trim();
          if (!acc[key]) acc[key] = [];
          acc[key]!.push(code);
          return acc;
        },
        {} as Record<string, SyCodeType[]>,
      ),

    /**
     * "codeGrp_codeValue" → codeLabel 맵 (그룹+값으로 유일 조회)
     * 예: fullMap["COLOR-color01"] → "빨강"
     */
    getStLabel: (state): Record<string, string> => Object.fromEntries(state.codes.map((c) => [`${c.codeGrp.trim()}-${c.codeValue}`, c.codeLabel])),
  },
});
