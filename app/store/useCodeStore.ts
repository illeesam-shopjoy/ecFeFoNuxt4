/**
 * 공통 코드 Pinia 스토어.
 * codeGrp / codeValue / codeLabel 구조의 코드 목록을 /api/co/sy/code 에서 로드·캐시합니다.
 */
import { defineStore } from "pinia";
import { type SyCodeType } from "~/types/syCodeType";
import { syCodeSvc } from "~/svc/co/sy/syCodeSvc";

export const useCodeStore = defineStore("code", {
  state: () => ({
    codes: [] as SyCodeType[],
    loaded: false,
  }),

  actions: {
    /** 화면이 쓰는 코드그룹 로딩 (ecFeBo foCodeStore.saLoadCodes 와 같은 이름). 현재는 전체 코드를 1회 로드·캐시하므로 grps 는 표기용 */
    async saLoadCodes(_grps?: string[]) {
      await this.loadStCodes();
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
