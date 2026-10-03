/**
 * beClient.ts — axiosCsr(ecBeBo 직접 호출)의 baseURL 과 CDN origin 을 앱 시작 시 주입한다 (서버·브라우저 공통).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { beConfig } from "~/utils/beConfig";
import { SITE_CHECK_STORAGE_KEY } from "~/composables/useSiteModuleCheck";

let interceptorAdded = false; // 개발서버 HMR 로 플러그인이 다시 돌아도 한 번만 건다

export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig();
  axiosCsr.defaults.baseURL = `${String(pub.beBaseUrl).replace(/\/+$/, "")}/api`;
  // 멀티테넌트: 이 배포의 사이트(sy_site.site_id)를 모든 요청에 실어 보낸다 — 백엔드는 이 값을 sy_site 와 대조해 사이트를 확정한다(토큰의 siteId 가 있으면 그것이 우선).
  axiosCsr.defaults.headers.common["X-Site-Id"] = String(pub.siteId);
  // 2026-10-03: 이 배포의 FO 모듈(ec1, danmoo1 …)도 함께 보낸다 — 백엔드가 사이트·모듈 짝을 확인할 수 있게(로그인 시 "사이트 정상여부 체크")
  axiosCsr.defaults.headers.common["X-Module"] = useTenant().moduleId;
  if (import.meta.client && !interceptorAdded) {
    interceptorAdded = true;
    // FO 설정의 "사이트 정상여부 체크" 토글이 켜져 있으면(localStorage) 요청마다 X-Site-Check: Y — 백엔드는 로그인 때 짝이 틀리면 거부한다
    axiosCsr.interceptors.request.use((config) => {
      try {
        if (localStorage.getItem(SITE_CHECK_STORAGE_KEY) === "Y") config.headers["X-Site-Check"] = "Y";
      } catch {
        /* 저장소를 쓸 수 없으면 체크하지 않는다 */
      }
      return config;
    });
  }
  beConfig.cdnBase = String(pub.prodCdnBase);
});
