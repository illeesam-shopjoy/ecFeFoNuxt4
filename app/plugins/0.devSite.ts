/**
 * 0.devSite.ts — 개발 전용 "사이트 바꿔 보기" (2026-10-03, 사용자 요청: "상단에 siteId, module, 실행모드 표시될때 변경하여 화면 refresh 가능한가
 * 변경하면 강제 로그아웃 … 이건 개발에서만").
 *
 * - 모듈은 빌드마다 고정이다(nuxt.config 의 pages:extend·#tenant 가 그 모듈 화면·설정만 번들에 넣는다) — 실행 중에 바꿀 수 없다.
 *   다른 모듈은 그 모듈의 개발 주소(NAS 22001~22006)로 이동한다(app.vue 상단 개발 표시줄).
 * - 사이트(X-Site-Id)는 바꿔 볼 수 있다: 고른 사이트를 쿠키 `modu-dev-site-<모듈>` 에 두고, 이 플러그인이 useState("devSiteOverride")로 옮긴다.
 *   쿠키라 서버 렌더(SSR)도 같은 값을 읽어 화면이 어긋나지 않는다.
 * - 다른 모듈 개발 주소로 넘어올 때는 `?devSite=SI…` 로 사이트를 받는다 — 쿠키에 담고 주소에서는 지운다.
 * - 운영(mode=prod·production) 빌드에서는 아무 것도 하지 않는다(쿠키가 있어도 무시). useTenant().siteId 가 이 값을 먼저 쓴다.
 * 파일 이름이 0. 으로 시작해 beClient.ts(요청 헤더 X-Site-Id)보다 먼저 돈다. 공용 값은 utils/devSite.ts.
 */
import tenantConfig from "#tenant";
import { DEV_SITE_COOKIE_PREFIX, DEV_SITE_ID_RE, isProdRunMode } from "~/utils/devSite";

export default defineNuxtPlugin((nuxtApp) => {
  const pub = useRuntimeConfig().public;
  const state = useState<string>("devSiteOverride", () => "");
  if (isProdRunMode(pub.mode)) {
    state.value = "";
    return;
  }
  const buildSiteId = String(pub.siteId);
  const cookie = useCookie<string | null>(DEV_SITE_COOKIE_PREFIX + tenantConfig.id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });

  // 다른 모듈 개발 주소에서 넘어온 사이트 — 빌드 사이트와 같거나 모양이 틀리면 지운다
  const fromQuery = useRequestURL().searchParams.get("devSite");
  if (fromQuery !== null) {
    const v = fromQuery.trim();
    cookie.value = v && DEV_SITE_ID_RE.test(v) && v !== buildSiteId ? v : null;
  }
  const v = String(cookie.value ?? "").trim();
  state.value = v && DEV_SITE_ID_RE.test(v) && v !== buildSiteId ? v : "";

  // 주소의 devSite 는 지운다(새로고침해도 쿠키로 유지된다)
  if (import.meta.client && fromQuery !== null) {
    nuxtApp.hook("app:mounted", () => {
      const router = useRouter();
      const { devSite: _drop, ...rest } = router.currentRoute.value.query;
      void router.replace({ query: rest });
    });
  }
});
