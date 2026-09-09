/**
 * 공통 코드 Pinia 스토어.
 * codeGrp / codeValue / codeLabel 구조의 코드 목록을 /api/co/sy/code 에서 로드·캐시합니다.
 */
import { defineStore } from "pinia";
import { axiosCsr } from "~/utils/axiosCsr";
import { type SyCodeType } from "~/types/syCodeType";

export const useCodeStore = defineStore("code", {
  state: () => ({
    codes: [] as SyCodeType[],
    loaded: false,
  }),

  actions: {
    async loadStCodes() {
      if (this.loaded) return;
      try {
        const res = await axiosCsr.get<SyCodeType[]>("/api/co/sy/code");
        this.codes = res.data;
        this.loaded = true;
      } catch (err) {
        console.error("[useCodeStore] 코드 로드 실패:", err);
      }
    },
  },

  getters: {
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
