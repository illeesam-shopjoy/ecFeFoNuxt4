/**
 * useSiteModuleCheck — 이 배포의 사이트(X-Site-Id)와 모듈(빌드 모듈)이 백엔드 sy_site.tenant_module 과 맞는지 (2026-10-03).
 *
 * - 앱 시작 때(plugins/siteModuleCheck.client.ts) 백엔드 공개 사이트 API 를 한 번 조회해 결과를 전역 상태로 둔다.
 *   맞지 않으면 각 모듈 상단 로고 옆에 (X) 표시 — 마우스를 올리면 "사이트(SI…)와 모듈(…)가 맞지 않습니다."
 *   (scripts/tenant.mjs 는 2026-10-03 부터 짝이 맞지 않아도 실행만 막지 않고 경고한다 — 화면에서 바로 알 수 있게)
 * - FO 설정의 "사이트 정상여부 체크" 토글(기본 꺼짐, localStorage 에 저장)을 켜면 모든 요청에 X-Site-Check: Y 를 실어 보낸다.
 *   백엔드는 로그인할 때 이 값을 보고 사이트의 모듈이 X-Module 과 다르면 로그인을 거부한다.
 */
import { csrGet } from "~/utils/svcHttp";
import type { SySiteType } from "~/types/sy/sySiteType";

/** 토글 저장 키 (localStorage, 'Y' / 'N') */
export const SITE_CHECK_STORAGE_KEY = "modu-fo-site-check";

export interface SiteModuleCheckState {
  /** 조회를 마쳤는가 (백엔드에 닿지 않으면 false 로 남아 표시하지 않는다) */
  checked: boolean;
  /** 짝이 맞지 않는가 */
  mismatch: boolean;
  /** 백엔드 sy_site 의 FO 모듈 (없으면 "") */
  siteModule: string;
  /** 마우스 오버 문구 */
  message: string;
}

export function useSiteModuleCheck() {
  const tenant = useTenant();
  const state = useState<SiteModuleCheckState>("siteModuleCheck", () => ({ checked: false, mismatch: false, siteModule: "", message: "" }));

  /** 백엔드 사이트 정보 조회 → 사이트·모듈 짝 판정 (앱 시작 때 1회) */
  async function run(): Promise<void> {
    if (state.value.checked) return;
    const mismatchMsg = `사이트(${tenant.siteId})와 모듈(${tenant.moduleId})가 맞지 않습니다.`;
    try {
      // 응답 봉투(ok/data)는 axiosCsr 가 벗겨 준다 — 사이트 객체가 바로 온다
      const site = await csrGet<SySiteType | null>(`/co/sy/site/${encodeURIComponent(tenant.siteId)}`);
      const siteModule = String(site?.tenantModule ?? "");
      const mismatch = !site || site.siteStatusCd !== "ACTIVE" || siteModule !== tenant.moduleId;
      state.value = {
        checked: true,
        mismatch,
        siteModule,
        message: !mismatch ? "" : !site ? `${mismatchMsg}\n(백엔드 sy_site 에 사이트가 없습니다)`
          : site.siteStatusCd !== "ACTIVE" ? `${mismatchMsg}\n(사이트 상태: ${site.siteStatusCd})`
          : `${mismatchMsg}\n(사이트의 FO 모듈: ${siteModule || "미지정"})`,
      };
      if (mismatch) console.warn(`[사이트 확인] ${state.value.message.replace("\n", " ")}`);
    } catch (e: any) {
      const status = Number(e?.statusCode ?? e?.response?.status ?? 0);
      if (status >= 400 && status < 500) {
        // 백엔드가 사이트를 모른다(400·404) — 짝이 맞지 않는 것으로 본다
        state.value = { checked: true, mismatch: true, siteModule: "", message: `${mismatchMsg}\n(백엔드가 사이트를 확인하지 못했습니다: ${status})` };
        console.warn(`[사이트 확인] ${state.value.message.replace("\n", " ")}`);
      } else {
        console.warn("[사이트 확인] 백엔드에 닿지 않아 사이트·모듈 확인을 건너뜁니다:", e?.message ?? e);
      }
    }
  }

  return { state, run };
}

/** FO 설정의 "사이트 정상여부 체크" 토글 — 기본 꺼짐, localStorage 에 계속 저장 */
export function useSiteCheckToggle() {
  const on = useState<boolean>("siteCheckOn", () => false);

  function load(): void {
    try {
      on.value = localStorage.getItem(SITE_CHECK_STORAGE_KEY) === "Y";
    } catch {
      on.value = false;
    }
  }

  function set(v: boolean): void {
    on.value = v;
    try {
      localStorage.setItem(SITE_CHECK_STORAGE_KEY, v ? "Y" : "N");
    } catch {
      /* 저장소를 쓸 수 없는 환경(사파리 비공개 등) — 이번 화면에서만 유지 */
    }
  }

  return { on, load, set, toggle: () => set(!on.value) };
}
