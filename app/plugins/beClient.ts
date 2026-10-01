/**
 * beClient.ts — axiosCsr(ecBeBo 직접 호출)의 baseURL 과 CDN origin 을 앱 시작 시 주입한다 (서버·브라우저 공통).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { beConfig } from "~/utils/beConfig";

export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig();
  axiosCsr.defaults.baseURL = `${String(pub.beBaseUrl).replace(/\/+$/, "")}/api`;
  // 멀티테넌트: 이 배포의 사이트(sy_site.site_id)를 모든 요청에 실어 보낸다 — 백엔드는 이 값을 sy_site 와 대조해 사이트를 확정한다(토큰의 siteId 가 있으면 그것이 우선).
  axiosCsr.defaults.headers.common["X-Site-Id"] = String(pub.siteId);
  beConfig.cdnBase = String(pub.prodCdnBase);
});
