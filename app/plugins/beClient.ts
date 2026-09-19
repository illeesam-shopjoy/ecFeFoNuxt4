/**
 * beClient.ts — axiosCsr(ecBeBo 직접 호출)의 baseURL 과 CDN origin 을 앱 시작 시 주입한다 (서버·브라우저 공통).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { beConfig } from "~/utils/beConfig";

export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig();
  axiosCsr.defaults.baseURL = `${String(pub.beBaseUrl).replace(/\/+$/, "")}/api`;
  beConfig.cdnBase = String(pub.prodCdnBase);
});
